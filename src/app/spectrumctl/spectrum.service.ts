import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { delay } from 'rxjs/operators';
import { GLSpectrumSettings } from './glspectrumsettings';
import { SpectrumServer } from './spectrumserver';

@Injectable({
  providedIn: 'root'
})
export class SpectrumService {

  constructor(private http: HttpClient) { }

  getSettings(url: string, devicesetIndex: number): Observable<GLSpectrumSettings> {
    return this.http.get<GLSpectrumSettings>(`${url}/deviceset/${devicesetIndex}/spectrum/settings`);
  }

  setSettings(url: string, devicesetIndex: number, settings: GLSpectrumSettings): Observable<any>  {
    const newurl = `${url}/deviceset/${devicesetIndex}/spectrum/settings`;
    const httpOptions = {
      headers: new HttpHeaders({
        accept:  'application/json',
        'Content-Type':  'application/json'
      })
    };
    return this.http.patch(newurl, JSON.stringify(settings), httpOptions).pipe(delay(500));
  }

  stopServer(url: string, devicesetIndex: number): Observable<any> {
    // delay returned observable by 3s to leave time for the hardware to change state
    return this.http.delete(`${url}/deviceset/${devicesetIndex}/spectrum/server`).pipe(delay(3000));
  }

  startServer(url: string, devicesetIndex: number): Observable<any> {
    // delay returned observable by 3s to leave time for the hardware to change state
    return this.http.post(`${url}/deviceset/${devicesetIndex}/spectrum/server`, null).pipe(delay(3000));
  }

  getServer(url: string, devicesetIndex: number): Observable<SpectrumServer> {
    return this.http.get<SpectrumServer>(`${url}/deviceset/${devicesetIndex}/spectrum/server`);
  }
}
