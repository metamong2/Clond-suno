import { useState, useEffect, useRef } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Download,
  Share2,
} from "lucide-react";

interface Track {
  id: string;
  title: string;
  prompt: string;
  genre: string;
  mood: string;
  duration: number;
  createdAt: Date;
}

interface MusicPlayerProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
}

export function MusicPlayer({
  currentTrack,
  isPlaying,
  onPlayPause,
  onNext,
  onPrevious,
}: MusicPlayerProps) {
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(70);
  const [isMuted, setIsMuted] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isPlaying && currentTrack) {
      intervalRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= currentTrack.duration) {
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
  }, [isPlaying, currentTrack, onNext]);

  useEffect(() => {
    setCurrentTime(0);
  }, [currentTrack?.id]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSeek = (value: number[]) => {
    setCurrentTime(value[0]);
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
    setIsMuted(false);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  if (!currentTrack) {
    return (
      <Card className="p-8 bg-gradient-to-r from-purple-900 to-blue-900 text-white">
        <div className="text-center">
          <p className="text-purple-200">재생할 트랙을 선택해주세요</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-gradient-to-r from-purple-900 to-blue-900 text-white">
      <div className="space-y-4">
        {/* 트랙 정보 */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-xl truncate">{currentTrack.title}</h3>
            <p className="text-sm text-purple-200 truncate mt-1">
              {currentTrack.prompt}
            </p>
            <div className="flex gap-2 mt-2">
              <span className="text-xs bg-purple-800 px-2 py-1 rounded-full">
                {currentTrack.genre}
              </span>
              <span className="text-xs bg-blue-800 px-2 py-1 rounded-full">
                {currentTrack.mood}
              </span>
            </div>
          </div>
          <div className="flex gap-2 ml-4">
            <Button
              size="icon"
              variant="ghost"
              className="text-white hover:bg-white/20"
            >
              <Share2 className="w-4 h-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="text-white hover:bg-white/20"
            >
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* 진행 바 */}
        <div className="space-y-2">
          <Slider
            value={[currentTime]}
            max={currentTrack.duration}
            step={1}
            onValueChange={handleSeek}
            className="cursor-pointer"
          />
          <div className="flex justify-between text-xs text-purple-200">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(currentTrack.duration)}</span>
          </div>
        </div>

        {/* 컨트롤 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1">
            <Button
              size="icon"
              variant="ghost"
              onClick={toggleMute}
              className="text-white hover:bg-white/20"
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
              onValueChange={handleVolumeChange}
              className="w-24 cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="ghost"
              onClick={onPrevious}
              className="text-white hover:bg-white/20"
            >
              <SkipBack className="w-5 h-5" />
            </Button>
            <Button
              size="icon"
              onClick={onPlayPause}
              className="bg-white text-purple-900 hover:bg-purple-100 w-12 h-12"
            >
              {isPlaying ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6 ml-1" />
              )}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={onNext}
              className="text-white hover:bg-white/20"
            >
              <SkipForward className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex-1" />
        </div>
      </div>
    </Card>
  );
}
