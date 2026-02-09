import { useState } from "react";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Sparkles, Loader2 } from "lucide-react";
import { Card } from "./ui/card";

interface MusicGeneratorProps {
  onGenerate: (track: {
    id: string;
    title: string;
    prompt: string;
    genre: string;
    mood: string;
    duration: number;
    createdAt: Date;
  }) => void;
}

export function MusicGenerator({ onGenerate }: MusicGeneratorProps) {
  const [prompt, setPrompt] = useState("");
  const [genre, setGenre] = useState("pop");
  const [mood, setMood] = useState("energetic");
  const [isGenerating, setIsGenerating] = useState(false);

  const genres = [
    { value: "pop", label: "팝" },
    { value: "rock", label: "록" },
    { value: "hiphop", label: "힙합" },
    { value: "electronic", label: "일렉트로닉" },
    { value: "jazz", label: "재즈" },
    { value: "classical", label: "클래식" },
    { value: "kpop", label: "케이팝" },
    { value: "indie", label: "인디" },
  ];

  const moods = [
    { value: "energetic", label: "활기찬" },
    { value: "calm", label: "차분한" },
    { value: "happy", label: "행복한" },
    { value: "melancholic", label: "우울한" },
    { value: "dramatic", label: "드라마틱한" },
    { value: "romantic", label: "로맨틱한" },
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);

    // 실제 API 호출을 시뮬레이션
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const newTrack = {
      id: `track-${Date.now()}`,
      title: prompt.slice(0, 50) || "새로운 트랙",
      prompt,
      genre,
      mood,
      duration: Math.floor(Math.random() * 120) + 120, // 2-4분
      createdAt: new Date(),
    };

    onGenerate(newTrack);
    setIsGenerating(false);
    setPrompt("");
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-600 rounded-lg">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-xl text-gray-900">AI 음악 생성</h2>
            <p className="text-sm text-gray-600">원하는 음악을 설명해주세요</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="prompt">음악 설명</Label>
            <Textarea
              id="prompt"
              placeholder="예: 여름 해변가에서 듣기 좋은 경쾌한 기타 멜로디..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              className="resize-none bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="genre">장르</Label>
              <Select value={genre} onValueChange={setGenre}>
                <SelectTrigger id="genre" className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {genres.map((g) => (
                    <SelectItem key={g.value} value={g.value}>
                      {g.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mood">분위기</Label>
              <Select value={mood} onValueChange={setMood}>
                <SelectTrigger id="mood" className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {moods.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                생성 중...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                음악 생성하기
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}
