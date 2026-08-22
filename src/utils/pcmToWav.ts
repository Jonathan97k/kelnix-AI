const DEFAULT_SAMPLE_RATE = 24000;

export interface PcmAudioInfo {
  sampleRate: number;
  channels: number;
  bitsPerSample: number;
}

export function parsePcmAudioInfo(mimeType = ''): PcmAudioInfo {
  const rate = mimeType.match(/rate=(\d+)/i)?.[1];
  const channels = mimeType.match(/channels=(\d+)/i)?.[1];
  return {
    sampleRate: rate ? Number(rate) : DEFAULT_SAMPLE_RATE,
    channels: channels ? Number(channels) : 1,
    bitsPerSample: 16,
  };
}

export function decodeBase64(base64: string): Uint8Array {
  if (!base64 || typeof atob !== 'function') {
    throw new Error('Audio data could not be decoded.');
  }

  const binary = atob(base64.replace(/^data:audio\/[^;]+;base64,/, ''));
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

export function pcmToWavBlob(base64Pcm: string, mimeType = 'audio/pcm;rate=24000'): Blob {
  const pcm = decodeBase64(base64Pcm);
  if (pcm.length === 0 || pcm.length % 2 !== 0) {
    throw new Error('Generated audio data is invalid.');
  }

  const { sampleRate, channels, bitsPerSample } = parsePcmAudioInfo(mimeType);
  if (!Number.isFinite(sampleRate) || sampleRate <= 0 || channels <= 0) {
    throw new Error('Generated audio format is invalid.');
  }

  const blockAlign = channels * (bitsPerSample / 8);
  const byteRate = sampleRate * blockAlign;
  const buffer = new ArrayBuffer(44 + pcm.length);
  const view = new DataView(buffer);

  writeAscii(view, 0, 'RIFF');
  view.setUint32(4, 36 + pcm.length, true);
  writeAscii(view, 8, 'WAVE');
  writeAscii(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, channels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  writeAscii(view, 36, 'data');
  view.setUint32(40, pcm.length, true);
  new Uint8Array(buffer, 44).set(pcm);

  return new Blob([buffer], { type: 'audio/wav' });
}

function writeAscii(view: DataView, offset: number, value: string): void {
  for (let index = 0; index < value.length; index += 1) {
    view.setUint8(offset + index, value.charCodeAt(index));
  }
}
