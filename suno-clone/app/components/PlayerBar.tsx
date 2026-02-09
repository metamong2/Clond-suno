import { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from "lucide-react";
import * as SliderPrimitive from "@radix-ui/react-slider";

interface Track {
  id: string;
  title: string;
  description: string;
  genre: string;
  mood: string;
  tempo: string;
  length: string;
  duration: number;
  createdAt: Date;
}

interface PlayerBarProps {
  track: Track | null;
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
}

export function PlayerBar({
  track,
  isPlaying,
  onPlayPause,
  onNext,
  onPrevious,
}: PlayerBarProps) {
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(70);
  const [isMuted, setIsMuted] = useState(false);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(Date.now());
  const progressRef = useRef<number>(0); // progress 값을 실시간으로 추적

  // progress 값을 ref에도 동기화
  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  useEffect(() => {
    // 트랙이 변경되면 애니메이션 프레임 취소하고 진행 상태 초기화
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setProgress(0);
    lastTimeRef.current = Date.now();
  }, [track?.id]);

  useEffect(() => {
    if (isPlaying && track) {
      const animate = () => {
        const now = Date.now();
        const deltaTime = (now - lastTimeRef.current) / 1000; // 초 단위로 변환
        lastTimeRef.current = now;

        setProgress((prev) => {
          const newProgress = prev + deltaTime;
          if (newProgress >= track.duration) {
            // 다음 트랙으로 이동하기 전에 애니메이션 정리
            if (animationFrameRef.current) {
              cancelAnimationFrame(animationFrameRef.current);
            }
            onNext();
            return 0;
          }
          return newProgress;
        });

        animationFrameRef.current = requestAnimationFrame(animate);
      };

      lastTimeRef.current = Date.now();
      animationFrameRef.current = requestAnimationFrame(animate);
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, track, onNext]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handlePrevious = () => {
    // 3초 이상 재생된 경우 0:00으로 돌아가기
    if (progressRef.current > 3) {
      setProgress(0);
      lastTimeRef.current = Date.now();
    } else {
      // 3초 이하인 경우 이전 트랙으로
      onPrevious();
    }
  };

  if (!track) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#1a1d28] border-t border-gray-800 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        {/* Progress Bar */}
        <div className="mb-4">
          <SliderPrimitive.Root
            value={[progress]}
            max={track.duration}
            step={0.01}
            onValueChange={(value) => {
              setProgress(value[0]);
              lastTimeRef.current = Date.now();
            }}
            className="relative flex w-full touch-none items-center select-none cursor-pointer h-4"
          >
            <SliderPrimitive.Track className="bg-gray-700 relative grow overflow-hidden rounded-full h-1 w-full">
              <SliderPrimitive.Range className="bg-gradient-to-r from-teal-400 to-emerald-400 absolute h-full" />
            </SliderPrimitive.Track>
            <SliderPrimitive.Thumb className="block w-3 h-3 bg-teal-400 rounded-full shadow-lg shadow-teal-500/50 hover:scale-125 focus-visible:outline-none transition-transform duration-100" />
          </SliderPrimitive.Root>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>{formatTime(Math.floor(progress))}</span>
            <span>{formatTime(track.duration)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          {/* Track Info */}
          <div className="flex-1 min-w-0 mr-8">
            <h3 className="text-white font-semibold truncate">{track.title}</h3>
            <p className="text-sm text-gray-400 truncate">
              {track.genre} • {track.mood} • {track.tempo}
            </p>
          </div>

          {/* Playback Controls */}
          <div className="flex items-center gap-4">
            <Button
              size="icon"
              variant="ghost"
              onClick={handlePrevious}
              className="text-gray-400 hover:text-white"
            >
              <SkipBack className="w-5 h-5" />
            </Button>
            <Button
              size="icon"
              onClick={onPlayPause}
              className="w-12 h-12 rounded-full bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-500 hover:to-emerald-500 shadow-lg shadow-teal-500/30"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 text-white fill-white" />
              ) : (
                <Play className="w-5 h-5 text-white fill-white ml-0.5" />
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
          </div>

          {/* Volume Control */}
          <div className="flex-1 flex items-center justify-end gap-3">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setIsMuted(!isMuted)}
              className="text-gray-400 hover:text-white"
            >
              {isMuted ? (
                <VolumeX className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </Button>
            <SliderPrimitive.Root
              value={[isMuted ? 0 : volume]}
              max={100}
              step={1}
              onValueChange={(value) => {
                setVolume(value[0]);
                setIsMuted(false);
              }}
              className="relative flex w-32 touch-none items-center select-none cursor-pointer h-4"
            >
              <SliderPrimitive.Track className="bg-gray-700 relative grow overflow-hidden rounded-full h-1 w-full">
                <SliderPrimitive.Range className="bg-gradient-to-r from-orange-400 to-red-400 absolute h-full" />
              </SliderPrimitive.Track>
              <SliderPrimitive.Thumb className="block w-3 h-3 bg-orange-400 rounded-full shadow-lg shadow-orange-500/50 hover:scale-125 focus-visible:outline-none transition-transform" />
            </SliderPrimitive.Root>
          </div>
        </div>
      </div>
    </div>
  );
}
