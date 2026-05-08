import { AnimatePresence, animate, motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { ControlWidget, type ControlMode } from './components/ControlWidget';
import { EditableController } from './components/EditableController';
import { MediaDisplay, type MediaSession } from './components/MediaDisplay';
import { MediaSetup } from './components/MediaSetup';

type DemoState = {
  mode: ControlMode;
  brightness: number;
  volume: number;
};

const fixedStates: Record<string, DemoState & { transitionFrame?: boolean }> = {
  'brightness-52': { mode: 'brightness', brightness: 52, volume: 53 },
  'brightness-low-transition': {
    mode: 'brightness',
    brightness: 5,
    volume: 53,
    transitionFrame: true,
  },
  'volume-53': { mode: 'volume', brightness: 52, volume: 53 },
  'volume-72': { mode: 'volume', brightness: 52, volume: 72 },
  'volume-14': { mode: 'volume', brightness: 52, volume: 14 },
  'volume-0': { mode: 'volume', brightness: 52, volume: 0 },
};

function useStageScale() {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      setScale(Math.min(window.innerWidth / 1600, window.innerHeight / 1200));
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  return scale;
}

function App() {
  const scale = useStageScale();
  const searchParams = useMemo(() => new URLSearchParams(window.location.search), []);
  const fixedStateName = searchParams.get('state') ?? '';
  const fixedState = fixedStates[fixedStateName];
  const demoEnabled = searchParams.get('demo') === '1';
  const [runId, setRunId] = useState(0);
  const [manual, setManual] = useState(false);
  const [mediaSession, setMediaSession] = useState<MediaSession>();
  const [playbackBlocked, setPlaybackBlocked] = useState(false);
  const [playToken, setPlayToken] = useState(0);
  const [state, setState] = useState<DemoState>(
    fixedState ?? { mode: 'brightness', brightness: 52, volume: 53 },
  );
  const shouldShowSetup = !fixedState && !mediaSession && !demoEnabled;

  useEffect(() => {
    if (!demoEnabled || fixedState || manual) {
      return;
    }

    let cancelled = false;
    let activeAnimation: ReturnType<typeof animate> | undefined;

    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        window.setTimeout(resolve, ms);
      });

    const animateVolume = async (from: number, to: number, duration: number) => {
      activeAnimation?.stop();
      await new Promise<void>((resolve) => {
        activeAnimation = animate(from, to, {
          duration,
          ease: [0.22, 1, 0.36, 1],
          onUpdate: (latest) => {
            if (!cancelled) {
              setState((current) => ({ ...current, volume: latest }));
            }
          },
          onComplete: resolve,
        });
      });
    };

    const run = async () => {
      setState({ mode: 'brightness', brightness: 52, volume: 53 });
      await wait(1200);
      if (cancelled) return;

      setState({ mode: 'volume', brightness: 52, volume: 53 });
      await wait(520);
      if (cancelled) return;

      await animateVolume(53, 72, 0.92);
      await wait(340);
      if (cancelled) return;

      await animateVolume(72, 14, 1.08);
      await wait(300);
      if (cancelled) return;

      await animateVolume(14, 0, 0.86);
    };

    void run();

    return () => {
      cancelled = true;
      activeAnimation?.stop();
    };
  }, [demoEnabled, fixedState, manual, runId]);

  useEffect(() => {
    if (!fixedState) {
      return;
    }

    setState(fixedState);
  }, [fixedState]);

  useEffect(() => {
    if (!mediaSession) {
      return;
    }

    return () => {
      const urls = new Set<string>();
      urls.add(mediaSession.visual.url);
      if (mediaSession.audio) {
        urls.add(mediaSession.audio.url);
      }

      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [mediaSession]);

  const startMediaSession = (visualFile: File, audioFile?: File) => {
    const visualUrl = URL.createObjectURL(visualFile);
    const visualKind = visualFile.type.startsWith('video/') ? 'video' : 'image';
    const nextSession: MediaSession = {
      visual: {
        kind: visualKind,
        name: visualFile.name,
        type: visualFile.type,
        url: visualUrl,
      },
    };

    if (audioFile) {
      nextSession.audio = {
        kind: audioFile.type.startsWith('video/') ? 'video' : 'audio',
        name: audioFile.name,
        type: audioFile.type,
        url: URL.createObjectURL(audioFile),
      };
    } else if (visualKind === 'video') {
      nextSession.audio = {
        kind: 'video',
        name: visualFile.name,
        type: visualFile.type,
        url: visualUrl,
      };
    }

    setMediaSession(nextSession);
    setPlaybackBlocked(false);
    setManual(true);
    setState({ mode: 'brightness', brightness: 52, volume: 53 });
  };

  const updateMode = (mode: ControlMode) => {
    setManual(true);
    setState((current) => ({ ...current, mode }));
  };

  const updateValue = (value: number) => {
    setManual(true);
    setState((current) => ({
      ...current,
      [current.mode]: Math.max(0, Math.min(100, Math.round(value))),
    }));
  };

  const replay = () => {
    setManual(false);
    setState({ mode: 'brightness', brightness: 52, volume: 53 });
    setRunId((value) => value + 1);
  };

  return (
    <main className="viewport">
      <AnimatePresence>
        {mediaSession && (
          <MediaDisplay
            key={mediaSession.visual.url}
            brightness={state.brightness}
            onPlaybackBlocked={setPlaybackBlocked}
            playToken={playToken}
            session={mediaSession}
            volume={state.volume}
          />
        )}
      </AnimatePresence>
      <div
        className="stage-frame"
        style={{ width: 1600 * scale, height: 1200 * scale }}
      >
        <div className="stage" style={{ transform: `scale(${scale})` }}>
          <AnimatePresence mode="wait">
            {shouldShowSetup ? (
              <MediaSetup key="setup" onReady={startMediaSession} />
            ) : mediaSession ? (
              <EditableController
                key="editable-control"
                mode={state.mode}
                value={state.mode === 'brightness' ? state.brightness : state.volume}
                onModeChange={updateMode}
                onValueChange={updateValue}
                stageScale={scale}
              />
            ) : (
              <ControlWidget
                key="control"
                mode={state.mode}
                value={state.mode === 'brightness' ? state.brightness : state.volume}
                onModeChange={updateMode}
                onValueChange={updateValue}
                transitionFrame={fixedState?.transitionFrame}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
      <AnimatePresence>
        {playbackBlocked && mediaSession && (
          <motion.button
            type="button"
            className="media-start-button"
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            onClick={() => {
              setPlaybackBlocked(false);
              setPlayToken((value) => value + 1);
            }}
          >
            Play audio
          </motion.button>
        )}
      </AnimatePresence>
      <button className="replay-button" type="button" onClick={replay}>
        Replay
      </button>
    </main>
  );
}

export default App;
