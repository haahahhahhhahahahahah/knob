import { motion } from 'framer-motion';
import type { PointerEvent } from 'react';
import type { ControlMode } from './ControlWidget';

type SliderTrackProps = {
  mode: ControlMode;
  value: number;
  transitionFrame?: boolean;
  onValueChange: (value: number) => void;
};

const trackWidth = 549;
const clamp = (value: number) => Math.max(0, Math.min(100, value));

function fillWidthFor(value: number) {
  if (value <= 0) {
    return 0;
  }

  return Math.min(trackWidth, (value / 100) * trackWidth + 48);
}

export function SliderTrack({
  mode,
  value,
  transitionFrame = false,
  onValueChange,
}: SliderTrackProps) {
  const fillWidth = fillWidthFor(value);
  const showValue = value > 0;

  const updateFromPointer = (event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const next = ((event.clientX - rect.left) / rect.width) * 100;
    onValueChange(clamp(next));
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    updateFromPointer(event);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      updateFromPointer(event);
    }
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  return (
    <div
      className="slider-track"
      role="slider"
      aria-label={`${mode} value`}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(value)}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <motion.div
        className="slider-fill"
        animate={{
          width: fillWidth,
          opacity: value <= 0 ? 0 : transitionFrame ? 0.62 : 1,
        }}
        transition={{ type: 'spring', stiffness: 120, damping: 20 }}
      >
        <motion.div
          className="fill-layer fill-brightness"
          animate={{ opacity: mode === 'brightness' ? 1 : 0 }}
          transition={{ duration: 0.28, ease: 'easeOut' }}
        />
        <motion.div
          className="fill-layer fill-volume"
          animate={{ opacity: mode === 'volume' ? 1 : 0 }}
          transition={{ duration: 0.28, ease: 'easeOut' }}
        />
      </motion.div>
      <motion.div
        className="percentage"
        animate={{
          opacity: showValue ? (transitionFrame ? 0.2 : 1) : 0,
          y: showValue ? 0 : 2,
        }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        {showValue ? `${Math.round(value)}%` : ''}
      </motion.div>
    </div>
  );
}
