export interface Spectrum {
    centerFrequency: bigint;
    elapsedMs: bigint;
    timestampMs: bigint;
    fftSize: number;
    bandwidth: number;
    linear: boolean;
    ssb: boolean;
    usb: boolean;
    spectrum: Float32Array;
}

export const SPECTRUM_DEFAULT = {
    centerFrequency: BigInt(435000000),
    elapsedMs: BigInt(200),
    timestampMs: BigInt(1588599302000),
    fftSize: 4,
    bandwidth: 48000,
    linear: false,
    ssb: false,
    usb: true,
    spectrum: Float32Array.of(-48.0, -38.0, -37.0, -48.0)
};
