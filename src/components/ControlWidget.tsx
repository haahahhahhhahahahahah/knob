import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';
import { ModeButton } from './ModeButton';
import { RotaryDial } from './RotaryDial';
import { SliderTrack } from './SliderTrack';

export type ControlMode = 'brightness' | 'volume';

type ControlWidgetProps = {
  floating?: boolean;
  mode: ControlMode;
  value: number;
  transitionFrame?: boolean;
  onModeChange: (mode: ControlMode) => void;
  onValueChange: (value: number) => void;
};

const clamp = (value: number) => Math.max(0, Math.min(100, value));

export function ControlWidget({
  floating = false,
  mode,
  value,
  transitionFrame = false,
  onModeChange,
  onValueChange,
}: ControlWidgetProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        onValueChange(clamp(value - 1));
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault();
        onValueChange(clamp(value + 1));
      }

      if (event.key.toLowerCase() === 'b') {
        onModeChange('brightness');
      }

      if (event.key.toLowerCase() === 'v') {
        onModeChange('volume');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onModeChange, onValueChange, value]);

  return (
    <motion.section
      className={`control-shell${floating ? ' control-shell-floating' : ''}`}
      aria-label="Brightness and volume control"
      initial={{ opacity: 0, scale: 0.985, y: 18 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.985, y: -10 }}
      transition={{ type: 'spring', stiffness: 120, damping: 20 }}
    >
      <AnimatePresence mode="wait">
        <motion.h1
          key={mode}
          className="control-label"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: transitionFrame ? 0 : 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
        >
          {mode === 'brightness' ? 'Brightness' : 'Volume'}
        </motion.h1>
      </AnimatePresence>

      <SliderTrack
        mode={mode}
        value={value}
        onValueChange={onValueChange}
        transitionFrame={transitionFrame}
      />

      <ModeButton
        mode="brightness"
        active={mode === 'brightness' && !transitionFrame}
        onClick={() => onModeChange('brightness')}
      />
      <ModeButton
        mode="volume"
        active={mode === 'volume' || transitionFrame}
        onClick={() => onModeChange('volume')}
      />

      <RotaryDial value={value} onValueChange={onValueChange} />
    </motion.section>
  );
}
