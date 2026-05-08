import { motion } from 'framer-motion';
import { useEffect, useMemo, useRef } from 'react';

export type MediaKind = 'image' | 'video';

export type MediaAsset = {
  kind: MediaKind;
  name: string;
  type: string;
  url: string;
};

export type AudioAsset = {
  kind: 'audio' | 'video';
  name: string;
  type: string;
  url: string;
};

export type MediaSession = {
  audio?: AudioAsset;
  visual: MediaAsset;
};

type MediaDisplayProps = {
  brightness: number;
  onPlaybackBlocked: (blocked: boolean) => void;
  playToken: number;
  session: MediaSession;
  volume: number;
};

function mediaBrightness(value: number) {
  return Math.max(0.08, value / 52);
}

export function MediaDisplay({
  brightness,
  onPlaybackBlocked,
  playToken,
  session,
  volume,
}: MediaDisplayProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLMediaElement | null>(null);
  const visualBrightness = mediaBrightness(brightness);

  const audio = useMemo(() => {
    return (
      session.audio ??
      (session.visual.kind === 'video'
        ? {
            kind: 'video' as const,
            name: session.visual.name,
            type: session.visual.type,
            url: session.visual.url,
          }
        : undefined)
    );
  }, [session]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = Math.max(0, Math.min(1, volume / 100));
      audioRef.current.muted = volume <= 0;
    }
  }, [volume, audio]);

  useEffect(() => {
    let cancelled = false;

    const start = async () => {
      const attempts: Promise<unknown>[] = [];

      if (videoRef.current) {
        attempts.push(videoRef.current.play());
      }

      if (audioRef.current && audio) {
        audioRef.current.volume = Math.max(0, Math.min(1, volume / 100));
        audioRef.current.muted = volume <= 0;
        attempts.push(audioRef.current.play());
      }

      const results = await Promise.allSettled(attempts);
      const blocked = results.some((result) => result.status === 'rejected');

      if (!cancelled) {
        onPlaybackBlocked(blocked);
      }
    };

    void start();

    return () => {
      cancelled = true;
    };
  }, [audio, onPlaybackBlocked, playToken, session, volume]);

  return (
    <motion.div
      className="media-scene"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
      style={{
        filter: `brightness(${visualBrightness}) saturate(1.04) contrast(1.02)`,
      }}
    >
      <div className="media-scene-vignette" />
      {session.visual.kind === 'video' ? (
        <video
          ref={videoRef}
          className="media-surface"
          src={session.visual.url}
          muted
          playsInline
          loop
        />
      ) : (
        <img className="media-surface" src={session.visual.url} alt="" />
      )}

      {audio?.kind === 'video' ? (
        <video
          ref={(node) => {
            audioRef.current = node;
          }}
          className="hidden-media-audio"
          src={audio.url}
          playsInline
          loop
        />
      ) : audio ? (
        <audio
          ref={(node) => {
            audioRef.current = node;
          }}
          src={audio.url}
          loop
        />
      ) : null}
    </motion.div>
  );
}
