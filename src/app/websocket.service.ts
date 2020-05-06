import { Injectable } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { Observable } from 'rxjs';
import { Spectrum } from './spectrum';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  constructor() { }
  private connection: WebSocketSubject<any>;

  public connect(wsUrl: string): Observable<Spectrum> {
    this.connection = webSocket({
        url: wsUrl,
        binaryType: 'arraybuffer',
        deserializer: ({data}) => {
            const indicators = new Uint32Array(data, 32, 1)[0];
            const spectrum: Spectrum = {
                centerFrequency: new BigUint64Array(data, 0, 1)[0],
                elapsedMs: new BigUint64Array(data, 8, 1)[0],
                timestampMs: new BigUint64Array(data, 16, 1)[0],
                fftSize: new Uint32Array(data, 24, 1)[0],
                bandwidth: new Uint32Array(data, 28, 1)[0],
                linear: (indicators & 0x1) !== 0,
                ssb: (indicators & 0x2) !== 0,
                usb: (indicators & 0x4) !== 0,
                spectrum: new Float32Array(data, 36)
            };
            return spectrum;
        }
    });
    return this.connection;
  }

  // for completeness - unused normally
  public send(request: any) {
    this.connection.next(request);
  }
}
