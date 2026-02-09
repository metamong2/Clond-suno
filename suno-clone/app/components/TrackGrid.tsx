import { Play, Pause, MoreHorizontal, Clock } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface Track {
  id: string;
  title: string;
  description: string;
  style: string[];
  duration: number;
  createdAt: Date;
}

interface TrackGridProps {
  tracks: Track[];
  currentTrack: Track | null;
  isPlaying: boolean;
  onTrackSelect: (track: Track) => void;
  onDelete: (trackId: string) => void;
}

export function TrackGrid({
  tracks,
  currentTrack,
  isPlaying,
  onTrackSelect,
  onDelete,
}: TrackGridProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("ko-KR", {
      month: "short",
      day: "numeric",
    });
  };

  if (tracks.length === 0) {
    return (
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-12 text-center">
        <div className="space-y-4">
          <div className="w-20 h-20 mx-auto bg-gray-800 rounded-full flex items-center justify-center">
            <Play className="w-10 h-10 text-gray-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              아직 트랙이 없습니다
            </h3>
            <p className="text-sm text-gray-500 mt-2">
              첫 번째 AI 음악을 만들어보세요!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {tracks.map((track) => {
        const isCurrentTrack = currentTrack?.id === track.id;
        const isCurrentlyPlaying = isCurrentTrack && isPlaying;

        return (
          <div
            key={track.id}
            className={`group bg-gray-900 rounded-xl p-4 border transition-all hover:border-cyan-500/50 cursor-pointer ${
              isCurrentTrack ? "border-cyan-500" : "border-gray-800"
            }`}
            onClick={() => onTrackSelect(track)}
          >
            <div className="flex gap-4">
              {/* Album art placeholder with play button */}
              <div className="relative flex-shrink-0">
                <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
                  <div className="text-2xl">🎵</div>
                </div>
                <button
                  className="absolute inset-0 bg-black/60 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  onClick={(e) => {
                    e.stopPropagation();
                    onTrackSelect(track);
                  }}
                >
                  {isCurrentlyPlaying ? (
                    <Pause className="w-8 h-8 text-white" />
                  ) : (
                    <Play className="w-8 h-8 text-white ml-1" />
                  )}
                </button>
              </div>

              {/* Track info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-white truncate">
                    {track.title}
                  </h3>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      asChild
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        size="icon"
                        variant="ghost"
                        className="flex-shrink-0 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-white"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="bg-gray-800 border-gray-700"
                    >
                      <DropdownMenuItem className="text-gray-300 focus:bg-gray-700 focus:text-white">
                        재생
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-gray-300 focus:bg-gray-700 focus:text-white">
                        다운로드
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-gray-300 focus:bg-gray-700 focus:text-white">
                        공유
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(track.id);
                        }}
                        className="text-red-400 focus:bg-red-900/20 focus:text-red-400"
                      >
                        삭제
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <p className="text-sm text-gray-400 truncate mt-1">
                  {track.description || "설명 없음"}
                </p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  {track.style.slice(0, 2).map((styleId) => (
                    <Badge
                      key={styleId}
                      variant="secondary"
                      className="text-xs bg-gray-800 text-gray-400 border-gray-700"
                    >
                      {styleId}
                    </Badge>
                  ))}
                  {track.style.length > 2 && (
                    <Badge
                      variant="secondary"
                      className="text-xs bg-gray-800 text-gray-400 border-gray-700"
                    >
                      +{track.style.length - 2}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatTime(track.duration)}
                  </span>
                  <span>•</span>
                  <span>{formatDate(track.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Playing indicator */}
            {isCurrentlyPlaying && (
              <div className="flex items-center gap-1 mt-3">
                <div
                  className="w-1 h-3 bg-cyan-400 rounded-full animate-pulse"
                  style={{ animationDelay: "0ms" }}
                />
                <div
                  className="w-1 h-4 bg-cyan-400 rounded-full animate-pulse"
                  style={{ animationDelay: "150ms" }}
                />
                <div
                  className="w-1 h-3 bg-cyan-400 rounded-full animate-pulse"
                  style={{ animationDelay: "300ms" }}
                />
                <div
                  className="w-1 h-4 bg-cyan-400 rounded-full animate-pulse"
                  style={{ animationDelay: "450ms" }}
                />
                <span className="text-xs text-cyan-400 ml-2">재생 중</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
