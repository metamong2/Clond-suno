#!/usr/bin/env node

/**
 * Edge Function 테스트 스크립트
 * Node.js를 사용한 간단한 테스트
 */

const https = require("https");

// 테스트 설정
const SUPABASE_URL = "cmnzjowcovqtlqhzmwof.supabase.co";
const FUNCTION_NAME = "generate-music";
const ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtbnpqb3djb3ZxdGxxaHptd29mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA5MTYxMzYsImV4cCI6MTk2NjQ5MjEzNn0.J-rvGJUx7Q4Ipu4yU6kV_3yVqXrNy9Kk3gO9qJ-5Y0s";

// 테스트 데이터
const testData = {
  prompt:
    "Create upbeat pop music with electric guitar drums and catchy melody for a summer beach party",
};

// HTTPS 요청
const url = `https://${SUPABASE_URL}/functions/v1/${FUNCTION_NAME}`;
console.log("\n🚀 Edge Function 테스트 시작");
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
console.log(`URL: ${url}`);
console.log(`시간: ${new Date().toISOString()}`);
console.log(`요청 데이터:`, JSON.stringify(testData, null, 2));
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

const payload = JSON.stringify(testData);

const options = {
  hostname: SUPABASE_URL,
  path: `/functions/v1/${FUNCTION_NAME}`,
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(payload),
    Authorization: `Bearer ${ANON_KEY}`,
  },
};

const req = https.request(options, (res) => {
  let data = "";

  res.on("data", (chunk) => {
    data += chunk;
  });

  res.on("end", () => {
    console.log(`✅ 응답 상태: ${res.statusCode} ${res.statusMessage}`);
    console.log(`응답 헤더:`, {
      contentType: res.headers["content-type"],
      contentLength: res.headers["content-length"],
    });
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
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log("✨ 테스트 완료");
  });
});

req.on("error", (error) => {
  console.error(`❌ 요청 실패:`, error.message);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
});

// 타임아웃 설정 (5분)
req.setTimeout(300000, () => {
  console.error("❌ 요청 타임아웃 (5분 초과)");
  req.destroy();
});

console.log("⏳ 요청 중... (최대 5분 소요될 수 있습니다)\n");

req.write(payload);
req.end();
