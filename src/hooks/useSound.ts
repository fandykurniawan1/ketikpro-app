import { useState, useCallback } from 'react';
import { loadSoundPreference, saveSoundPreference, type SoundTheme } from '@/core/storage/progressStorage';
import { playKeySound, playErrorSound, playSuccessSound } from '@/core/engine/soundEngine';

export function useSound() {
  const [soundTheme, setSoundTheme] = useState<SoundTheme>(loadSoundPreference);

  const changeSoundTheme = useCallback((theme: SoundTheme) => {
    setSoundTheme(theme);
    saveSoundPreference(theme);
    if (theme !== 'off') {
      playKeySound(theme);
    }
  }, []);

  const triggerKeySound = useCallback(() => {
    playKeySound(soundTheme);
  }, [soundTheme]);

  const triggerErrorSound = useCallback(() => {
    if (soundTheme !== 'off') {
      playErrorSound();
    }
  }, [soundTheme]);

  const triggerSuccessSound = useCallback(() => {
    if (soundTheme !== 'off') {
      playSuccessSound();
    }
  }, [soundTheme]);

  return {
    soundTheme,
    changeSoundTheme,
    triggerKeySound,
    triggerErrorSound,
    triggerSuccessSound,
  };
}
