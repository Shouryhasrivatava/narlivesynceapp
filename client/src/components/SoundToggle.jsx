import React, { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { soundFx } from '../utils/audio';

export const SoundToggle = () => {
  const [soundOn, setSoundOn] = useState(true);

  const handleToggle = () => {
    const nextState = !soundOn;
    setSoundOn(nextState);
    soundFx.toggleSound(nextState);
    if (nextState) {
      soundFx.playThwip();
    }
  };

  return (
    <button
      onClick={handleToggle}
      className={`fixed bottom-5 right-5 z-40 flex items-center gap-2 px-3.5 py-2 font-headline tracking-wider text-sm border-3 border-spidey-black shadow-comic transition-all ${
        soundOn
          ? 'bg-spidey-yellow text-spidey-black hover:bg-spidey-darkYellow'
          : 'bg-gray-200 text-gray-700'
      } comic-button`}
      title={soundOn ? 'Comic SFX Enabled (Click to Mute)' : 'Comic SFX Muted (Click to Enable)'}
    >
      {soundOn ? (
        <>
          <Volume2 className="w-5 h-5 text-spidey-red" />
          <span>SFX: ON</span>
        </>
      ) : (
        <>
          <VolumeX className="w-5 h-5 text-gray-500" />
          <span>SFX: OFF</span>
        </>
      )}
    </button>
  );
};
