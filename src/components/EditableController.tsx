import { motion } from 'framer-motion';
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { ControlWidget, type ControlMode } from './ControlWidget';

type EditableControllerProps = {
  mode: ControlMode;
  onModeChange: (mode: ControlMode) => void;
  onValueChange: (value: number) => void;
  stageScale: number;
  value: number;
};

type Placement = {
  scale: number;
  x: number;
  y: number;
};

const shellWidth = 1055;
const shellHeight = 299;
const stageWidth = 1600;
const stageHeight = 1200;
const margin = 24;

const defaultPlacement: Placement = {
  x: 266,
  y: 445,
  scale: 1,
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function clampPlacement(placement: Placement): Placement {
  const scale = clamp(placement.scale, 0.58, 1.26);
  const maxX = stageWidth - shellWidth * scale - margin;
  const maxY = stageHeight - shellHeight * scale - margin;

  return {
    scale,
    x: clamp(placement.x, margin, Math.max(margin, maxX)),
    y: clamp(placement.y, margin + 48, Math.max(margin + 48, maxY)),
  };
}

function MoveIcon() {
  return (
    <svg width="34" height="34" viewBox="0 0 34 34" fill="none" aria-hidden="true">
      <path
        d="M17 5v24M5 17h24M17 5l-4.4 4.4M17 5l4.4 4.4M17 29l-4.4-4.4M17 29l4.4-4.4M5 17l4.4-4.4M5 17l4.4 4.4M29 17l-4.4-4.4M29 17l-4.4 4.4"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="25" height="25" viewBox="0 0 25 25" fill="none" aria-hidden="true">
      <path
        d="m5.2 13.4 4.5 4.5 10.1-11"
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg width="25" height="25" viewBox="0 0 25 25" fill="none" aria-hidden="true">
      <path
        d="M5.1 18.7 6 14l9.2-9.2a2.3 2.3 0 0 1 3.2 0l1.8 1.8a2.3 2.3 0 0 1 0 3.2L11 19l-4.7.9a1 1 0 0 1-1.2-1.2Z"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="m13.8 6.2 5 5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

function ResizeIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none" aria-hidden="true">
      <path
        d="M10 22h12V10M13 17l9-9M7.5 22.5l15-15"
        stroke="currentColor"
        strokeWidth="2.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function EditableController({
  mode,
  onModeChange,
  onValueChange,
  stageScale,
  value,
}: EditableControllerProps) {
  const [editing, setEditing] = useState(true);
  const [placement, setPlacement] = useState<Placement>(defaultPlacement);
  const cleanupInteraction = useRef<() => void>(() => {});

  useEffect(() => {
    return () => cleanupInteraction.current();
  }, []);

  const startInteraction = (
    kind: 'move' | 'resize',
    event: ReactPointerEvent<HTMLElement>,
  ) => {
    event.preventDefault();
    event.stopPropagation();
    cleanupInteraction.current();

    const start = {
      clientX: event.clientX,
      clientY: event.clientY,
      placement,
    };

    const handleMove = (moveEvent: PointerEvent) => {
      const dx = (moveEvent.clientX - start.clientX) / stageScale;
      const dy = (moveEvent.clientY - start.clientY) / stageScale;

      if (kind === 'move') {
        setPlacement(
          clampPlacement({
            ...start.placement,
            x: start.placement.x + dx,
            y: start.placement.y + dy,
          }),
        );
        return;
      }

      const widthScale = (shellWidth * start.placement.scale + dx) / shellWidth;
      const heightScale = (shellHeight * start.placement.scale + dy) / shellHeight;
      const nextScale = Math.max(widthScale, heightScale);

      setPlacement(
        clampPlacement({
          ...start.placement,
          scale: nextScale,
        }),
      );
    };

    const handleUp = () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
      cleanupInteraction.current = () => {};
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    cleanupInteraction.current = handleUp;
  };

  return (
    <motion.div
      className="controller-placement"
      data-editing={editing}
      style={{
        left: placement.x,
        top: placement.y,
        transform: `scale(${placement.scale})`,
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
    >
      <ControlWidget
        floating
        mode={mode}
        value={value}
        onModeChange={onModeChange}
        onValueChange={onValueChange}
      />

      {editing ? (
        <>
          <button
            className="controller-move-handle"
            type="button"
            aria-label="Drag controller"
            onPointerDown={(event) => startInteraction('move', event)}
          >
            <MoveIcon />
          </button>
          <button
            className="controller-resize-handle"
            type="button"
            aria-label="Resize controller"
            onPointerDown={(event) => startInteraction('resize', event)}
          >
            <ResizeIcon />
          </button>
          <div className="controller-placement-actions">
            <button type="button" onClick={() => setEditing(false)}>
              <CheckIcon />
              <span>Confirm</span>
            </button>
          </div>
        </>
      ) : (
        <button
          className="controller-edit-button"
          type="button"
          onClick={() => setEditing(true)}
        >
          <EditIcon />
          <span>Edit</span>
        </button>
      )}
    </motion.div>
  );
}
