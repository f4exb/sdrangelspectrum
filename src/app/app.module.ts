import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { WsspectrumComponent } from './wsspectrum/wsspectrum.component';

@NgModule({
  declarations: [
    AppComponent,
    WsspectrumComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
