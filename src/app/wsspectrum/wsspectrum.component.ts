import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
import { Spectrum, SPECTRUM_DEFAULT } from '../spectrum';
import { WebsocketService } from '../websocket.service';
import { SdrangelUrlService } from '../sdrangel-url.service';
import { Utils } from 'src/app/common-components/utils';

interface Tick {
    axisValue: number;
    value: number;
}

@Component({
  selector: 'app-wsspectrum',
  templateUrl: './wsspectrum.component.html',
  styleUrls: ['./wsspectrum.component.css']
})
export class WsspectrumComponent implements OnInit {
  @Input('width') width: number;
  sdrangelURL: string;
  wsHost = '127.0.0.1';
  wsPort = 8887;
  wsUri = 'ws://127.0.0.1:8887';
  spectrum: Spectrum = SPECTRUM_DEFAULT;
  NMARKERS = 4;   // number of markers either side of centre
  POW_WIDTH = 60; // width in pixels of power scale
  FREQ_TICK_SPACE = 80;
  POWER_TICK_SPACE = 20;
  TIME_TICK_SPACE = 30;
  refLevelDb = -40.0;
  refLevelLin = 1e-4;
  powerRangeDb = 60.0;
  powerRangeLin = 1e-4;
  frequencyTicks: Tick[] = [];
  powerTicks: Tick[] = [];
  timeTicks: Tick[] = [];
  initPowerScale: boolean;
  fftTimes: number[] = [];
  fftTimeIndex = 0;

  @ViewChild('cspectrum', { static: true })
  cspectrum: ElementRef<HTMLCanvasElement>;
  @ViewChild('cspectrumGrid', { static: true })
  cspectrumGrid: ElementRef<HTMLCanvasElement>;
  @ViewChild('cfreqScale', { static: true })
  cfreqScale: ElementRef<HTMLCanvasElement>;
  @ViewChild('cfreqUnits', { static: true })
  cfreqUnits: ElementRef<HTMLCanvasElement>;
  @ViewChild('cpowScale', { static: true })
  cpowScale: ElementRef<HTMLCanvasElement>;
  @ViewChild('cwaterfall', { static: true })
  cwaterfall: ElementRef<HTMLCanvasElement>;
  @ViewChild('cwaterfallGrid', { static: true })
  cwaterfallGrid: ElementRef<HTMLCanvasElement>;
  @ViewChild('ctimeScale', { static: true })
  ctimeScale: ElementRef<HTMLCanvasElement>;

  private ctxSpectrum: CanvasRenderingContext2D;
  private ctxSpectrumGrid: CanvasRenderingContext2D;
  private ctxFreqScale: CanvasRenderingContext2D;
  private ctxFreqUnits: CanvasRenderingContext2D;
  private ctxPowScale: CanvasRenderingContext2D;
  private ctxWaterfall: CanvasRenderingContext2D;
  private ctxWaterfallGrid: CanvasRenderingContext2D;
  private ctxTimeScale: CanvasRenderingContext2D;

  constructor(private sdrangelUrlService: SdrangelUrlService,
              private wsService: WebsocketService) {
    this.connect(this.wsUri);
    this.sdrangelUrlService.currentUrlSource.subscribe(url => {
      this.sdrangelURL = url;
      this.constructWsUri();
    });
  }

  private connect(uri: string) {
    this.wsService.connect(uri).subscribe(spectrum => {
      this.processSpectrum(spectrum);
    });
  }

  private disconnect() {
    this.wsService.disconnect();
  }

  private processSpectrum(spectrum: Spectrum): void {
    this.pushFFTTime(Number(spectrum.elapsedMs));
    this.timeTicks = this.getTimeTicks();
    if ((spectrum.centerFrequency !== this.spectrum.centerFrequency)
    || (spectrum.bandwidth !== this.spectrum.bandwidth)
    || (spectrum.ssb !== this.spectrum.ssb)
    || (spectrum.usb !== this.spectrum.usb)) {
      this.frequencyTicks = this.getFrequencyTicks(
          this.getSpectrumWidth(),
          spectrum.centerFrequency,
          spectrum.bandwidth,
          spectrum.ssb,
          spectrum.usb);
      this.drawSpectrumGrid(this.frequencyTicks, this.powerTicks);
      this.drawWaterfallGrid(this.frequencyTicks, this.timeTicks);
      this.drawFreqScale(this.frequencyTicks);
      const centerFrequency: bigint = spectrum.ssb ? spectrum.centerFrequency + BigInt(spectrum.bandwidth) : spectrum.centerFrequency;
      this.drawFreqUnits(centerFrequency);
    }
    if (this.initPowerScale || (spectrum.linear !== this.spectrum.linear)) {
      this.powerTicks = this.getPowerTicks(this.getSpectrumHeight());
      this.drawPowScale(this.powerTicks);
      this.initPowerScale = false;
    }
    this.drawSpectrum(spectrum.fftSize, spectrum.spectrum, spectrum.linear);
    this.drawWaterfall(spectrum.fftSize, spectrum.spectrum, spectrum.linear);
    this.drawTimeScale(this.timeTicks);
    this.spectrum = spectrum;
  }

  constructWsUri() {
    const apiData = Utils.parseUri(this.sdrangelURL);
    // tslint:disable-next-line:no-string-literal
    this.wsHost = apiData['host'];
    this.wsUri = 'ws://' + this.wsHost + ':' + this.wsPort.toString();
    this.reconnect();
  }

  onUriChanged() {
    const apiData = Utils.parseUri(this.wsUri);
    // tslint:disable-next-line:no-string-literal
    this.wsHost = apiData['host'];
    // tslint:disable-next-line:no-string-literal
    this.wsPort = Number(apiData['port']);
    this.reconnect();
  }

  onPortChanged() {
    this.wsUri = 'ws://' + this.wsHost + ':' + this.wsPort.toString();
    this.reconnect();
  }

  reconnect() {
    this.disconnect();
    this.connect(this.wsUri);
  }

  ngOnInit(): void {
    this.ctxSpectrum = this.cspectrum.nativeElement.getContext('2d');
    this.ctxSpectrumGrid = this.cspectrumGrid.nativeElement.getContext('2d');
    this.ctxFreqScale = this.cfreqScale.nativeElement.getContext('2d');
    this.ctxFreqUnits = this.cfreqUnits.nativeElement.getContext('2d');
    this.ctxPowScale = this.cpowScale.nativeElement.getContext('2d');
    this.powerTicks = this.getPowerTicks(this.getSpectrumHeight());
    this.ctxWaterfall = this.cwaterfall.nativeElement.getContext('2d');
    this.ctxWaterfallGrid = this.cwaterfallGrid.nativeElement.getContext('2d');
    this.ctxTimeScale = this.ctimeScale.nativeElement.getContext('2d');
    this.initPowerScale = true;
  }

  getSpectrumHeight() {
    return this.width / 4;
  }

  getSpectrumWidth() {
    return this.width - this.POW_WIDTH;
  }

  getSpectrumLeft() {
    return this.getPowScaleWidth();
  }

  getPowScaleWidth() {
    return this.POW_WIDTH;
  }

  getFormattedDate() {
      const date = new Date(Number(this.spectrum.timestampMs));
      return date.toISOString();
  }

  getLinLog(): string {
    if (this.spectrum.linear) {
        return 'Linear';
    } else {
        return 'Log';
    }
  }

  getSpectrumDirection(): string {
    if (this.spectrum.ssb) {
      if (this.spectrum.usb) {
        return 'USB';
      } else {
        return 'LSB';
      }
    } else {
      return 'DSB';
    }
  }

  getSsbDsb(): string {
    if (this.spectrum.ssb) {
        return 'SSB';
    } else {
        return 'DSB';
    }
  }

  getUsbLsb(): string {
    if (this.spectrum.usb) {
        return 'USB';
    } else {
        return 'LSB';
    }
  }

  drawSpectrumGrid(frequencyTicks: Tick[], powerTicks: Tick[]): void {
    if (this.cspectrumGrid == null) {
      return;
    }

    const ctx = this.ctxSpectrumGrid;
    const w = this.cspectrumGrid.nativeElement.width;
    const h = this.cspectrumGrid.nativeElement.height;

    // Clear grid canvas
    ctx.fillStyle = 'rgba(0, 0, 0, 1.0)';
    ctx.globalCompositeOperation = 'destination-out'; // clear foreground
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'source-over';

    // Redraw frequency grid
    ctx.beginPath();
    frequencyTicks.forEach(tick => {
      ctx.moveTo(tick.axisValue, 0);
      ctx.lineTo(tick.axisValue, h);
    });
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.stroke();

    // Redraw power grrid
    ctx.beginPath();
    powerTicks.forEach(tick => {
      ctx.moveTo(0, tick.axisValue);
      ctx.lineTo(w, tick.axisValue);
    });
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.stroke();
  }

  drawWaterfallGrid(frequencyTicks: Tick[], timeTicks: Tick[]): void {
    if (this.cwaterfallGrid == null) {
      return;
    }

    const ctx = this.ctxWaterfallGrid;
    const w = this.cwaterfallGrid.nativeElement.width;
    const h = this.cwaterfallGrid.nativeElement.height;

    // Clear grid canvas
    ctx.fillStyle = 'rgba(0, 0, 0, 1.0)';
    ctx.globalCompositeOperation = 'destination-out'; // clear foreground
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'source-over';

    // Redraw frequency grid
    ctx.beginPath();
    frequencyTicks.forEach(tick => {
      ctx.moveTo(tick.axisValue, 0);
      ctx.lineTo(tick.axisValue, h);
    });
    ctx.strokeStyle = 'rgba(180, 188, 255, 0.75)';
    ctx.stroke();

    // Redraw time grid
    ctx.beginPath();
    timeTicks.forEach(tick => {
      ctx.moveTo(0, tick.axisValue);
      ctx.lineTo(w, tick.axisValue);
    });
    ctx.strokeStyle = 'rgba(192, 192, 255, 0.75)';
    ctx.stroke();
  }

  drawFreqScale(ticks: Tick[]): void {
    if (this.cfreqScale == null) {
      return;
    }

    const ctx = this.ctxFreqScale;
    const w = this.cfreqScale.nativeElement.width;
    const h = this.cfreqScale.nativeElement.height;

    // Clear scale
    ctx.fillStyle = 'rgba(225, 225, 205,1.0)';
    ctx.fillRect(0, 0, w, h);

    // Redraw scale text
    ctx.font = '13px Courier';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'black';
    let scaleFactor = 1;
    let nbDecimals = 3;
    if (ticks.length > 0) {
      scaleFactor = this.getFrquencyScale(ticks[ticks.length - 1].value);
    }
    if (ticks.length > 1) {
      const freqStep = ticks[1].value > ticks[0].value ? ticks[1].value - ticks[0].value : ticks[0].value - ticks[1].value;
      nbDecimals = Math.log10(scaleFactor) - Math.floor(Math.log10(freqStep));
      nbDecimals = nbDecimals < 0 ? -nbDecimals : nbDecimals;
    }
    ticks.forEach(tick => {
      const label = (tick.value / scaleFactor).toFixed(nbDecimals).toString();
      ctx.fillText(label, tick.axisValue, h - 4);
    });
  }

  drawFreqUnits(centerFrequency: bigint): void {
    if (this.cfreqUnits == null) {
      return;
    }

    const ctx = this.ctxFreqUnits;
    const w = this.cfreqUnits.nativeElement.width;
    const h = this.cfreqUnits.nativeElement.height;

    ctx.fillStyle = 'rgba(225, 225, 205, 1.0)';
    ctx.fillRect(0, 0, w, h);

    // Redraw units
    ctx.font = '13px Courier';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'black';
    const shift = this.getPowScaleWidth() / 2;
    if (centerFrequency < 1000) {
        ctx.fillText('Hz', shift, h - 4);
    } else if (centerFrequency < 1000000) {
        ctx.fillText('kHz', shift, h - 4);
    } else if (centerFrequency < 1000000000) {
        ctx.fillText('MHz', shift, h - 4);
    } else if (centerFrequency < 1000000000000) {
        ctx.fillText('GHz', shift, h - 4);
    } else {
        ctx.fillText('THz', shift, h - 4);
    }
  }

  getFrquencyScale(freq: number): number {
    if (freq < 1000) {
      return 1;
    } else if (freq < 1000000) {
      return 1000;
    } else if (freq < 1000000000) {
      return 1000000;
    } else if (freq < 1000000000000) {
      return 1000000000;
    } else {
      return 1000000000000;
    }
  }

  drawPowScale(ticks: Tick[]): void {
    if (this.cpowScale == null) {
      return;
    }

    const ctx = this.ctxPowScale;
    const w = this.cpowScale.nativeElement.width;
    const h = this.cpowScale.nativeElement.height;

    // Clear scale
    ctx.fillStyle = 'rgba(245, 245, 225, 1.0)';
    ctx.fillRect(0, 0, w, h);

    // Redraw power scale
    ctx.font = '13px Courier';
    ctx.textAlign = 'right';
    ctx.fillStyle = 'black';

    ticks.forEach(tick => {
      let label: string;
      if (this.spectrum.linear) {
        label = tick.value.toExponential(2);
      } else {
        label = tick.value.toString();
      }
      ctx.fillText(label, this.getPowScaleWidth() - 2, tick.axisValue);
    });
  }

  drawTimeScale(ticks: Tick[]): void {
    if (this.ctimeScale == null) {
      return;
    }

    const ctx = this.ctxTimeScale;
    const w = this.ctimeScale.nativeElement.width;
    const h = this.ctimeScale.nativeElement.height;

    // Clear scale
    ctx.fillStyle = 'rgba(245, 245, 225, 1.0)';
    ctx.fillRect(0, 0, w, h);

    // Redraw time scale
    ctx.font = '13px Courier';
    ctx.textAlign = 'right';
    ctx.fillStyle = 'black';

    ticks.forEach(tick => {
      let label: string;
      if (tick.value !== 0) { // 0 is a N/A value
        label = (tick.value / 1000).toFixed(1);
        ctx.fillText(label, this.getPowScaleWidth() - 2, tick.axisValue);
      }
    });
  }

  drawSpectrum(fftSize: number, series: Float32Array, linear: boolean) {
    if (this.cspectrum == null) {
      return;
    }

    let refLevel: number;
    let powerRange: number;

    if (linear) {
        refLevel = this.refLevelLin;
        powerRange = this.powerRangeLin;
    } else {
        refLevel = this.refLevelDb;
        powerRange = this.powerRangeDb;
    }

    const ctx = this.ctxSpectrum;
    const w = this.cspectrum.nativeElement.width / fftSize;
    ctx.fillStyle = 'rgba(255, 248, 180, 1.0)';
    ctx.fillRect(0, 0, this.cspectrum.nativeElement.width, this.cspectrum.nativeElement.height);
    ctx.beginPath();

    for (let bin = 0; bin < fftSize; bin++) {
      const xPos = Math.floor(bin * w);
      let pow: number = (refLevel - series[bin]) / powerRange;
      pow = (pow < 0.0) ? 0.0 : (pow > 1.0) ? 1.0 : pow;
      const yPos = Math.floor(this.cspectrum.nativeElement.height * pow);
      if (bin === 0) {
        ctx.moveTo(xPos, yPos);
      } else {
        ctx.lineTo(xPos, yPos);
      }
    }

    ctx.strokeStyle = 'black';
    ctx.stroke();
  }

  drawWaterfall(fftSize: number, series: Float32Array, linear: boolean) {
    if (this.cwaterfall == null) {
      return;
    }

    let refLevel: number;
    let powerRange: number;

    if (linear) {
        refLevel = this.refLevelLin;
        powerRange = this.powerRangeLin;
    } else {
        refLevel = this.refLevelDb;
        powerRange = this.powerRangeDb;
    }

    const ctx = this.ctxWaterfall;
    const h = this.cwaterfall.nativeElement.height;
    const w = this.cwaterfall.nativeElement.width;
    const wx = fftSize / w;

    const image = ctx.getImageData(0, 0, w, h - 1);
    ctx.putImageData(image, 0, 1);
    const imgdata = ctx.getImageData(0, 0, w, 1);

    for (let xPos = 0; xPos < w; xPos++) {
      const bin = Math.floor(xPos * wx);
      let pow: number = (refLevel - series[bin]) / powerRange; // 0.0 -> 1.0 range high to low
      pow = (pow < 0.0) ? 0.0 : (pow > 1.0) ? 1.0 : pow;
      imgdata.data[4 * xPos] = this.powToRed(pow);
      imgdata.data[4 * xPos + 1] = this.powToGreen(pow);
      imgdata.data[4 * xPos + 2] = this.powToBlue(pow);
      imgdata.data[4 * xPos + 3] = 255;
    }

    ctx.putImageData(imgdata, 0, 0);
  }

  private powToRed(pow: number): number {
    return 255 * pow;
  }

  private powToGreen(pow: number): number {
    return 248 * pow; // (497 * pow) % 249;
  }

  private powToBlue(pow: number): number {
    return 180 * pow; // (361 * pow) % 181; // 180 * pow;
  }

  onPowerScaleChanged() {
    this.refLevelLin = Math.pow(10, this.refLevelDb / 10);
    this.powerRangeLin = this.refLevelLin;
    this.powerTicks = this.getPowerTicks(this.getSpectrumHeight());
    this.drawSpectrumGrid(this.frequencyTicks, this.powerTicks);
    this.drawPowScale(this.powerTicks);
  }

  getFrequencyTicks(axisSpan: number, centerFrequency: bigint, bandwidth: number, ssb: boolean, usb: boolean): Tick[] {
    const nbTicks = Math.floor(axisSpan / this.FREQ_TICK_SPACE); // optimal number of ticks
    const freqStep = this.getFrequencyStep(bandwidth / nbTicks);
    const freqDensity = axisSpan / bandwidth;
    let absFreqStart: number;
    let absFreqStop: number;

    if (ssb) {
      absFreqStart = Number(centerFrequency);
      absFreqStop = Number(centerFrequency) + bandwidth;
    } else {
      absFreqStart = Number(centerFrequency) - (bandwidth / 2);
      absFreqStop = Number(centerFrequency) + (bandwidth / 2);
    }

    const freqStart = (Math.floor(absFreqStart / freqStep) + 1) * freqStep;
    const ticks: Tick[] = [];
    for (let f = freqStart; f < absFreqStop; f += freqStep) {
      ticks.push({
        axisValue: Math.floor((f - absFreqStart) * freqDensity),
        value: usb ? f : -f
      });
    }

    return ticks;
  }

  getFrequencyStep(rawStep: number): number {
    const s = Math.pow(10, Math.floor(Math.log10(rawStep)));
    if (rawStep < 2 * s) {
        return 2 * s;
    } else if (rawStep < 5 * s) {
        return 5 * s;
    } else {
        return 10 * s;
    }
  }

  getPowerTicks(axisSpan: number): Tick[] {
    let refLevel: number;
    let powerRange: number;

    if (this.spectrum.linear) {
      refLevel = this.refLevelLin;
      powerRange = this.powerRangeLin;
    } else {
      refLevel = this.refLevelDb;
      powerRange = this.powerRangeDb;
    }

    const nbTicks = Math.floor(axisSpan / this.POWER_TICK_SPACE); // optimal number of ticks
    const powerStep = this.getPowerStep(powerRange / nbTicks);
    const powerDensity = axisSpan / powerRange;
    const absPowerStart = refLevel;
    const absPowerStop = refLevel - powerRange;
    const powerStart = Math.floor(absPowerStart / powerStep) * powerStep;
    const ticks: Tick[] = [];
    for (let p = powerStart; p > absPowerStop; p -= powerStep) {
      ticks.push({
        axisValue: Math.floor((absPowerStart - p) * powerDensity),
        value: p
      });
    }
    return ticks;
  }

  getPowerStep(rawStep: number): number {
    const p = Math.floor(Math.log10(rawStep));
    const s = Math.pow(10, p);
    const d = Math.floor(rawStep / s);
    if (this.spectrum.linear) {
      if (d < 2) {
        return 2 * s;
      } else if (d < 4) {
        return 4 * s;
      } else if (d < 6) {
        return 5 * s;
      } else {
        return 10 * s;
      }
    } else {
      if (rawStep < 2 * s) {
        return 2 * s;
      } else if (rawStep < 5 * s) {
        return 5 * s;
      } else {
        return 10 * s;
      }
    }
  }

  getTimeTicks(): Tick[] {
    const ticks: Tick[] = [];
    let timeCounter = 0;
    for (let i = 0; i < this.getSpectrumHeight(); i++) {
      timeCounter += this.getFFTTime(i);
      if ((i !== 0) && (i % this.TIME_TICK_SPACE === 0)) {
        ticks.push({
            axisValue: i,
            value: this.getFFTTime(i) === 0 ? 0 : timeCounter
        });
      }
    }
    return ticks;
  }

  private pushFFTTime(fftTime: number): void {
      if (this.fftTimes.length < this.getSpectrumHeight()) {
        this.fftTimes.push(fftTime);
        this.fftTimeIndex = this.fftTimes.length - 1;
      } else {
        if (this.fftTimeIndex < this.getSpectrumHeight() - 1) {
          this.fftTimeIndex++;
        } else {
            this.fftTimeIndex = 0;
        }
        this.fftTimes[this.fftTimeIndex] = fftTime;
      }
  }

  private getFFTTime(index: number): number {
    if (index < this.fftTimes.length) {
      if (this.fftTimeIndex < index) {
        return this.fftTimes[this.getSpectrumHeight() - (index - this.fftTimeIndex)];
      } else {
        return this.fftTimes[this.fftTimeIndex - index];
      }
    }
    return 0;
  }
}
