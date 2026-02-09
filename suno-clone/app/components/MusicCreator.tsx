import { useState } from "react";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Sparkles } from "lucide-react";

interface MusicCreatorProps {
  onGenerate: (track: {
    id: string;
    title: string;
    description: string;
    genre: string;
    mood: string;
    tempo: string;
    length: string;
    duration: number;
    createdAt: Date;
  }) => void;
}

export function MusicCreator({ onGenerate }: MusicCreatorProps) {
  const [description, setDescription] = useState("");
  const [genre, setGenre] = useState("Electronic");
  const [mood, setMood] = useState("Energetic");
  const [tempo, setTempo] = useState("Medium");
  const [length, setLength] = useState("2 min");
  const [isGenerating, setIsGenerating] = useState(false);

  const genres = [
    "Electronic",
    "Pop",
    "Rock",
    "Hip Hop",
    "Jazz",
    "Classical",
    "Ambient",
    "Lo-fi",
  ];

  const moods = [
    "Energetic",
    "Calm",
    "Happy",
    "Melancholic",
    "Dramatic",
    "Romantic",
    "Dark",
    "Uplifting",
  ];

  const tempos = ["Slow", "Medium", "Fast", "Very Fast"];

  const lengths = ["30 sec", "1 min", "2 min", "3 min", "4 min", "5 min"];

  const handleGenerate = async () => {
    if (!description.trim()) return;

    setIsGenerating(true);
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const durationMap: { [key: string]: number } = {
      "30 sec": 30,
      "1 min": 60,
      "2 min": 120,
      "3 min": 180,
      "4 min": 240,
      "5 min": 300,
    };

    const newTrack = {
      id: `track-${Date.now()}`,
      title: description.slice(0, 50) || "Untitled Track",
      description,
      genre,
      mood,
      tempo,
      length,
      duration: durationMap[length] || 120,
      createdAt: new Date(),
    };

    onGenerate(newTrack);
    setIsGenerating(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold text-white">
            Create Music with AI
          </h1>
          <p className="text-lg text-gray-400">
            Describe your musical vision and let AI bring it to life
          </p>
        </div>

        {/* Description Input */}
        <div>
          <Textarea
            placeholder="Describe the music you want to create... (e.g., 'Upbeat electronic dance track with synth melodies')"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            className="w-full bg-[#2a2d3a] border-0 text-white placeholder:text-gray-500 text-base rounded-2xl resize-none focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>

        {/* Generate Button */}
        <Button
          onClick={handleGenerate}
          disabled={!description.trim() || isGenerating}
          className="w-full h-14 bg-gradient-to-r from-teal-400 via-emerald-400 to-orange-400 hover:from-teal-500 hover:via-emerald-500 hover:to-orange-500 text-white text-base font-semibold rounded-full shadow-lg shadow-teal-500/20 transition-all"
        >
          {isGenerating ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-2" />
              Generate Music
            </>
          )}
        </Button>

        {/* Options Grid */}
        <div className="grid grid-cols-4 gap-4">
          <div className="space-y-3">
            <label className="text-xs uppercase tracking-wider text-gray-400 font-medium">
              GENRE
            </label>
            <Select value={genre} onValueChange={setGenre}>
              <SelectTrigger className="bg-[#2a2d3a] border-0 text-white h-12 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#2a2d3a] border-gray-700">
                {genres.map((g) => (
                  <SelectItem
                    key={g}
                    value={g}
                    className="text-white focus:bg-gray-700 focus:text-white"
                  >
                    {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <label className="text-xs uppercase tracking-wider text-gray-400 font-medium">
              MOOD
            </label>
            <Select value={mood} onValueChange={setMood}>
              <SelectTrigger className="bg-[#2a2d3a] border-0 text-white h-12 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#2a2d3a] border-gray-700">
                {moods.map((m) => (
                  <SelectItem
                    key={m}
                    value={m}
                    className="text-white focus:bg-gray-700 focus:text-white"
                  >
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <label className="text-xs uppercase tracking-wider text-gray-400 font-medium">
              TEMPO
            </label>
            <Select value={tempo} onValueChange={setTempo}>
              <SelectTrigger className="bg-[#2a2d3a] border-0 text-white h-12 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#2a2d3a] border-gray-700">
                {tempos.map((t) => (
                  <SelectItem
                    key={t}
                    value={t}
                    className="text-white focus:bg-gray-700 focus:text-white"
                  >
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <label className="text-xs uppercase tracking-wider text-gray-400 font-medium">
              LENGTH
            </label>
            <Select value={length} onValueChange={setLength}>
              <SelectTrigger className="bg-[#2a2d3a] border-0 text-white h-12 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#2a2d3a] border-gray-700">
                {lengths.map((l) => (
                  <SelectItem
                    key={l}
                    value={l}
                    className="text-white focus:bg-gray-700 focus:text-white"
                  >
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
