import { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Repeat,
  Shuffle,
  Heart,
} from "lucide-react";

interface Track {
  id: string;
  title: string;
  description: string;
  style: string[];
  duration: number;
  createdAt: Date;
}

interface AudioPlayerProps {
  track: Track | null;
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
}

export function AudioPlayer({
  track,
  isPlaying,
  onPlayPause,
  onNext,
  onPrevious,
}: AudioPlayerProps) {
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(75);
  const [isMuted, setIsMuted] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isPlaying && track) {
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
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, track, onNext]);

  useEffect(() => {
    setProgress(0);
    setIsLiked(false);
  }, [track?.id]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!track) {
    return (
      <div className="h-32 bg-gray-900 rounded-2xl flex items-center justify-center border border-gray-800">
        <p className="text-gray-500">트랙을 선택하거나 생성해주세요</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700 shadow-xl">
      <div className="space-y-4">
        {/* Progress bar */}
        <div className="space-y-2">
          <Slider
            value={[progress]}
            max={track.duration}
            step={1}
            onValueChange={(value) => setProgress(value[0])}
            className="cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>{formatTime(progress)}</span>
            <span>{formatTime(track.duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          {/* Left: Volume */}
          <div className="flex items-center gap-2 w-32">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setIsMuted(!isMuted)}
              className="text-gray-400 hover:text-white"
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </Button>
            <Slider
              value={[isMuted ? 0 : volume]}
              max={100}
              step={1}
              onValueChange={(value) => {
                setVolume(value[0]);
                setIsMuted(false);
              }}
              className="cursor-pointer"
            />
          </div>

          {/* Center: Playback controls */}
          <div className="flex items-center gap-4">
            <Button
              size="icon"
              variant="ghost"
              className="text-gray-400 hover:text-white"
            >
              <Shuffle className="w-4 h-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={onPrevious}
              className="text-gray-400 hover:text-white"
            >
              <SkipBack className="w-5 h-5" />
            </Button>
            <Button
              size="icon"
              onClick={onPlayPause}
              className="w-14 h-14 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 text-white" />
              ) : (
                <Play className="w-6 h-6 text-white ml-1" />
              )}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={onNext}
              className="text-gray-400 hover:text-white"
            >
              <SkipForward className="w-5 h-5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="text-gray-400 hover:text-white"
            >
              <Repeat className="w-4 h-4" />
            </Button>
          </div>

          {/* Right: Like button */}
          <div className="w-32 flex justify-end">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setIsLiked(!isLiked)}
              className={
                isLiked ? "text-red-500" : "text-gray-400 hover:text-white"
              }
            >
              <Heart className={`w-5 h-5 ${isLiked ? "fill-red-500" : ""}`} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
