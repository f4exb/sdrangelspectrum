import { DeviceSet } from 'src/app/deviceset/deviceset/deviceset';

export interface InstanceSummary {
    appname: string;
    architecture: string;
    dspRxBits: number;
    dspTxBits: number;
    os: string;
    pid: number;
    qtVersion: string;
    version: string;
    devicesetlist: {
      devicesetcount: number,
      devicesetfocus?: number,
      deviceSets?: [DeviceSet]
  };
  logging: {
      consoleLevel: string,
      dumpToFile: number,
      fileLevel?: string,
      fileName?: string
  };
  }

export const INSTANCE_SUMMARY_DEFAULT = {
    appname: 'Default',
    architecture: 'none',
    dspRxBits: 24,
    dspTxBits: 16,
    os: 'None',
    pid: 0,
    qtVersion: '0.0.0',
    version: '0.0.0',
    devicesetlist: {
      devicesetcount: 0
    },
    logging: {
      consoleLevel: 'info',
      dumpToFile: 0
    }
  };

