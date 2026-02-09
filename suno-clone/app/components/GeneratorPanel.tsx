import { useState } from "react";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Wand2, Music, Zap } from "lucide-react";

interface GeneratorPanelProps {
  onGenerate: (track: {
    id: string;
    title: string;
    description: string;
    style: string[];
    duration: number;
    createdAt: Date;
  }) => void;
}

const styleOptions = [
  { id: "upbeat", label: "경쾌한", icon: "🎵" },
  { id: "chill", label: "차분한", icon: "😌" },
  { id: "epic", label: "웅장한", icon: "⚡" },
  { id: "dreamy", label: "몽환적", icon: "✨" },
  { id: "dark", label: "다크", icon: "🌙" },
  { id: "happy", label: "밝은", icon: "☀️" },
  { id: "sad", label: "슬픈", icon: "💧" },
  { id: "intense", label: "강렬한", icon: "🔥" },
];

export function GeneratorPanel({ onGenerate }: GeneratorPanelProps) {
  const [description, setDescription] = useState("");
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const toggleStyle = (styleId: string) => {
    setSelectedStyles((prev) =>
      prev.includes(styleId)
        ? prev.filter((s) => s !== styleId)
        : [...prev, styleId],
    );
  };

  const handleGenerate = async () => {
    if (!description.trim() && selectedStyles.length === 0) return;

    setIsGenerating(true);
    await new Promise((resolve) => setTimeout(resolve, 2500));

    const newTrack = {
      id: `track-${Date.now()}`,
      title: description.slice(0, 40) || "Untitled Track",
      description,
      style: selectedStyles,
      duration: Math.floor(Math.random() * 180) + 90,
      createdAt: new Date(),
    };

    onGenerate(newTrack);
    setIsGenerating(false);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
            <Wand2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">새 트랙 만들기</h2>
            <p className="text-sm text-gray-400">
              AI가 당신의 아이디어를 음악으로
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-gray-300">어떤 음악을 만들고 싶나요?</Label>
          <Textarea
            placeholder="예: 비 오는 날 창가에서 듣기 좋은 피아노 선율..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 resize-none"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-gray-300">스타일 선택 (복수 선택 가능)</Label>
          <div className="grid grid-cols-4 gap-2">
            {styleOptions.map((style) => (
              <button
                key={style.id}
                onClick={() => toggleStyle(style.id)}
                className={`p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                  selectedStyles.includes(style.id)
                    ? "border-cyan-400 bg-cyan-400/20"
                    : "border-gray-700 bg-gray-800 hover:border-gray-600"
                }`}
              >
                <div className="text-2xl mb-1">{style.icon}</div>
                <div className="text-xs text-gray-300">{style.label}</div>
              </button>
            ))}
          </div>
        </div>

        <Button
          onClick={handleGenerate}
          disabled={
            isGenerating || (!description.trim() && selectedStyles.length === 0)
          }
          className="w-full h-14 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white text-lg font-semibold"
        >
          {isGenerating ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              생성 중...
            </>
          ) : (
            <>
              <Zap className="w-5 h-5 mr-2" />
              AI로 생성하기
            </>
          )}
        </Button>
      </div>

      {selectedStyles.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedStyles.map((styleId) => {
            const style = styleOptions.find((s) => s.id === styleId);
            return (
              <Badge
                key={styleId}
                variant="secondary"
                className="bg-cyan-400/20 text-cyan-300 border-cyan-400/50"
              >
                {style?.icon} {style?.label}
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}
