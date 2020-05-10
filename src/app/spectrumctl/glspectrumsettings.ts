export interface GLSpectrumSettings {
    fftSize?: number;
    fftOverlap?: number;
    fftWindow?: number;
    refLevel?: number;
    powerRange?: number;
    displayWaterfall?: boolean;
    invertedWaterfall?: boolean;
    displayMaxHold?: boolean;
    displayHistogram?: boolean;
    decay?: number;
    displayGrid?: boolean;
    displayGridIntensity?: number;
    decayDivisor?: number;
    histogramStroke?: number;
    displayCurrent?: boolean;
    displayTraceIntensity?: number;
    waterfallShare?: number;
    averagingMode?: number;
    averagingValue?: number;
    linear?: boolean;
    ssb?: boolean;
    usb?: boolean;
    wsSpectrumAddress?: string;
    wsSpectrumPort?: number;
}

export const GLSPECTRUM_SETTINGS_DEFAULT = {
    fftSize: 1024,
    fftOverlap: 0,
    fftWindow: 4, // Hanning
    refLevel: 0,
    powerRange: 100,
    displayWaterfall: true,
    invertedWaterfall: true,
    displayMaxHold: false,
    displayHistogram: false,
    decay: 1,
    displayGrid: false,
    displayGridIntensity: 5,
    decayDivisor: 1,
    histogramStroke: 30,
    displayCurrent: true,
    displayTraceIntensity: 50,
    waterfallShare: 0.66,
    averagingMode: 0, // None
    averagingValue: 1,
    linear: false,
    ssb: false,
    usb: true,
    wsSpectrumAddress: '127.0.0.1',
    wsSpectrumPort: 8887
};
