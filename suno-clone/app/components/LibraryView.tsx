import { Play, Pause, MoreHorizontal } from "lucide-react";
import { Button } from "./ui/button";

interface Track {
  id: string;
  title: string;
  description: string;
  tags: string[];
  duration: number;
  createdAt: Date;
}

interface LibraryViewProps {
  tracks: Track[];
  currentTrack: Track | null;
  isPlaying: boolean;
  onTrackSelect: (track: Track) => void;
  onDelete: (trackId: string) => void;
}

export function LibraryView({
  tracks,
  currentTrack,
  isPlaying,
  onTrackSelect,
  onDelete,
}: LibraryViewProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 1) return "방금 전";
    if (hours < 24) return `${hours}시간 전`;
    return date.toLocaleDateString("ko-KR", { month: "short", day: "numeric" });
  };

  if (tracks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
        <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-6">
          <span className="text-5xl">🎵</span>
        </div>
        <h3 className="text-xl font-semibold mb-2">
          라이브러리가 비어있습니다
        </h3>
        <p className="text-sm text-gray-500 max-w-xs">
          하단의 + 버튼을 눌러 첫 번째 AI 음악을 만들어보세요!
        </p>
      </div>
    );
  }

  return (
    <div className="pb-40">
      <div className="px-6 py-4">
        <h1 className="text-3xl font-bold mb-2">라이브러리</h1>
        <p className="text-sm text-gray-500">{tracks.length}개의 트랙</p>
      </div>

      <div className="space-y-0.5">
        {tracks.map((track) => {
          const isCurrentTrack = currentTrack?.id === track.id;
          const isCurrentlyPlaying = isCurrentTrack && isPlaying;

          return (
            <div
              key={track.id}
              onClick={() => onTrackSelect(track)}
              className={`flex items-center gap-4 px-6 py-3 hover:bg-gray-50 active:bg-gray-100 transition-colors ${
                isCurrentTrack ? "bg-blue-50" : ""
              }`}
            >
              {/* Album art */}
              <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center flex-shrink-0 shadow-md relative">
                <span className="text-2xl">🎵</span>
                {isCurrentlyPlaying && (
                  <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center">
                    <div className="flex items-center gap-0.5">
                      <div className="w-0.5 h-3 bg-white rounded-full animate-pulse" />
                      <div
                        className="w-0.5 h-4 bg-white rounded-full animate-pulse"
                        style={{ animationDelay: "150ms" }}
                      />
                      <div
                        className="w-0.5 h-3 bg-white rounded-full animate-pulse"
                        style={{ animationDelay: "300ms" }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Track info */}
              <div className="flex-1 min-w-0">
                <h3
                  className={`font-semibold truncate ${isCurrentTrack ? "text-blue-600" : ""}`}
                >
                  {track.title}
                </h3>
                <p className="text-sm text-gray-500 truncate">
                  {track.description || "AI 생성 음악"}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  {track.tags.slice(0, 2).map((tag) => (
                    <span key={tag} className="text-xs text-gray-400">
                      {tag}
                    </span>
                  ))}
                  <span className="text-xs text-gray-400">
                    • {formatTime(track.duration)}
                  </span>
                  <span className="text-xs text-gray-400">
                    • {formatDate(track.createdAt)}
                  </span>
                </div>
              </div>

              {/* More button */}
              <Button
                size="icon"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  // Show action sheet
                }}
                className="flex-shrink-0"
              >
                <MoreHorizontal className="w-5 h-5 text-gray-400" />
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
