
import { RelayStatus } from '@/types/relay';

export const createRelayCommands = {
  activate: (relayNumber: number) => `RELAY${relayNumber}_ON`,
  deactivate: (relayNumber: number) => `RELAY${relayNumber}_OFF`
};

export const updateRelayStatus = (
  prevStatus: RelayStatus, 
  relayNumber: number, 
  isActive: boolean
): RelayStatus => {
  return { ...prevStatus, [relayNumber]: isActive };
};

export const parseLimitSwitchMessage = (message: string): boolean => {
  return message.includes('LIMIT_SWITCH_PRESSED');
};

export const parseRelayStatusMessage = (message: string): { relayNumber: number; isActive: boolean } | null => {
  if (message.includes('_ACTIVATED')) {
    const relayMatch = message.match(/RELAY(\d+)_ACTIVATED/);
    if (relayMatch) {
      return { relayNumber: parseInt(relayMatch[1]), isActive: true };
    }
  } else if (message.includes('_DEACTIVATED')) {
    const relayMatch = message.match(/RELAY(\d+)_DEACTIVATED/);
    if (relayMatch) {
      return { relayNumber: parseInt(relayMatch[1]), isActive: false };
    }
  }
  return null;
};
