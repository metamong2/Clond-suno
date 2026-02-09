import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Play, Pause, MoreVertical, Clock, Calendar } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface Track {
  id: string;
  title: string;
  prompt: string;
  genre: string;
  mood: string;
  duration: number;
  createdAt: Date;
}

interface TrackListProps {
  tracks: Track[];
  currentTrack: Track | null;
  isPlaying: boolean;
  onTrackSelect: (track: Track) => void;
  onTrackDelete: (trackId: string) => void;
}

export function TrackList({
  tracks,
  currentTrack,
  isPlaying,
  onTrackSelect,
  onTrackDelete,
}: TrackListProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return "방금 전";
    if (hours < 24) return `${hours}시간 전`;
    if (days < 7) return `${days}일 전`;
    return date.toLocaleDateString("ko-KR");
  };

  if (tracks.length === 0) {
    return (
      <Card className="p-12 text-center">
        <div className="space-y-4">
          <div className="w-20 h-20 mx-auto bg-purple-100 rounded-full flex items-center justify-center">
            <Play className="w-10 h-10 text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-gray-900">
              아직 생성된 음악이 없습니다
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              위에서 음악을 생성해보세요!
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {tracks.map((track, index) => {
        const isCurrentTrack = currentTrack?.id === track.id;
        const isCurrentlyPlaying = isCurrentTrack && isPlaying;

        return (
          <Card
            key={track.id}
            className={`p-4 transition-all hover:shadow-md cursor-pointer ${
              isCurrentTrack ? "bg-purple-50 border-purple-300" : "bg-white"
            }`}
            onClick={() => onTrackSelect(track)}
          >
            <div className="flex items-center gap-4">
              {/* 번호/플레이 버튼 */}
              <div className="flex items-center justify-center w-10 h-10">
                {isCurrentlyPlaying ? (
                  <div className="flex items-center gap-1">
                    <div
                      className="w-1 h-4 bg-purple-600 animate-pulse"
                      style={{ animationDelay: "0ms" }}
                    />
                    <div
                      className="w-1 h-6 bg-purple-600 animate-pulse"
                      style={{ animationDelay: "150ms" }}
                    />
                    <div
                      className="w-1 h-4 bg-purple-600 animate-pulse"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                ) : (
                  <Button
                    size="icon"
                    variant={isCurrentTrack ? "default" : "ghost"}
                    className={
                      isCurrentTrack ? "bg-purple-600 hover:bg-purple-700" : ""
                    }
                    onClick={(e) => {
                      e.stopPropagation();
                      onTrackSelect(track);
                    }}
                  >
                    <Play className="w-4 h-4" />
                  </Button>
                )}
              </div>

              {/* 트랙 정보 */}
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 truncate">
                  {track.title}
                </h4>
                <p className="text-sm text-gray-600 truncate mt-1">
                  {track.prompt}
                </p>
                <div className="flex gap-2 mt-2 flex-wrap">
                  <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                    {track.genre}
                  </span>
                  <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                    {track.mood}
                  </span>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatTime(track.duration)}
                  </span>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(track.createdAt)}
                  </span>
                </div>
              </div>

              {/* 더보기 메뉴 */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onTrackSelect(track);
                    }}
                  >
                    재생
                  </DropdownMenuItem>
                  <DropdownMenuItem>다운로드</DropdownMenuItem>
                  <DropdownMenuItem>공유</DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      onTrackDelete(track.id);
                    }}
                  >
                    삭제
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
