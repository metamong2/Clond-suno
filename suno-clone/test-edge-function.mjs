/**
 * Edge Function 테스트 스크립트 (ESM)
 * fetch API를 사용한 테스트
 */

// 테스트 설정
const SUPABASE_URL = "https://cmnzjowcovqtlqhzmwof.supabase.co";
const FUNCTION_NAME = "generate-music";
const ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtbnpqb3djb3ZxdGxxaHptd29mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA5MTYxMzYsImV4cCI6MTk2NjQ5MjEzNn0.J-rvGJUx7Q4Ipu4yU6kV_3yVqXrNy9Kk3gO9qJ-5Y0s";

// 테스트 데이터
const testData = {
  prompt:
    "Create upbeat pop music with electric guitar drums and catchy melody for a summer beach party",
};

const url = `${SUPABASE_URL}/functions/v1/${FUNCTION_NAME}`;
console.log("\n🚀 Edge Function 테스트 시작");
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
console.log(`URL: ${url}`);
console.log(`시간: ${new Date().toISOString()}`);
console.log(`요청 데이터:`, JSON.stringify(testData, null, 2));
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
console.log("⏳ 요청 중... (최대 5분 소요될 수 있습니다)\n");

try {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 300000); // 5분 타임아웃

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ANON_KEY}`,
    },
    body: JSON.stringify(testData),
    signal: controller.signal,
  });

  clearTimeout(timeoutId);

  console.log(`✅ 응답 상태: ${response.status} ${response.statusText}`);
  console.log(`응답 헤더:`, {
    contentType: response.headers.get("content-type"),
    contentLength: response.headers.get("content-length"),
  });

  const data = await response.text();
  console.log(`\n📦 응답 데이터:\n`);

  try {
    const jsonData = JSON.parse(data);
    console.log(JSON.stringify(jsonData, null, 2));

    if (jsonData.url) {
      console.log(`\n🎵 생성된 음악 URL: ${jsonData.url}`);
    }
    if (jsonData.error) {
      console.log(`\n❌ 에러 메시지: ${jsonData.error}`);
    }
  } catch (e) {
    console.log(data);
  }
} catch (error) {
  if (error.name === "AbortError") {
    console.error(`❌ 요청 타임아웃 (5분 초과)`);
  } else {
    console.error(`❌ 요청 실패:`, error.message);
  }
}

console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
console.log("✨ 테스트 완료");
