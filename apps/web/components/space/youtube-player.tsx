"use client";

import { useEffect, useRef, useState } from "react";
import { usePlayerStore } from "@/store/use-player-store";
import { useParams } from "next/navigation";
import { usePlayback } from "@/hooks/use-playback";

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
}

export default function YoutubePlayer() {
  const { id: spaceId } = useParams<{ id: string }>();
  const {
    currentSong,
    isPlaying,
    volume,
    setDuration,
    setProgress,
    pause: setStorePause,
    play: setStorePlay,
  } = usePlayerStore();
  const { next, playbackState } = usePlayback(spaceId);

  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);

  // 1. Load YouTube IFrame API
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        console.log("YouTube IFrame API Ready");
      };
    }
  }, []);

  // 2. Initialize Player when YT is ready and currentSong changes
  useEffect(() => {
    if (!currentSong?.youtubeId || !window.YT || !window.YT.Player) return;

    if (playerRef.current) {
      if (playbackState) {
        if (playerRef.current) {
          const startSeconds =
            (playbackState?.isPaused
              ? playbackState.pausedAt
              : playbackState?.startedAt
                ? Date.now() - playbackState.startedAt
                : 0) / 1000;
          console.log(
            "[YoutubePlayer] Loading new video:",
            currentSong.title,
            "at:",
            startSeconds,
          );
          playerRef.current.loadVideoById({
            videoId: currentSong.youtubeId,
            startSeconds: Math.max(0, startSeconds),
          });
          if (!isPlaying) {
            playerRef.current.pauseVideo();
          } else {
            playerRef.current.playVideo();
          }
          return;
        }
      }
      return;
    }

    console.log(
      "[YoutubePlayer] Initializing new player for:",
      currentSong.title,
    );

    const initPlayer = () => {
      playerRef.current = new window.YT.Player("youtube-player-element", {
        height: "0",
        width: "0",
        videoId: currentSong.youtubeId,
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
        },
        events: {
          onReady: (event: any) => {
            console.log("Player Ready");
            setIsReady(true);
            event.target.setVolume(volume);
            setDuration(event.target.getDuration());

            if (playbackState) {
              const now = Date.now();
              let seekTo = 0;
              if (playbackState.isPaused) {
                seekTo = playbackState.pausedAt / 1000;
              } else {
                seekTo = (now - playbackState.startedAt) / 1000;
              }
              event.target.seekTo(seekTo, true);
            }

            if (isPlaying) {
              event.target.playVideo();
            } else {
              event.target.pauseVideo();
            }
          },
          onStateChange: (event: any) => {
            console.log("[YoutubePlayer] Player state changed:", event.data);
            // YT.PlayerState.ENDED = 0
            if (event.data === 0) {
              console.log("Song Ended, skipping to next...");
              next();
            }
            // Sync play/pause if changed from within YT (though controls are hidden)
            if (event.data === 1) setStorePlay();
            if (event.data === 2) setStorePause();
          },
        },
      });
    };

    initPlayer();

    return () => {
      if (playerRef.current) {
        // playerRef.current.destroy();
      }
    };
  }, [currentSong?.youtubeId]);

  // 3. Sync Play/Pause state
  useEffect(() => {
    if (!playerRef.current || !isReady) return;
    console.log(
      "[YoutubePlayer] Syncing play/pause:",
      isPlaying ? "PLAY" : "PAUSE",
    );
    if (isPlaying) {
      playerRef.current.playVideo();
    } else {
      playerRef.current.pauseVideo();
    }
  }, [isPlaying, isReady]);

  // 4. Sync Volume
  useEffect(() => {
    if (!playerRef.current || !isReady) return;
    playerRef.current.setVolume(volume);
  }, [volume, isReady]);

  // 5. Track Progress
  useEffect(() => {
    if (!playerRef.current || !isReady || !isPlaying) return;

    const interval = setInterval(() => {
      if (
        playerRef.current &&
        typeof playerRef.current.getCurrentTime === "function"
      ) {
        const currentTime = playerRef.current.getCurrentTime();
        const totalTime = playerRef.current.getDuration();
        if (totalTime > 0) {
          setProgress((currentTime / totalTime) * 100);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isReady, isPlaying, setProgress]);

  return (
    <div className="fixed inset-0 pointer-events-none opacity-0 z-[-1]">
      <div id="youtube-player-element" ref={containerRef} />
    </div>
  );
}
