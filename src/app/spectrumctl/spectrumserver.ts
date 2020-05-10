export interface SpectrumClient {
  address: string;
  port: number;
}

export interface SpectrumServer {
  clients?: SpectrumClient[];
  listeningAddress?: string;
  listeningPort?: number;
  run: boolean;
}

export const SPECTRUM_SERVER_DEFAULT = {
  run: false
};
