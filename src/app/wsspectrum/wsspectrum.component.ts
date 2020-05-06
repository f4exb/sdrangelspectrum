import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Spectrum, SPECTRUM_DEFAULT } from '../spectrum';
import { WebsocketService } from '../websocket.service';

@Component({
  selector: 'app-wsspectrum',
  templateUrl: './wsspectrum.component.html',
  styleUrls: ['./wsspectrum.component.css']
})
export class WsspectrumComponent implements OnInit {
  spectrum: Spectrum = SPECTRUM_DEFAULT;
  NMARKERS = 3; // number of markers either side of centre
  refLevel = -40.0;
  powerRange = 60.0;

  @ViewChild('cspectrum', { static: true })
  cspectrum: ElementRef<HTMLCanvasElement>;
  @ViewChild('cscale', { static: true })
  cscale: ElementRef<HTMLCanvasElement>;
  private ctxSpectrum: CanvasRenderingContext2D;
  private ctxScale: CanvasRenderingContext2D;

  constructor(private wsService: WebsocketService) {
      wsService.connect('ws://127.0.0.1:8887').subscribe(spectrum => {
        if ((spectrum.centerFrequency !== this.spectrum.centerFrequency) || (spectrum.bandwidth !== this.spectrum.bandwidth)) {
          this.drawScale(spectrum.centerFrequency, spectrum.bandwidth);
        }
        this.drawSpectrum(spectrum.fftSize, spectrum.spectrum);
        this.spectrum = spectrum;
      });
    }

  ngOnInit(): void {
    this.ctxSpectrum = this.cspectrum.nativeElement.getContext('2d');
    this.ctxSpectrum.fillStyle = 'black';
    this.ctxSpectrum.fillRect(0, 0, this.cspectrum.nativeElement.width, this.cspectrum.nativeElement.height);
    this.ctxScale = this.cscale.nativeElement.getContext('2d');
  }

  getFormattedDate() {
      const date = new Date(Number(this.spectrum.timestampMs));
      return date.toISOString();
  }

  drawScale(centerFrequency: bigint, sampleRate: number): void {
    if (this.cscale == null) {
      return;
    }

    const ctx = this.ctxScale;
    const w = this.cscale.nativeElement.width;
    const h = this.cscale.nativeElement.height;

    // Clear scale canvas
    ctx.fillStyle = 'rgba(0,0,0,1.0)';
    ctx.globalCompositeOperation = 'destination-out'; // clear foreground
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(0,0,255,0.5)';
    ctx.fillRect(0, h - 18, w, 18);

    // Redraw scale text
    ctx.font = '15px Arial';
    ctx.textAlign = 'center';
    ctx.strokeStyle = 'white';
    let freq: number = Number(centerFrequency - BigInt(sampleRate / 2));
    for (let n = 0; n < this.NMARKERS * 2 + 1; n++) {
      const xPos = n * w / this.NMARKERS / 2;
      const label = (Number(freq) / 1000000.0).toFixed(3).toString();
      ctx.strokeText(label, xPos, h - 2);
      freq = freq + (sampleRate / this.NMARKERS / 2);
    }

    // Redraw markers
    ctx.beginPath();
    for (let n = 1; n < this.NMARKERS * 2; n++) {
      const xPos = n * w / this.NMARKERS / 2;
      ctx.moveTo(xPos, 0);
      ctx.lineTo(xPos, h - 15);
    }
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.stroke();
  }

  drawSpectrum(fftSize: number, series: Float32Array) {
    if (this.cspectrum == null) {
      return;
    }

    const ctx = this.ctxSpectrum;
    const w = this.cspectrum.nativeElement.width / fftSize;
    ctx.fillStyle = 'rgba(0,0,0,1.0)';
    ctx.fillRect(0, 0, this.cspectrum.nativeElement.width, this.cspectrum.nativeElement.height);
    ctx.beginPath();

    for (let bin = 0; bin < fftSize; bin++) {
      const xPos = Math.floor(bin * w);
      let pow: number = (this.refLevel - series[bin]) / this.powerRange;
      pow = (pow < 0.0) ? 0.0 : (pow > 1.0) ? 1.0 : pow;
      const yPos = Math.floor(this.cspectrum.nativeElement.height * pow);
      if (bin === 0) {
        ctx.moveTo(xPos, yPos);
      } else {
        ctx.lineTo(xPos, yPos);
      }
    }

    ctx.strokeStyle = 'yellow';
    ctx.stroke();
  }
}
