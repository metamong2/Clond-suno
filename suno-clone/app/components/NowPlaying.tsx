import { Badge } from "./ui/badge";
import { Music2 } from "lucide-react";

interface Track {
  id: string;
  title: string;
  description: string;
  style: string[];
  duration: number;
  createdAt: Date;
}

interface NowPlayingProps {
  track: Track | null;
}

export function NowPlaying({ track }: NowPlayingProps) {
  if (!track) {
    return (
      <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
        <div className="flex items-center justify-center h-40">
          <div className="text-center space-y-2">
            <Music2 className="w-12 h-12 text-gray-700 mx-auto" />
            <p className="text-gray-600 text-sm">재생 중인 트랙이 없습니다</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-500/10" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />

      <div className="relative space-y-4">
        <div className="flex items-center gap-2 text-cyan-400 text-sm">
          <div className="flex items-center gap-1">
            <div className="w-1 h-3 bg-cyan-400 rounded-full animate-pulse" />
            <div
              className="w-1 h-4 bg-cyan-400 rounded-full animate-pulse"
              style={{ animationDelay: "150ms" }}
            />
            <div
              className="w-1 h-3 bg-cyan-400 rounded-full animate-pulse"
              style={{ animationDelay: "300ms" }}
            />
          </div>
          <span>NOW PLAYING</span>
        </div>

        <div>
          <h2 className="text-3xl font-bold text-white mb-2">{track.title}</h2>
          <p className="text-gray-400">{track.description}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {track.style.map((styleId) => (
            <Badge
              key={styleId}
              variant="secondary"
              className="bg-cyan-400/20 text-cyan-300 border-cyan-400/50"
            >
              {styleId}
            </Badge>
          ))}
        </div>

        {/* Waveform visualization placeholder */}
        <div className="flex items-end gap-1 h-20 mt-6">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="flex-1 bg-gradient-to-t from-cyan-500 to-blue-500 rounded-t-sm opacity-50"
              style={{
                height: `${Math.random() * 100}%`,
                animation: `pulse ${1 + Math.random()}s ease-in-out infinite`,
                animationDelay: `${i * 0.05}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
