import { useState, useEffect, useRef } from "react";
import { Play, Pause, SkipForward, ChevronUp } from "lucide-react";
import { Button } from "./ui/button";

interface Track {
  id: string;
  title: string;
  description: string;
  tags: string[];
  duration: number;
  createdAt: Date;
}

interface MiniPlayerProps {
  track: Track | null;
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onExpand: () => void;
}

export function MiniPlayer({
  track,
  isPlaying,
  onPlayPause,
  onNext,
  onExpand,
}: MiniPlayerProps) {
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isPlaying && track) {
      intervalRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) return 0;
          return prev + 100 / track.duration;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, track]);

  useEffect(() => {
    setProgress(0);
  }, [track?.id]);

  if (!track) return null;

  return (
    <div
      className="fixed bottom-20 left-4 right-4 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-gray-200"
      onClick={onExpand}
    >
      {/* Progress bar */}
      <div className="h-1 bg-gray-200">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-1000 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex items-center gap-4 px-4 py-3">
        {/* Album art */}
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center flex-shrink-0 shadow-lg">
          <span className="text-xl">🎵</span>
        </div>

        {/* Track info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm truncate">{track.title}</h3>
          <p className="text-xs text-gray-500 truncate">
            {track.description || "AI 생성 음악"}
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onPlayPause();
            }}
            className="w-9 h-9"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current" />
            )}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
            className="w-9 h-9"
          >
            <SkipForward className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
