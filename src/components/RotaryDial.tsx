import { motion } from 'framer-motion';
import { useRef, type PointerEvent, type WheelEvent } from 'react';

type RotaryDialProps = {
  value: number;
  onValueChange: (value: number) => void;
};

const clamp = (value: number) => Math.max(0, Math.min(100, value));

export function RotaryDial({ value, onValueChange }: RotaryDialProps) {
  const dragStart = useRef<{ x: number; y: number; value: number } | null>(null);
  const rotation = -38 + value * 0.76;

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragStart.current = { x: event.clientX, y: event.clientY, value };
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragStart.current) {
      return;
    }

    const dx = event.clientX - dragStart.current.x;
    const dy = dragStart.current.y - event.clientY;
    onValueChange(clamp(dragStart.current.value + (dx + dy) * 0.38));
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.releasePointerCapture(event.pointerId);
    dragStart.current = null;
  };

  const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    onValueChange(clamp(value - event.deltaY * 0.06));
  };

  return (
    <motion.div
      className="rotary-dial"
      role="slider"
      aria-label="Rotary value"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(value)}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onWheel={handleWheel}
      animate={{ rotate: rotation }}
      transition={{ type: 'spring', stiffness: 120, damping: 20 }}
    >
      <div className="dial-ticks" />
      <div className="dial-inner-ring" />
      <div className="dial-center-cap" />
    </motion.div>
  );
}
