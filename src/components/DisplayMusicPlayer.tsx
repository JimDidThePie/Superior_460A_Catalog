import { Music, Pause, Play, SkipBack, SkipForward, Volume2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ShowroomSettings } from "../types/settings";

const getTrackName = (url: string) => {
  try {
    const parsedUrl = new URL(url, window.location.origin);
    const fileName = decodeURIComponent(parsedUrl.pathname.split("/").filter(Boolean).pop() || "");
    return fileName.replace(/\.(mp3|mp4|m4a|aac|ogg|wav|webm)$/i, "").replace(/[-_]+/g, " ") || "Media track";
  } catch {
    return url.split("/").pop()?.replace(/\.(mp3|mp4|m4a|aac|ogg|wav|webm)$/i, "").replace(/[-_]+/g, " ") || "Media track";
  }
};

const isVideoUrl = (url: string) => /\.(mp4|webm)(\?.*)?$/i.test(url.trim());

const toSpotifyEmbedUrl = (url: string) => {
  const trimmedUrl = url.trim();

  if (!trimmedUrl) {
    return "";
  }

  if (trimmedUrl.includes("/embed/")) {
    return trimmedUrl;
  }

  try {
    const parsedUrl = new URL(trimmedUrl);
    const parts = parsedUrl.pathname.split("/").filter(Boolean);
    const [type, id] = parts;

    if (parsedUrl.hostname.includes("open.spotify.com") && type && id) {
      return `https://open.spotify.com/embed/${type}/${id}`;
    }
  } catch {
    return trimmedUrl;
  }

  return trimmedUrl;
};

type DisplayMusicPlayerProps = {
  settings: ShowroomSettings;
  placement?: "header" | "weather";
};

export function DisplayMusicPlayer({ settings, placement = "header" }: DisplayMusicPlayerProps) {
  const mediaRef = useRef<HTMLMediaElement | null>(null);
  const [trackIndex, setTrackIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [volume, setVolume] = useState(settings.musicVolume);

  const tracks = useMemo(() => settings.musicUrls.map((url) => url.trim()).filter(Boolean), [settings.musicUrls]);
  const currentTrack = tracks[trackIndex] || "";
  const spotifyEmbedUrl = toSpotifyEmbedUrl(settings.musicSpotifyEmbedUrl);
  const showSpotify = settings.musicMode === "spotify" && spotifyEmbedUrl;

  useEffect(() => {
    if (trackIndex >= tracks.length) {
      setTrackIndex(0);
    }
  }, [trackIndex, tracks.length]);

  useEffect(() => {
    const media = mediaRef.current;

    if (!media) {
      return;
    }

    media.volume = volume;
  }, [currentTrack, volume]);

  useEffect(() => {
    setVolume(settings.musicVolume);
  }, [settings.musicVolume]);

  useEffect(() => {
    const media = mediaRef.current;

    if (!media || !settings.musicAutoplay || !currentTrack || showSpotify) {
      return;
    }

    media
      .play()
      .then(() => {
        setPlaying(true);
        setBlocked(false);
      })
      .catch(() => {
        setPlaying(false);
        setBlocked(true);
      });
  }, [currentTrack, settings.musicAutoplay, showSpotify]);

  if (!settings.musicEnabled) {
    return null;
  }

  const goToTrack = (direction: "previous" | "next") => {
    if (!tracks.length) {
      return;
    }

    if (settings.musicShuffle && tracks.length > 1) {
      let nextIndex = trackIndex;

      while (nextIndex === trackIndex) {
        nextIndex = Math.floor(Math.random() * tracks.length);
      }

      setTrackIndex(nextIndex);
      return;
    }

    setTrackIndex((current) => {
      if (direction === "previous") {
        return current <= 0 ? tracks.length - 1 : current - 1;
      }

      return current >= tracks.length - 1 ? 0 : current + 1;
    });
  };

  const handleTogglePlay = () => {
    const media = mediaRef.current;

    if (!media || !currentTrack) {
      return;
    }

    if (media.paused) {
      void media
        .play()
        .then(() => {
          setPlaying(true);
          setBlocked(false);
        })
        .catch(() => setBlocked(true));
      return;
    }

    media.pause();
    setPlaying(false);
  };

  const handleEnded = () => {
    if (settings.musicLoop || tracks.length > 1) {
      goToTrack("next");
    } else {
      setPlaying(false);
    }
  };

  if (showSpotify) {
    return (
      <aside className={`display-music-player spotify-player music-player-${placement}`} aria-label={settings.musicTitle}>
        <iframe
          title={settings.musicTitle}
          src={spotifyEmbedUrl}
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
        />
      </aside>
    );
  }

  return (
    <aside className={`display-music-player music-player-${placement}`} aria-label={settings.musicTitle}>
      <div className="music-copy">
        <Music aria-hidden="true" />
        <div>
          <strong>{settings.musicTitle}</strong>
          <span>{currentTrack ? getTrackName(currentTrack) : settings.labels.musicEmpty}</span>
        </div>
      </div>

      {currentTrack && isVideoUrl(currentTrack) ? (
        <video ref={(element) => { mediaRef.current = element; }} src={currentTrack} playsInline onEnded={handleEnded} />
      ) : (
        <audio ref={(element) => { mediaRef.current = element; }} src={currentTrack || undefined} onEnded={handleEnded} />
      )}

      <div className="music-controls">
        <button type="button" onClick={() => goToTrack("previous")} disabled={tracks.length < 2} aria-label={settings.labels.musicPrevious}>
          <SkipBack aria-hidden="true" />
        </button>
        <button type="button" onClick={handleTogglePlay} disabled={!currentTrack} aria-label={playing ? settings.labels.musicPause : settings.labels.musicPlay}>
          {playing ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
        </button>
        <button type="button" onClick={() => goToTrack("next")} disabled={tracks.length < 2} aria-label={settings.labels.musicNext}>
          <SkipForward aria-hidden="true" />
        </button>
        <label aria-label="Music volume">
          <Volume2 aria-hidden="true" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(event) => {
              const nextVolume = Number(event.target.value);
              const media = mediaRef.current;

              setVolume(nextVolume);

              if (media) {
                media.volume = nextVolume;
              }
            }}
          />
        </label>
      </div>

      {blocked ? <small>{settings.labels.musicBlocked}</small> : null}
    </aside>
  );
}
