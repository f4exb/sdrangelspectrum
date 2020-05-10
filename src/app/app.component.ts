import { Component, ElementRef } from '@angular/core';
import { SdrangelUrlService } from './sdrangel-url.service';
import { Utils } from 'src/app/common-components/utils';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'SDRangelSpectrum';
  version = '1.0.0';
  sdrangelURL = 'http://127.0.0.1:8091/sdrangel'; // the default URL

  constructor(private sdrangelUrlService: SdrangelUrlService,
              private elementRef: ElementRef) {
    this.sdrangelURL = 'http://' + window.location.hostname + ':8091/sdrangel';
  }

  validateURL() {
    this.sdrangelUrlService.changeURL(this.sdrangelURL);
  }
}
