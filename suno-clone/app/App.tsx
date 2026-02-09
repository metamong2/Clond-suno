import { useState } from "react";
import { MusicCreator } from "./components/MusicCreator";
import { TrackLibrary } from "./components/TrackLibrary";
import { PlayerBar } from "./components/PlayerBar";
import { Music2, User } from "lucide-react";
import { Button } from "./components/ui/button";

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

export default function App() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleGenerate = (newTrack: Track) => {
    // 중복된 제목 처리
    const baseTitle = newTrack.title;
    const existingTitles = tracks.map((t) => t.title);

    // 같은 기본 제목을 가진 트랙들 찾기 (예: "ㅎㅇㄴㄹ", "ㅎㅇㄴㄹ-2", "ㅎㅇㄴㄹ-3")
    const pattern = new RegExp(
      `^${baseTitle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(-\\d+)?$`,
    );
    const matchingTracks = existingTitles.filter((title) =>
      pattern.test(title),
    );

    if (matchingTracks.length > 0) {
      // 가장 큰 번호 찾기
      let maxNumber = 1;
      matchingTracks.forEach((title) => {
        const match = title.match(/-(\d+)$/);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxNumber) maxNumber = num;
        }
      });

      // 다음 번호 붙이기
      newTrack.title = `${baseTitle}-${maxNumber + 1}`;
    }

    setTracks((prev) => [newTrack, ...prev]);

    // 재생 중인 트랙이 없을 때만 자동으로 재생
    if (!currentTrack) {
      setCurrentTrack(newTrack);
      setIsPlaying(true);
    }
  };

  const handleTrackSelect = (track: Track) => {
    if (currentTrack?.id === track.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentTrack(track);
      setIsPlaying(true);
    }
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    if (tracks.length === 0 || !currentTrack) return;
    const currentIndex = tracks.findIndex((t) => t.id === currentTrack.id);
    if (currentIndex === -1) return;
    const nextIndex = (currentIndex + 1) % tracks.length;
    setCurrentTrack(tracks[nextIndex]);
    setIsPlaying(true);
  };

  const handlePrevious = () => {
    if (tracks.length === 0 || !currentTrack) return;
    const currentIndex = tracks.findIndex((t) => t.id === currentTrack.id);
    if (currentIndex === -1) return;
    const prevIndex = currentIndex <= 0 ? tracks.length - 1 : currentIndex - 1;
    setCurrentTrack(tracks[prevIndex]);
    setIsPlaying(true);
  };

  const handleDelete = (trackId: string) => {
    setTracks((prev) => prev.filter((t) => t.id !== trackId));
    if (currentTrack?.id === trackId) {
      const remaining = tracks.filter((t) => t.id !== trackId);
      setCurrentTrack(remaining[0] || null);
      setIsPlaying(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1118] pb-32">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#0f1118]/95 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-400 flex items-center justify-center">
                <Music2 className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">AI Music Studio</h1>
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="text-gray-400 hover:text-white"
            >
              <User className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {/* Creator Section */}
        <section className="border-b border-gray-800">
          <MusicCreator onGenerate={handleGenerate} />
        </section>

        {/* Library Section */}
        <section className="py-8">
          <TrackLibrary
            tracks={tracks}
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            onTrackSelect={handleTrackSelect}
            onDelete={handleDelete}
          />
        </section>
      </main>

      {/* Player Bar */}
      <PlayerBar
        track={currentTrack}
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
        onNext={handleNext}
        onPrevious={handlePrevious}
      />
    </div>
  );
}
