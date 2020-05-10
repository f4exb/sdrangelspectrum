import { Device  } from '../device/device';
import { Channel } from '../channel/channel';

export interface DeviceSet {
  channelcount: number;
  channels?: Channel[];
  samplingDevice: Device;
}
