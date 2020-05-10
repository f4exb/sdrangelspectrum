export interface Device {
  bandwidth: number;
  centerFrequency: number;
  hwType: string;
  index: number;
  deviceNbStreams: number;
  sequence: number;
  serial?: string;
  state: string;
  deviceStreamIndex: number;
  direction: number;
}
