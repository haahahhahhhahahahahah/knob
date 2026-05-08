import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState, type DragEvent } from 'react';

type MediaSetupProps = {
  onReady: (visualFile: File, audioFile?: File) => void;
};

type DropZoneProps = {
  accept: string;
  detail: string;
  file?: File;
  label: string;
  onFile: (file: File) => void;
  tone: 'visual' | 'audio';
};

function fileMatches(file: File, accept: string) {
  const accepts = accept.split(',').map((value) => value.trim());

  return accepts.some((value) => {
    if (value.endsWith('/*')) {
      return file.type.startsWith(value.slice(0, -1));
    }

    return file.type === value;
  });
}

function pickFile(files: FileList | File[], accept: string) {
  return Array.from(files).find((file) => fileMatches(file, accept));
}

function MediaGlyph({ tone }: { tone: 'visual' | 'audio' }) {
  if (tone === 'audio') {
    return (
      <svg width="58" height="58" viewBox="0 0 58 58" fill="none" aria-hidden="true">
        <path
          d="M36.5 11.5v26.6c0 5.2-4.6 8.8-10.3 8.8-5 0-8.8-2.8-8.8-6.7 0-4.1 4.2-6.9 9.3-6.9 2.1 0 4 .4 5.4 1.2V16.8l15-3.2v7.2l-10.6 2.3"
          stroke="currentColor"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg width="58" height="58" viewBox="0 0 58 58" fill="none" aria-hidden="true">
      <rect
        x="9"
        y="13"
        width="40"
        height="32"
        rx="6"
        stroke="currentColor"
        strokeWidth="3.2"
      />
      <path
        d="m12.5 39 11-11.2 8.5 8.4 5.5-5.9L47 39"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="39.8" cy="22.1" r="3.9" fill="currentColor" />
    </svg>
  );
}

function DropZone({ accept, detail, file, label, onFile, tone }: DropZoneProps) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setDragging(false);

    const droppedFile = pickFile(event.dataTransfer.files, accept);
    if (droppedFile) {
      onFile(droppedFile);
    }
  };

  return (
    <motion.button
      type="button"
      className="media-drop-zone"
      data-dragging={dragging}
      data-filled={Boolean(file)}
      data-tone={tone}
      onClick={() => inputRef.current?.click()}
      onDragEnter={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragOver={(event) => event.preventDefault()}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      whileTap={{ scale: 0.985 }}
      transition={{ type: 'spring', stiffness: 260, damping: 24 }}
    >
      <input
        ref={inputRef}
        className="media-file-input"
        type="file"
        accept={accept}
        onChange={(event) => {
          const selectedFile = event.target.files?.[0];
          if (selectedFile) {
            onFile(selectedFile);
          }
        }}
      />
      <span className="media-drop-glow" />
      <span className="media-drop-icon">
        <MediaGlyph tone={tone} />
      </span>
      <span className="media-drop-copy">
        <span className="media-drop-label">{label}</span>
        <span className="media-drop-detail">{file ? file.name : detail}</span>
      </span>
    </motion.button>
  );
}

export function MediaSetup({ onReady }: MediaSetupProps) {
  const [visualFile, setVisualFile] = useState<File>();
  const [audioFile, setAudioFile] = useState<File>();
  const visualPreviewUrl = useRef<string | null>(null);

  useEffect(() => {
    if (visualPreviewUrl.current) {
      URL.revokeObjectURL(visualPreviewUrl.current);
      visualPreviewUrl.current = null;
    }

    if (visualFile) {
      visualPreviewUrl.current = URL.createObjectURL(visualFile);
    }

    return () => {
      if (visualPreviewUrl.current) {
        URL.revokeObjectURL(visualPreviewUrl.current);
        visualPreviewUrl.current = null;
      }
    };
  }, [visualFile]);

  const hasVideoAudio = Boolean(visualFile?.type.startsWith('video/'));
  const canContinue = Boolean(visualFile && (audioFile || hasVideoAudio));

  return (
    <motion.section
      className="media-setup-shell"
      aria-label="Media setup"
      initial={{ opacity: 0, scale: 0.985, y: 18 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.985, y: -10 }}
      transition={{ type: 'spring', stiffness: 120, damping: 20 }}
    >
      <div className="media-setup-header">
        <h1>Load media</h1>
        <p>Drop a photo or video, then add a song. Video audio is separated automatically.</p>
      </div>

      <div className="media-drop-grid">
        <DropZone
          accept="image/*,video/*"
          detail="Drop photo or video"
          file={visualFile}
          label="Visual"
          onFile={setVisualFile}
          tone="visual"
        />
        <DropZone
          accept="audio/*,video/*"
          detail={hasVideoAudio ? 'Using video audio unless replaced' : 'Drop song'}
          file={audioFile}
          label="Sound"
          onFile={setAudioFile}
          tone="audio"
        />
      </div>

      <AnimatePresence>
        {visualFile && (
          <motion.div
            className="media-setup-status"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
          >
            {audioFile
              ? 'Song loaded'
              : hasVideoAudio
                ? 'Video audio ready'
                : 'Add a song to continue'}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        className="media-load-button"
        disabled={!canContinue}
        onClick={() => {
          if (visualFile) {
            onReady(visualFile, audioFile);
          }
        }}
        whileTap={canContinue ? { scale: 0.98 } : undefined}
      >
        Load control
      </motion.button>
    </motion.section>
  );
}
