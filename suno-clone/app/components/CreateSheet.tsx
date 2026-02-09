import { useState } from "react";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { X, Sparkles } from "lucide-react";

interface CreateSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (track: {
    id: string;
    title: string;
    description: string;
    tags: string[];
    duration: number;
    createdAt: Date;
  }) => void;
}

const genreOptions = [
  "팝",
  "록",
  "힙합",
  "재즈",
  "일렉트로닉",
  "인디",
  "R&B",
  "클래식",
];
const moodOptions = [
  "신나는",
  "차분한",
  "감성적",
  "우울한",
  "행복한",
  "몽환적",
  "강렬한",
  "로맨틱한",
];

export function CreateSheet({ isOpen, onClose, onGenerate }: CreateSheetProps) {
  const [description, setDescription] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string>("");
  const [selectedMood, setSelectedMood] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!description.trim()) return;

    setIsGenerating(true);
    await new Promise((resolve) => setTimeout(resolve, 2500));

    const tags = [selectedGenre, selectedMood].filter(Boolean);
    const newTrack = {
      id: `track-${Date.now()}`,
      title: description.slice(0, 40) || "새로운 트랙",
      description,
      tags,
      duration: Math.floor(Math.random() * 180) + 90,
      createdAt: new Date(),
    };

    onGenerate(newTrack);
    setIsGenerating(false);
    setDescription("");
    setSelectedGenre("");
    setSelectedMood("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl max-h-[85vh] overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">AI로 음악 만들기</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6 overflow-y-auto max-h-[calc(85vh-140px)]">
          {/* Description */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">
              음악 설명
            </label>
            <Textarea
              placeholder="예: 여름날 해변가에서 듣기 좋은 경쾌한 기타 선율"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="resize-none bg-gray-50 border-gray-200 rounded-2xl"
            />
          </div>

          {/* Genre */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">장르</label>
            <div className="grid grid-cols-4 gap-2">
              {genreOptions.map((genre) => (
                <button
                  key={genre}
                  onClick={() =>
                    setSelectedGenre(genre === selectedGenre ? "" : genre)
                  }
                  className={`py-3 px-4 rounded-xl text-sm font-medium transition-all ${
                    selectedGenre === genre
                      ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>

          {/* Mood */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">분위기</label>
            <div className="grid grid-cols-4 gap-2">
              {moodOptions.map((mood) => (
                <button
                  key={mood}
                  onClick={() =>
                    setSelectedMood(mood === selectedMood ? "" : mood)
                  }
                  className={`py-3 px-4 rounded-xl text-sm font-medium transition-all ${
                    selectedMood === mood
                      ? "bg-purple-500 text-white shadow-lg shadow-purple-500/30"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {mood}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-white">
          <Button
            onClick={handleGenerate}
            disabled={!description.trim() || isGenerating}
            className="w-full h-14 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-full text-lg font-semibold shadow-lg shadow-blue-500/30"
          >
            {isGenerating ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                생성 중...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                생성하기
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
