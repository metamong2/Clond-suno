import { Sparkles, TrendingUp, Music2, Heart } from "lucide-react";

export function ExploreView() {
  const categories = [
    {
      title: "인기 스타일",
      icon: TrendingUp,
      items: [
        { name: "로파이 힙합", emoji: "🎧", color: "from-purple-400 to-pink-400" },
        { name: "신스웨이브", emoji: "🌆", color: "from-cyan-400 to-blue-500" },
        { name: "앰비언트", emoji: "🌌", color: "from-indigo-400 to-purple-500" },
        { name: "일렉트로닉", emoji: "⚡", color: "from-yellow-400 to-orange-500" },
      ],
    },
    {
      title: "분위기별",
      icon: Heart,
      items: [
        { name: "집중할 때", emoji: "🎯", color: "from-green-400 to-emerald-500" },
        { name: "운동할 때", emoji: "💪", color: "from-red-400 to-pink-500" },
        { name: "휴식할 때", emoji: "😌", color: "from-blue-400 to-cyan-400" },
        { name: "공부할 때", emoji: "📚", color: "from-purple-400 to-violet-500" },
      ],
    },
  ];

  return (
    <div className="pb-32">
      {/* Header */}
      <div className="px-6 py-6 bg-gradient-to-b from-blue-500 to-purple-500 text-white">
        <h1 className="text-3xl font-bold mb-2">둘러보기</h1>
        <p className="text-sm text-white/80">AI가 추천하는 음악 스타일</p>
      </div>

      {/* Featured */}
      <div className="px-6 py-6">
        <div className="bg-gradient-to-br from-yellow-400 via-pink-400 to-purple-500 rounded-3xl p-8 text-white shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-6 h-6" />
            <span className="text-sm font-semibold">추천</span>
          </div>
          <h2 className="text-2xl font-bold mb-2">AI 음악 생성의 시작</h2>
          <p className="text-sm text-white/90 mb-6">
            텍스트로 설명하면 AI가 당신만의 음악을 만들어드립니다
          </p>
          <button className="bg-white text-purple-600 px-6 py-3 rounded-full font-semibold shadow-lg hover:scale-105 transition-transform">
            지금 시작하기
          </button>
        </div>
      </div>

      {/* Categories */}
      {categories.map((category, idx) => (
        <div key={idx} className="mb-8">
          <div className="flex items-center gap-2 px-6 mb-4">
            <category.icon className="w-5 h-5 text-gray-600" />
            <h2 className="text-xl font-bold">{category.title}</h2>
          </div>

          <div className="px-6 grid grid-cols-2 gap-3">
            {category.items.map((item, itemIdx) => (
              <button
                key={itemIdx}
                className="aspect-square rounded-2xl bg-gradient-to-br shadow-lg hover:scale-105 transition-transform overflow-hidden"
                style={{ backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-stops))` }}
              >
                <div className={`w-full h-full bg-gradient-to-br ${item.color} p-4 flex flex-col justify-between`}>
                  <span className="text-4xl">{item.emoji}</span>
                  <span className="text-white font-semibold text-left">{item.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Tips */}
      <div className="px-6 mt-8">
        <div className="bg-gray-50 rounded-2xl p-6">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Music2 className="w-5 h-5 text-blue-500" />
            사용 팁
          </h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex gap-2">
              <span>•</span>
              <span>구체적으로 설명할수록 원하는 음악에 가까워집니다</span>
            </li>
            <li className="flex gap-2">
              <span>•</span>
              <span>장르, 악기, 템포 등을 포함해보세요</span>
            </li>
            <li className="flex gap-2">
              <span>•</span>
              <span>여러 스타일을 조합하여 독특한 음악을 만들 수 있습니다</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
