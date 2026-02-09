import { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";
import {
  ChevronDown,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat,
  Shuffle,
  Heart,
  Share2,
  MoreHorizontal,
} from "lucide-react";

interface Track {
  id: string;
  title: string;
  description: string;
  tags: string[];
  duration: number;
  createdAt: Date;
}

interface FullPlayerProps {
  track: Track;
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onClose: () => void;
}

export function FullPlayer({
  track,
  isPlaying,
  onPlayPause,
  onNext,
  onPrevious,
  onClose,
}: FullPlayerProps) {
  const [progress, setProgress] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= track.duration) {
            onNext();
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, track.duration, onNext]);

  useEffect(() => {
    setProgress(0);
  }, [track.id]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-purple-400 via-pink-300 to-blue-300 animate-fade-in">
      <div className="h-full flex flex-col px-6 py-8 safe-area-inset">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
          >
            <ChevronDown className="w-6 h-6 text-white" />
          </button>
          <div className="text-xs font-medium text-white/80">재생 중</div>
          <button className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <MoreHorizontal className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Album art */}
        <div className="flex-1 flex items-center justify-center mb-8">
          <div className="w-full max-w-sm aspect-square rounded-3xl bg-white/20 backdrop-blur-md shadow-2xl overflow-hidden border border-white/30">
            <div className="w-full h-full bg-gradient-to-br from-blue-400/30 to-purple-500/30 flex items-center justify-center">
              <div className="text-8xl">🎵</div>
            </div>
          </div>
        </div>

        {/* Track info */}
        <div className="mb-6">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0 mr-4">
              <h1 className="text-2xl font-bold text-white mb-1 truncate">
                {track.title}
              </h1>
              <p className="text-sm text-white/70 truncate">
                {track.description}
              </p>
            </div>
            <button
              onClick={() => setIsLiked(!isLiked)}
              className="w-10 h-10 flex items-center justify-center flex-shrink-0"
            >
              <Heart
                className={`w-6 h-6 ${isLiked ? "fill-red-500 text-red-500" : "text-white"}`}
              />
            </button>
          </div>
          {track.tags.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {track.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Progress */}
        <div className="mb-6">
          <Slider
            value={[progress]}
            max={track.duration}
            step={1}
            onValueChange={(value) => setProgress(value[0])}
            className="mb-2"
          />
          <div className="flex justify-between text-xs text-white/70">
            <span>{formatTime(progress)}</span>
            <span>{formatTime(track.duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="mb-4">
          <div className="flex items-center justify-center gap-6 mb-6">
            <Button
              size="icon"
              variant="ghost"
              onClick={onPrevious}
              className="text-white"
            >
              <SkipBack className="w-7 h-7 fill-current" />
            </Button>
            <button
              onClick={onPlayPause}
              className="w-20 h-20 rounded-full bg-white shadow-2xl flex items-center justify-center hover:scale-105 transition-transform"
            >
              {isPlaying ? (
                <Pause className="w-9 h-9 fill-current text-gray-900" />
              ) : (
                <Play className="w-9 h-9 fill-current text-gray-900 ml-1" />
              )}
            </button>
            <Button
              size="icon"
              variant="ghost"
              onClick={onNext}
              className="text-white"
            >
              <SkipForward className="w-7 h-7 fill-current" />
            </Button>
          </div>

          <div className="flex items-center justify-between px-4">
            <Button size="icon" variant="ghost" className="text-white">
              <Shuffle className="w-5 h-5" />
            </Button>
            <Button size="icon" variant="ghost" className="text-white">
              <Repeat className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center gap-8 pt-4 border-t border-white/20">
          <button className="flex flex-col items-center gap-1">
            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Share2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs text-white/70">공유</span>
          </button>
        </div>
      </div>
    </div>
  );
}
