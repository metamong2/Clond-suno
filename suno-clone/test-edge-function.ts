// Test script for generate-music Edge Function
// 사용 방법: deno run --allow-net test-edge-function.ts

const SUPABASE_URL =
  Deno.env.get("SUPABASE_URL") || "https://your-project.supabase.co";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || "your-anon-key";

// Test input data
const testPrompts = [
  "upbeat pop music with electric guitar and drums",
  "chill lo-fi hip hop beats for studying",
  "energetic dance music with synthesizer",
];

async function testGenerateMusic(prompt: string): Promise<void> {
  const functionUrl = `${SUPABASE_URL}/functions/v1/generate-music`;

  console.log("\n========================================");
  console.log(`📝 테스트 요청: "${prompt}"`);
  console.log("========================================");
  console.log(`URL: ${functionUrl}`);
  console.log(`시간: ${new Date().toISOString()}`);

  try {
    const response = await fetch(functionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        prompt,
      }),
    });

    const responseText = await response.text();
    console.log(`\n✅ 응답 상태: ${response.status} ${response.statusText}`);
    console.log(`응답 헤더:`, {
      contentType: response.headers.get("content-type"),
      contentLength: response.headers.get("content-length"),
    });

    try {
      const data = JSON.parse(responseText);
      console.log(`\n📦 응답 데이터:`);
      console.log(JSON.stringify(data, null, 2));

      if (data.url) {
        console.log(`\n🎵 생성된 음악 URL: ${data.url}`);
      }
      if (data.error) {
        console.log(`\n❌ 에러: ${data.error}`);
      }
    } catch {
      console.log(`\n📄 응답 텍스트:`);
      console.log(responseText);
    }
  } catch (error) {
    console.error(`\n❌ 요청 실패:`, error.message);
    if (error.cause) {
      console.error(`원인:`, error.cause);
    }
  }
}

async function runTests(): Promise<void> {
  console.log("🚀 Edge Function 테스트 시작");
  console.log(`Supabase URL: ${SUPABASE_URL}`);

  // 첫 번째 프롬프트만 테스트 (시간 절약)
  await testGenerateMusic(testPrompts[0]);

  console.log("\n\n✨ 테스트 완료!");
}

// Run tests
runTests().catch(console.error);
