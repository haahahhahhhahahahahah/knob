import { motion } from 'framer-motion';
import { BrightnessIcon, VolumeIcon } from './icons';
import type { ControlMode } from './ControlWidget';

type ModeButtonProps = {
  mode: ControlMode;
  active: boolean;
  onClick: () => void;
};

export function ModeButton({ mode, active, onClick }: ModeButtonProps) {
  const Icon = mode === 'brightness' ? BrightnessIcon : VolumeIcon;
  const label = mode === 'brightness' ? 'Brightness' : 'Volume';

  return (
    <motion.button
      type="button"
      aria-label={label}
      className={`mode-button mode-button-${mode}`}
      data-active={active}
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      animate={{
        opacity: active ? 1 : 0.72,
        scale: active ? 1 : 0.985,
        y: active ? 0 : 1,
      }}
      transition={{ type: 'spring', stiffness: 240, damping: 24 }}
    >
      <motion.span
        className="mode-button-icon"
        animate={{
          color: active ? '#ffffff' : 'rgba(255,255,255,0.24)',
          filter: active
            ? 'drop-shadow(0 0 5px rgba(255,255,255,0.22))'
            : 'drop-shadow(0 0 0 rgba(255,255,255,0))',
        }}
        transition={{ duration: 0.26, ease: 'easeOut' }}
      >
        <Icon />
      </motion.span>
    </motion.button>
  );
}
