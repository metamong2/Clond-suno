import requests
import json
import time
import os

# 환경 변수 또는 기본값 사용
SUPABASE_URL = os.getenv(
    "SUPABASE_URL",
    "http://127.0.0.1:54321"  # 로컬 개발 환경 기본값
)
ANON_KEY = os.getenv(
    "SUPABASE_ANON_KEY",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvY2FsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA5MTYxMzYsImV4cCI6MTk2NjQ5MjEzNn0.valid-test-key"
)
FUNCTION_NAME = "generate-music"

print(f"📋 테스트 설정:")
print(f"  SUPABASE_URL: {SUPABASE_URL}")
print(f"  FUNCTION: {FUNCTION_NAME}")
print(f"  환경 변수: SUPABASE_URL, SUPABASE_ANON_KEY")

def test_generate_music(prompt):
    url = f"{SUPABASE_URL}/functions/v1/{FUNCTION_NAME}"
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {ANON_KEY}"
    }
    
    payload = {
        "prompt": prompt
    }
    
    print(f"\n🚀 요청 시작: {time.strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"프롬프트: {prompt}")
    print(f"URL: {url}")
    print(f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n")
    
    try:
        print("⏳ 요청 중...")
        response = requests.post(url, json=payload, headers=headers, timeout=300)
        
        print(f"✅ 응답 상태: {response.status_code} {response.reason}")
        print(f"응답 헤더: {dict(response.headers)}\n")
        print(f"📦 응답 데이터:")
        
        try:
            data = response.json()
            print(json.dumps(data, indent=2, ensure_ascii=False))
            
            if response.status_code == 200:
                if data.get('url'):
                    print(f"\n✅ 🎵 생성된 음악 URL: {data['url']}")
            else:
                if data.get('error'):
                    print(f"\n❌ 에러: {data['error']}")
        except json.JSONDecodeError:
            print(f"📄 응답 텍스트: {response.text}")
            
    except requests.exceptions.ConnectionError as e:
        print(f"❌ 연결 실패: {str(e)}")
        print(f"💡 확인사항:")
        print(f"   1. Supabase 로컬 서버 실행: supabase start")
        print(f"   2. URL 확인: {url}")
    except requests.exceptions.Timeout:
        print("❌ 요청 타임아웃 (5분 초과)")
    except requests.exceptions.RequestException as e:
        print(f"❌ 요청 실패: {str(e)}")
    except Exception as e:
        print(f"❌ 예상치 못한 오류: {type(e).__name__}: {str(e)}")

# 테스트 실행
if __name__ == "__main__":
    test_prompts = [
        "Create upbeat pop music with electric guitar drums and catchy melody",
    ]
    
    print("\n" + "="*60)
    print("🧪 Edge Function 테스트 시작")
    print("="*60 + "\n")
    
    for prompt in test_prompts:
        test_generate_music(prompt)
        print("\n" + "="*60 + "\n")
    
    print("✨ 테스트 완료")
    
    for prompt in test_prompts:
        test_generate_music(prompt)
        print("\n" + "="*50 + "\n")