import { Component, OnInit } from '@angular/core';
import { SdrangelUrlService } from '../sdrangel-url.service';
import { SpectrumService } from './spectrum.service';
import { GLSpectrumSettings, GLSPECTRUM_SETTINGS_DEFAULT } from './glspectrumsettings';
import { SpectrumServer, SPECTRUM_SERVER_DEFAULT } from './spectrumserver';
import { Utils } from 'src/app/common-components/utils';

export interface FFTWindow {
  value: number;
  viewValue: string;
}

export interface FFTSize {
  value: number;
  viewValue: string;
}

export interface AveragingMode {
  value: number;
  viewValue: string;
}

export interface AveragingValue {
  value: number;
  viewValue: string;
}

@Component({
  selector: 'app-spectrumctl',
  templateUrl: './spectrumctl.component.html',
  styleUrls: ['./spectrumctl.component.css']
})
export class SpectrumctlComponent implements OnInit {
  sdrangelURL: string;
  deviceIndex = 0;
  settings: GLSpectrumSettings = GLSPECTRUM_SETTINGS_DEFAULT;
  spectrumServer: SpectrumServer = SPECTRUM_SERVER_DEFAULT;
  statusMessage: string;
  statusError = false;
  fftWindows: FFTWindow[] = [
    {value: 0, viewValue: 'Bartlett'},
    {value: 1, viewValue: 'B-Harris'},
    {value: 2, viewValue: 'Flattop'},
    {value: 3, viewValue: 'Hamming'},
    {value: 4, viewValue: 'Hanning'},
    {value: 5, viewValue: 'Rectangle'},
    {value: 6, viewValue: 'Kaiser'},
  ];
  fftSizes: FFTSize[] = [
    {value: 64, viewValue: '64'},
    {value: 128, viewValue: '128'},
    {value: 256, viewValue: '256'},
    {value: 512, viewValue: '512'},
    {value: 1024, viewValue: '1k'},
    {value: 2048, viewValue: '2k'},
    {value: 4096, viewValue: '4k'},
  ];
  averagingModes: AveragingMode[] = [
    {value: 0, viewValue: 'None'},
    {value: 1, viewValue: 'Moving'},
    {value: 2, viewValue: 'Fixed'},
    {value: 3, viewValue: 'Max'},
  ];
  averagingValues: AveragingValue[] = [
    {value: 1, viewValue: '1'},
    {value: 2, viewValue: '2'},
    {value: 5, viewValue: '5'},
    {value: 10, viewValue: '10'},
    {value: 20, viewValue: '20'},
    {value: 50, viewValue: '50'},
    {value: 100, viewValue: '100'},
    {value: 200, viewValue: '200'},
    {value: 500, viewValue: '500'},
    {value: 1000, viewValue: '1k'},
    {value: 2000, viewValue: '2k'},
    {value: 5000, viewValue: '5k'},
    {value: 10000, viewValue: '10k'},
    {value: 20000, viewValue: '20k'},
    {value: 50000, viewValue: '50k'},
    {value: 100000, viewValue: '100k'},
    {value: 200000, viewValue: '200k'},
    {value: 500000, viewValue: '500k'},
    {value: 1000000, viewValue: '1M'},
  ];
  constructor(private sdrangelUrlService: SdrangelUrlService,
              private spectrumService: SpectrumService) { }

  ngOnInit(): void {
    this.sdrangelUrlService.currentUrlSource.subscribe(url => {
      this.sdrangelURL = url;
      this.getSpectrumSettings();
      this.getServer();
    });
  }

  getSpectrumSettings() {
    this.spectrumService.getSettings(this.sdrangelURL, this.deviceIndex).subscribe(
      spectrumSettings => {
        this.statusMessage = 'OK';
        this.statusError = false;
        this.settings = spectrumSettings;
      }
    );
  }

  private setSpecttrumSettings(spectrumSettings: GLSpectrumSettings) {
    this.spectrumService.setSettings(this.sdrangelURL, this.deviceIndex, spectrumSettings).subscribe(
      res => {
        this.statusMessage = 'OK';
        this.statusError = false;
        Utils.delayObservable(1000).subscribe(
          _ => { this.getSpectrumSettings(); }
        );
      },
      error => {
        this.statusMessage = error.message;
        this.statusError = true;
      }
    );
  }

  getServer() {
    this.spectrumService.getServer(this.sdrangelURL, this.deviceIndex).subscribe(
      spectrumServer => {
        this.spectrumServer = spectrumServer;
      }
    );
  }

  startServer() {
    this.spectrumService.startServer(this.sdrangelURL, this.deviceIndex).subscribe(
      res => {
        console.log('Started OK', res);
      },
      error => {
        console.log(error);
      }
    );
    this.getServer();
  }

  stopServer() {
    this.spectrumService.stopServer(this.sdrangelURL, this.deviceIndex).subscribe(
      res => {
        console.log('Stopped OK', res);
      },
      error => {
        console.log(error);
      }
    );
    this.getServer();
  }

  onDeviceIndexChanged(): void {
    this.getSpectrumSettings();
    this.getServer();
  }

  setWsSpectrumAddress(): void {
    const newSettings: GLSpectrumSettings = {} as GLSpectrumSettings;
    newSettings.wsSpectrumAddress = this.settings.wsSpectrumAddress;
    this.setSpecttrumSettings(newSettings);
  }

  setWsSpectrumPort(): void {
    const newSettings: GLSpectrumSettings = {} as GLSpectrumSettings;
    newSettings.wsSpectrumPort = this.settings.wsSpectrumPort;
    this.setSpecttrumSettings(newSettings);
  }

  setFFTWindow(): void {
    const newSettings: GLSpectrumSettings = {} as GLSpectrumSettings;
    newSettings.fftWindow = this.settings.fftWindow;
    this.setSpecttrumSettings(newSettings);
  }

  setFFTSize(): void {
    const newSettings: GLSpectrumSettings = {} as GLSpectrumSettings;
    newSettings.fftSize = this.settings.fftSize;
    this.setSpecttrumSettings(newSettings);
  }

  setAveragingMode(): void {
    const newSettings: GLSpectrumSettings = {} as GLSpectrumSettings;
    newSettings.averagingMode = this.settings.averagingMode;
    this.setSpecttrumSettings(newSettings);
  }

  setAveragingValue(): void {
    const newSettings: GLSpectrumSettings = {} as GLSpectrumSettings;
    newSettings.averagingValue = this.settings.averagingValue;
    this.setSpecttrumSettings(newSettings);
  }

  getServerStatusColor(): string {
    if (this.spectrumServer.run) {
      return 'rgb(50, 180, 50)';
    } else {
      return 'grey';
    }
  }

  getFFTWindowName(): string {
    const fftWindow = this.fftWindows.find(w => w.value === this.settings.fftWindow);
    return fftWindow ? fftWindow.viewValue : 'Unknown';
  }

  getFFTSizeName(): string {
    const fftSize = this.fftSizes.find(s => s.value === this.settings.fftSize);
    return fftSize ? fftSize.viewValue : 'Unknown';
  }

  getAvgeragingModeName(): string {
    const averagingMode = this.averagingModes.find(m => m.value === this.settings.averagingMode);
    return averagingMode ? averagingMode.viewValue : 'Unknown';
  }

  getAveragingValueName(): string {
    const averagingValue = this.averagingValues.find(v => v.value === this.settings.averagingValue);
    return averagingValue ? averagingValue.viewValue : 'Unknown';
  }
}
