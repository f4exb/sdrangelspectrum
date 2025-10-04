import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { HttpClientModule } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';

import { AppComponent } from './app.component';
import { WsspectrumComponent } from './wsspectrum/wsspectrum.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { SpectrumctlComponent } from './spectrumctl/spectrumctl.component';
import { InstanceSummaryComponent } from './instance-summary/instance-summary.component';

@NgModule({
  declarations: [
    AppComponent,
    WsspectrumComponent,
    SpectrumctlComponent,
    InstanceSummaryComponent
  ],
  imports: [
    BrowserModule,
    NoopAnimationsModule,
    MatCardModule,
    MatTooltipModule,
    MatSelectModule,
    FormsModule,
    HttpClientModule,
    MatIconModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
