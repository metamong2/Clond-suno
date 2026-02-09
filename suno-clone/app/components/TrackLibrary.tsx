import {
  Play,
  Pause,
  Download,
  Share2,
  Trash2,
  Music,
  Facebook,
  Twitter,
  Instagram,
  Link2,
  Copy,
  X,
} from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { useState } from "react";

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

interface TrackLibraryProps {
  tracks: Track[];
  currentTrack: Track | null;
  isPlaying: boolean;
  onTrackSelect: (track: Track) => void;
  onDelete: (trackId: string) => void;
}

export function TrackLibrary({
  tracks,
  currentTrack,
  isPlaying,
  onTrackSelect,
  onDelete,
}: TrackLibraryProps) {
  const [shareModalOpen, setShareModalOpen] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const getShareUrl = (track: Track) => {
    // 실제 프로덕션에서는 실제 트랙 URL을 사용
    return `${window.location.origin}/track/${track.id}`;
  };

  const handleShare = (platform: string, track: Track) => {
    const url = getShareUrl(track);
    const text = `Check out my AI-generated track: ${track.title}`;

    switch (platform) {
      case "facebook":
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
          "_blank",
          "width=600,height=400",
        );
        break;
      case "twitter":
        window.open(
          `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
          "_blank",
          "width=600,height=400",
        );
        break;
      case "instagram":
        // 인스타그램은 웹에서 직접 공유 불가, 링크 복사 후 안내
        handleCopyLink(track);
        alert(
          "Link copied! Open Instagram and paste the link in your post or story.",
        );
        break;
      case "copy":
        handleCopyLink(track);
        break;
    }

    setShareModalOpen(null);
  };

  const handleCopyLink = async (track: Track) => {
    const url = getShareUrl(track);
    try {
      await navigator.clipboard.writeText(url);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  const handleDownload = (track: Track) => {
    // 모의 오디오 파일 생성 (실제로는 서버에서 생성된 오디오 파일을 다운로드)
    const audioContext = new (
      window.AudioContext || (window as any).webkitAudioContext
    )();
    const duration = track.duration;
    const sampleRate = audioContext.sampleRate;
    const numChannels = 2;
    const frameCount = sampleRate * duration;

    // AudioBuffer 생성
    const audioBuffer = audioContext.createBuffer(
      numChannels,
      frameCount,
      sampleRate,
    );

    // 간단한 톤 생성 (실제로는 AI가 생성한 오디오 데이터)
    for (let channel = 0; channel < numChannels; channel++) {
      const nowBuffering = audioBuffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        // 사인파 생성 (440Hz, 점점 페이드아웃)
        const t = i / sampleRate;
        const fadeOut = Math.max(0, 1 - t / duration);
        nowBuffering[i] = Math.sin(2 * Math.PI * 440 * t) * 0.2 * fadeOut;
      }
    }

    // WAV 파일로 변환
    const wav = audioBufferToWav(audioBuffer);
    const blob = new Blob([wav], { type: "audio/wav" });
    const url = URL.createObjectURL(blob);

    // 다운로드 링크 생성 및 클릭
    const a = document.createElement("a");
    a.href = url;
    a.download = `${track.title}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // AudioBuffer를 WAV 형식으로 변환하는 헬퍼 함수
  const audioBufferToWav = (buffer: AudioBuffer): ArrayBuffer => {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;

    const bytesPerSample = bitDepth / 8;
    const blockAlign = numChannels * bytesPerSample;

    const data = interleave(buffer);
    const dataLength = data.length * bytesPerSample;
    const headerLength = 44;
    const totalLength = headerLength + dataLength;

    const arrayBuffer = new ArrayBuffer(totalLength);
    const view = new DataView(arrayBuffer);

    // RIFF chunk descriptor
    writeString(view, 0, "RIFF");
    view.setUint32(4, totalLength - 8, true);
    writeString(view, 8, "WAVE");

    // fmt sub-chunk
    writeString(view, 12, "fmt ");
    view.setUint32(16, 16, true); // SubChunk1Size
    view.setUint16(20, format, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);

    // data sub-chunk
    writeString(view, 36, "data");
    view.setUint32(40, dataLength, true);

    // Write PCM samples
    let offset = 44;
    for (let i = 0; i < data.length; i++) {
      const sample = Math.max(-1, Math.min(1, data[i]));
      view.setInt16(
        offset,
        sample < 0 ? sample * 0x8000 : sample * 0x7fff,
        true,
      );
      offset += 2;
    }

    return arrayBuffer;
  };

  const interleave = (buffer: AudioBuffer): Float32Array => {
    const numChannels = buffer.numberOfChannels;
    const length = buffer.length * numChannels;
    const result = new Float32Array(length);

    let offset = 0;
    for (let i = 0; i < buffer.length; i++) {
      for (let channel = 0; channel < numChannels; channel++) {
        result[offset++] = buffer.getChannelData(channel)[i];
      }
    }

    return result;
  };

  const writeString = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  if (tracks.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="bg-[#1a1d28] rounded-2xl p-12 text-center border border-gray-800">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-teal-400/20 to-orange-400/20 flex items-center justify-center">
            <Music className="w-10 h-10 text-teal-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            No tracks yet
          </h3>
          <p className="text-gray-400">
            Create your first AI-generated music track above!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">
          Your Music Library
        </h2>
        <p className="text-gray-400">
          {tracks.length} track{tracks.length !== 1 ? "s" : ""} created
        </p>
      </div>

      <div className="space-y-3">
        {tracks.map((track) => {
          const isCurrentTrack = currentTrack?.id === track.id;
          const isCurrentlyPlaying = isCurrentTrack && isPlaying;

          return (
            <div
              key={track.id}
              className={`bg-[#1a1d28] rounded-xl p-5 border transition-all hover:border-teal-500/50 ${
                isCurrentTrack ? "border-teal-500" : "border-gray-800"
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Album Art */}
                <div className="flex-shrink-0 relative">
                  <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-teal-400 to-orange-400 flex items-center justify-center">
                    <Music className="w-8 h-8 text-white" />
                  </div>
                  <button
                    onClick={() => onTrackSelect(track)}
                    className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                  >
                    {isCurrentlyPlaying ? (
                      <Pause className="w-6 h-6 text-white fill-white" />
                    ) : (
                      <Play className="w-6 h-6 text-white fill-white" />
                    )}
                  </button>
                </div>

                {/* Track Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold mb-1 truncate">
                    {track.title}
                  </h3>
                  <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                    {track.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge
                      variant="secondary"
                      className="bg-[#2a2d3a] text-gray-300 border-0"
                    >
                      {track.genre}
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="bg-[#2a2d3a] text-gray-300 border-0"
                    >
                      {track.mood}
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="bg-[#2a2d3a] text-gray-300 border-0"
                    >
                      {track.tempo}
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="bg-[#2a2d3a] text-gray-300 border-0"
                    >
                      {track.length}
                    </Badge>
                    <span className="text-xs text-gray-500 flex items-center">
                      {formatDate(track.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDownload(track)}
                    className="text-gray-400 hover:text-white hover:bg-gray-800"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setShareModalOpen(track.id)}
                    className="text-gray-400 hover:text-white hover:bg-gray-800"
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => onDelete(track.id)}
                    className="text-gray-400 hover:text-red-500 hover:bg-gray-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Playing Indicator */}
              {isCurrentlyPlaying && (
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-800">
                  <div className="flex items-center gap-1">
                    <div className="w-1 h-3 bg-teal-400 rounded-full animate-pulse" />
                    <div
                      className="w-1 h-4 bg-teal-400 rounded-full animate-pulse"
                      style={{ animationDelay: "150ms" }}
                    />
                    <div
                      className="w-1 h-3 bg-teal-400 rounded-full animate-pulse"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                  <span className="text-xs text-teal-400 font-medium">
                    Now Playing
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Share Modal */}
      {shareModalOpen &&
        (() => {
          const track = tracks.find((t) => t.id === shareModalOpen);
          if (!track) return null;

          return (
            <div
              className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
              onClick={() => setShareModalOpen(null)}
            >
              <div
                className="bg-[#1a1d28] rounded-2xl w-full max-w-md border border-gray-800 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-800">
                  <div>
                    <h3 className="text-xl font-semibold text-white">
                      Share Track
                    </h3>
                    <p className="text-sm text-gray-400 mt-1">{track.title}</p>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setShareModalOpen(null)}
                    className="text-gray-400 hover:text-white hover:bg-gray-800"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                  {/* Social Media Section */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-3">
                      Share on Social Media
                    </h4>
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        onClick={() => handleShare("facebook", track)}
                        className="flex flex-col items-center gap-2 p-4 rounded-xl bg-[#2a2d3a] hover:bg-[#3a3d4a] transition-colors group"
                      >
                        <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Facebook className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xs text-gray-300">Facebook</span>
                      </button>

                      <button
                        onClick={() => handleShare("twitter", track)}
                        className="flex flex-col items-center gap-2 p-4 rounded-xl bg-[#2a2d3a] hover:bg-[#3a3d4a] transition-colors group"
                      >
                        <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Twitter className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xs text-gray-300">X</span>
                      </button>

                      <button
                        onClick={() => handleShare("instagram", track)}
                        className="flex flex-col items-center gap-2 p-4 rounded-xl bg-[#2a2d3a] hover:bg-[#3a3d4a] transition-colors group"
                      >
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Instagram className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xs text-gray-300">Instagram</span>
                      </button>
                    </div>
                  </div>

                  {/* Copy Link Section */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-3">
                      Copy Link
                    </h4>
                    <button
                      onClick={() => handleShare("copy", track)}
                      className="w-full flex items-center gap-3 p-4 rounded-xl bg-[#2a2d3a] hover:bg-[#3a3d4a] transition-colors group"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Link2 className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="text-sm font-medium text-white">
                          Copy link to track
                        </div>
                        <div className="text-xs text-gray-400 truncate">
                          {getShareUrl(track)}
                        </div>
                      </div>
                      <Copy className="w-4 h-4 text-gray-400 group-hover:text-teal-400 transition-colors" />
                    </button>

                    {copySuccess && (
                      <div className="mt-3 p-3 rounded-lg bg-teal-400/10 border border-teal-400/20">
                        <p className="text-sm text-teal-400 text-center flex items-center justify-center gap-2">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          Link copied to clipboard!
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
    </div>
  );
}
