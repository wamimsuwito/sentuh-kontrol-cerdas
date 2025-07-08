
export type AudioEvent = 'customer-detected' | 'limit-switch-active' | 'processing-active';

export interface AudioConfig {
  [key: string]: {
    file: string;
    volume: number;
    loop?: boolean;
  };
}

export const AUDIO_CONFIG: AudioConfig = {
  'customer-detected': {
    file: '/audio/customer-detected.mp3',
    volume: 0.8,
    loop: false
  },
  'limit-switch-active': {
    file: '/audio/limit-switch-active.mp3',
    volume: 0.8,
    loop: true
  },
  'processing-active': {
    file: '/audio/processing-active.mp3',
    volume: 0.8,
    loop: false
  }
};
