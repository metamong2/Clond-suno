import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Logging utility for platform monitoring
const log = (level: string, message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message,
    ...(data && { data }),
  };
  console.log(JSON.stringify(logEntry));
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const requestId = crypto.randomUUID();
  log("INFO", "FUNCTION_STARTED", { requestId, method: req.method });

  try {
    const body = await req.json();
    const prompt = body.prompt;

    log("INFO", "REQUEST_RECEIVED", {
      requestId,
      promptLength: prompt?.length,
    });

    if (!prompt) {
      log("WARN", "VALIDATION_FAILED", {
        requestId,
        reason: "Prompt is required",
      });
      return new Response(JSON.stringify({ error: "Prompt required" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    const supabase = createClient(
      Deno.env.get("PROJECT_URL")!,
      Deno.env.get("SERVICE_ROLE_KEY")!,
    );

    log("INFO", "SUPABASE_CLIENT_INITIALIZED", { requestId });

    const { data: generation, error: insertError } = await supabase
      .from("generations")
      .insert({
        prompt,
        status: "pending",
      })
      .select()
      .single();

    if (insertError) {
      log("ERROR", "DATABASE_INSERT_FAILED", {
        requestId,
        error: insertError.message,
      });
      throw insertError;
    }

    log("INFO", "DATABASE_RECORD_CREATED", {
      requestId,
      generationId: generation.id,
    });

    // 2️⃣ HuggingFace job 시작
    log("INFO", "HUGGINGFACE_REQUEST_STARTED", { requestId });
    const hfResponse = await fetch(
      "https://metamong06-suno-clone.hf.space/gradio_api/call/generate",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: [prompt],
        }),
      },
    );

    if (!hfResponse.ok) {
      log("ERROR", "HUGGINGFACE_REQUEST_FAILED", {
        requestId,
        status: hfResponse.status,
        statusText: hfResponse.statusText,
      });
      throw new Error(
        `HuggingFace API failed: ${hfResponse.status} ${hfResponse.statusText}`,
      );
    }

    const { event_id } = await hfResponse.json();

    if (!event_id) {
      log("ERROR", "HUGGINGFACE_EVENT_ID_MISSING", { requestId });
      throw new Error("HF event_id missing");
    }

    log("INFO", "HUGGINGFACE_EVENT_CREATED", { requestId, event_id });

    // 3️⃣ Polling loop
    let audioBase64: string | null = null;
    let pollAttempts = 0;

    for (let i = 0; i < 30; i++) {
      pollAttempts++;
      log("DEBUG", "POLLING_ATTEMPT_START", {
        requestId,
        attempt: i + 1,
        maxAttempts: 30,
      });
      await sleep(2000);

      const poll = await fetch(
        `https://metamong06-suno-clone.hf.space/gradio_api/call/generate/${event_id}`,
      );

      if (!poll.ok) {
        log("WARN", "POLLING_REQUEST_FAILED", {
          requestId,
          attempt: i + 1,
          status: poll.status,
        });
        continue;
      }

      const text = await poll.text();
      const line = text.split("\n").find((l) => l.startsWith("data:"));

      if (!line) {
        log("DEBUG", "POLLING_NO_DATA_LINE", { requestId, attempt: i + 1 });
        continue;
      }

      const data = line.replace("data:", "").trim();

      if (data === "null") {
        log("DEBUG", "POLLING_DATA_NULL", { requestId, attempt: i + 1 });
        continue;
      }

      const json = JSON.parse(data);

      // 전체 응답 배열 로깅 - 모든 요소 상세 정보
      log("DEBUG", "GRADIO_RESPONSE_ARRAY_DETAILED", {
        requestId,
        attempt: i + 1,
        arrayLength: Array.isArray(json) ? json.length : "not_array",
        rawJson: JSON.stringify(json).substring(0, 300),
        elements: Array.isArray(json)
          ? json.map((el, idx) => ({
              index: idx,
              type: typeof el,
              isNull: el === null,
              isUndefined: el === undefined,
              isString: typeof el === "string",
              isNumber: typeof el === "number",
              isObject: typeof el === "object" && el !== null,
              length: typeof el === "string" ? el.length : undefined,
              startsWithHttp: typeof el === "string" && el.startsWith("http"),
              startsWithSlash: typeof el === "string" && el.startsWith("/"),
              endsWithWav: typeof el === "string" && el.endsWith(".wav"),
              endsWithMp3: typeof el === "string" && el.endsWith(".mp3"),
              isBase64Like:
                typeof el === "string" &&
                /^[A-Za-z0-9+/=]*$/.test(el) &&
                el.length > 100,
              isObject:
                typeof el === "object" && el !== null && !Array.isArray(el),
              objectKeys:
                typeof el === "object" && el !== null && !Array.isArray(el)
                  ? Object.keys(el)
                  : undefined,
              preview:
                typeof el === "string"
                  ? el.substring(0, 100)
                  : el === null
                    ? "null"
                    : el === undefined
                      ? "undefined"
                      : JSON.stringify(el).substring(0, 100),
            }))
          : "not_array",
      });

      // 음악 파일 찾기: URL이나 파일 경로나 base64 문자열
      let audioData: string | null = null;

      if (Array.isArray(json) && json.length > 0) {
        // 전략 1: 마지막 요소 확인 (보통 결과가 마지막)
        for (let idx = json.length - 1; idx >= 0; idx--) {
          const element = json[idx];

          if (typeof element === "string" && element.length > 10) {
            // 파일 경로 패턴 (file:///, /, 또는 file명.wav, .mp3)
            if (
              element.startsWith("file:///") ||
              element.startsWith("file://") ||
              (element.startsWith("/") &&
                (element.includes(".wav") ||
                  element.includes(".mp3") ||
                  element.includes(".")))
            ) {
              log("INFO", "FOUND_AUDIO_FILE_PATH", {
                requestId,
                index: idx,
                path: element,
              });
              audioData = element;
              break;
            }

            // URL 패턴
            if (
              element.startsWith("http://") ||
              element.startsWith("https://")
            ) {
              log("INFO", "FOUND_AUDIO_URL", {
                requestId,
                index: idx,
                url: element,
              });
              audioData = element;
              break;
            }

            // Base64 패턴 (wav 파일 시그니처 또는 긴 base64)
            if (
              element.startsWith("UklGRi") ||
              (element.length > 1000 && /^[A-Za-z0-9+/=]*$/.test(element))
            ) {
              log("INFO", "FOUND_BASE64_AUDIO", {
                requestId,
                index: idx,
                length: element.length,
                isWavSignature: element.startsWith("UklGRi"),
                preview: element.substring(0, 50),
              });
              audioData = element;
              break;
            }
          }

          // 객체인 경우 url, file, audio, path 필드 확인
          if (
            typeof element === "object" &&
            element !== null &&
            !Array.isArray(element)
          ) {
            const audioUrl =
              element.url ||
              element.file ||
              element.audio ||
              element.path ||
              element.output;
            if (typeof audioUrl === "string" && audioUrl.length > 10) {
              log("INFO", "FOUND_AUDIO_IN_OBJECT", {
                requestId,
                index: idx,
                fields: Object.keys(element),
                value: audioUrl.substring(0, 100),
              });
              audioData = audioUrl;
              break;
            }
          }
        }

        // 전략 2: 첫 번째 요소도 확인 (못 찾았을 경우)
        if (!audioData) {
          for (let idx = 0; idx < json.length; idx++) {
            const element = json[idx];

            if (
              typeof element === "string" &&
              element.length > 100 &&
              /^[A-Za-z0-9+/=]*$/.test(element)
            ) {
              log("INFO", "FOUND_POTENTIAL_BASE64", {
                requestId,
                index: idx,
                length: element.length,
                preview: element.substring(0, 50),
              });
              audioData = element;
              break;
            }
          }
        }
      }

      if (audioData) {
        audioBase64 = audioData;
        log("INFO", "POLLING_COMPLETED", {
          requestId,
          audioDataType: typeof audioData,
          audioDataLength: audioData.length,
          isUrl: audioData.startsWith("http"),
          isFilePath:
            audioData.startsWith("/") || audioData.startsWith("file://"),
          isBase64: /^[A-Za-z0-9+/=]*$/.test(audioData),
          preview: audioData.substring(0, 100),
        });
        break;
      } else {
        log("DEBUG", "NO_AUDIO_DATA_FOUND", {
          requestId,
          attempt: i + 1,
          arrayLength: Array.isArray(json) ? json.length : "not_array",
        });
      }
    }

    if (!audioBase64) {
      log("ERROR", "AI_GENERATION_TIMEOUT", {
        requestId,
        totalAttempts: pollAttempts,
      });
      throw new Error("AI generation timeout");
    }

    // 4️⃣ base64 → audio buffer (또는 다른 형식 처리)
    log("INFO", "AUDIO_PROCESSING_STARTED", {
      requestId,
      audioBase64Type: typeof audioBase64,
      audioBase64IsString: typeof audioBase64 === "string",
    });

    // 다양한 형식 처리
    let audioBuffer: Uint8Array;

    // 형식 1: base64 문자열
    if (typeof audioBase64 === "string" && audioBase64.length > 0) {
      // 먼저 URL 형식인지 확인
      if (
        audioBase64.startsWith("http://") ||
        audioBase64.startsWith("https://")
      ) {
        log("INFO", "AUDIO_IS_URL", {
          requestId,
          url: audioBase64,
        });
        // URL에서 audio 다운로드
        const audioResponse = await fetch(audioBase64);
        if (!audioResponse.ok) {
          log("ERROR", "AUDIO_URL_FETCH_FAILED", {
            requestId,
            status: audioResponse.status,
            url: audioBase64,
          });
          throw new Error(
            `Failed to fetch audio from URL: ${audioResponse.status}`,
          );
        }
        const arrayBuffer = await audioResponse.arrayBuffer();
        audioBuffer = new Uint8Array(arrayBuffer);
        log("INFO", "AUDIO_DOWNLOADED_FROM_URL", {
          requestId,
          bufferSize: audioBuffer.byteLength,
        });
      } else if (
        audioBase64.startsWith("/") ||
        audioBase64.startsWith("file://")
      ) {
        // 파일 경로 형식
        log("INFO", "AUDIO_IS_FILE_PATH", {
          requestId,
          path: audioBase64,
        });
        // Gradio temporary 파일 경로라고 가정하고 HuggingFace 공간에서 다운로드 시도
        let fileFetchUrl: string;
        if (audioBase64.startsWith("file://")) {
          fileFetchUrl = audioBase64.replace("file://", "");
        } else {
          // 상대 경로를 HuggingFace space 기반으로 변환
          fileFetchUrl = `https://metamong06-suno-clone.hf.space${audioBase64}`;
        }

        log("INFO", "FETCHING_FILE", {
          requestId,
          fetchUrl: fileFetchUrl,
        });
        const fileResponse = await fetch(fileFetchUrl);
        if (!fileResponse.ok) {
          log("ERROR", "FILE_FETCH_FAILED", {
            requestId,
            status: fileResponse.status,
            url: fileFetchUrl,
          });
          throw new Error(`Failed to fetch audio file: ${fileResponse.status}`);
        }
        const arrayBuffer = await fileResponse.arrayBuffer();
        audioBuffer = new Uint8Array(arrayBuffer);
        log("INFO", "AUDIO_DOWNLOADED_FROM_FILE", {
          requestId,
          bufferSize: audioBuffer.byteLength,
        });
      } else if (audioBase64.startsWith("{") || audioBase64.startsWith("[")) {
        // JSON 형식이면 파싱
        log("INFO", "AUDIO_IS_JSON", {
          requestId,
          dataPreview: audioBase64.substring(0, 200),
        });
        try {
          const jsonData = JSON.parse(audioBase64);
          if (jsonData.url) {
            log("INFO", "AUDIO_JSON_HAS_URL", {
              requestId,
              url: jsonData.url,
            });
            const audioResponse = await fetch(jsonData.url);
            if (!audioResponse.ok) {
              throw new Error(
                `Failed to fetch audio from URL in JSON: ${audioResponse.status}`,
              );
            }
            const arrayBuffer = await audioResponse.arrayBuffer();
            audioBuffer = new Uint8Array(arrayBuffer);
          } else if (jsonData.data) {
            // 데이터가 base64일 수 있음
            audioBase64 = jsonData.data;
            log("INFO", "AUDIO_EXTRACTED_FROM_JSON", {
              requestId,
              newDataLength: audioBase64.length,
            });
            // base64 처리로 떨어짐 (아래 코드)
            throw new Error("RETRY_BASE64_FROM_JSON");
          } else {
            log("ERROR", "AUDIO_JSON_NO_URL_OR_DATA", {
              requestId,
              jsonData,
            });
            throw new Error("JSON data does not contain url or data field");
          }
        } catch (jsonError) {
          if (jsonError.message === "RETRY_BASE64_FROM_JSON") {
            throw jsonError; // 다시 base64 처리
          }
          log("ERROR", "AUDIO_JSON_PARSE_FAILED", {
            requestId,
            error: jsonError.message,
          });
          throw jsonError;
        }
      } else {
        // Base64 형식으로 처리
        log("INFO", "AUDIO_TREATING_AS_BASE64", {
          requestId,
          length: audioBase64.length,
        });

        // Validate base64 format
        const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
        if (!base64Regex.test(audioBase64)) {
          const invalidChars = audioBase64.match(/[^A-Za-z0-9+/=]/g);
          log("WARN", "INVALID_BASE64_FORMAT_DETECTED", {
            requestId,
            length: audioBase64.length,
            preview: audioBase64.substring(0, 100),
            invalidChars: invalidChars,
            invalidCharsCount: invalidChars?.length || 0,
          });

          // 공백 제거 시도
          const trimmedBase64 = audioBase64.replace(/\s/g, "");
          if (base64Regex.test(trimmedBase64)) {
            log("INFO", "BASE64_FIXED_BY_TRIMMING", {
              requestId,
              originalLength: audioBase64.length,
              trimmedLength: trimmedBase64.length,
            });
            audioBase64 = trimmedBase64;
          } else {
            log("ERROR", "INVALID_BASE64_FORMAT_AFTER_TRIM", {
              requestId,
              length: trimmedBase64.length,
              preview: trimmedBase64.substring(0, 100),
            });
            throw new Error(
              `Invalid base64 format: contains invalid characters`,
            );
          }
        }

        try {
          audioBuffer = Uint8Array.from(atob(audioBase64), (c) =>
            c.charCodeAt(0),
          );
          log("INFO", "AUDIO_BUFFER_CREATED_FROM_BASE64", {
            requestId,
            bufferSize: audioBuffer.byteLength,
          });
        } catch (decodeError) {
          log("ERROR", "BASE64_DECODE_FAILED", {
            requestId,
            error: decodeError.message,
            audioBase64Length: audioBase64.length,
            audioBase64Preview: audioBase64.substring(0, 100),
          });
          throw new Error(`Failed to decode base64: ${decodeError.message}`);
        }
      }
    } else {
      log("ERROR", "INVALID_AUDIO_DATA_FORMAT", {
        requestId,
        type: typeof audioBase64,
        value: audioBase64,
      });
      throw new Error(
        `Invalid audio data format: expected string, got ${typeof audioBase64}`,
      );
    }

    log("INFO", "AUDIO_BUFFER_READY", {
      requestId,
      bufferSize: audioBuffer.byteLength,
    });

    const filePath = `${generation.id}.wav`;

    // 5️⃣ Storage 업로드
    log("INFO", "STORAGE_UPLOAD_STARTED", { requestId, filePath });
    const { error: uploadError } = await supabase.storage
      .from("music")
      .upload(filePath, audioBuffer, {
        contentType: "audio/wav",
      });

    if (uploadError) {
      log("ERROR", "STORAGE_UPLOAD_FAILED", {
        requestId,
        error: uploadError.message,
        filePath,
      });
      throw uploadError;
    }

    log("INFO", "STORAGE_UPLOAD_COMPLETED", { requestId, filePath });

    const { data: publicUrl } = supabase.storage
      .from("music")
      .getPublicUrl(filePath);

    log("INFO", "PUBLIC_URL_GENERATED", {
      requestId,
      url: publicUrl.publicUrl,
    });

    // 6️⃣ DB 업데이트
    log("INFO", "DATABASE_UPDATE_STARTED", {
      requestId,
      generationId: generation.id,
    });
    await supabase
      .from("generations")
      .update({
        status: "done",
        file_url: publicUrl.publicUrl,
      })
      .eq("id", generation.id);

    log("INFO", "DATABASE_UPDATE_COMPLETED", {
      requestId,
      generationId: generation.id,
    });

    // 7️⃣ Response
    log("INFO", "REQUEST_SUCCESS", {
      requestId,
      generationId: generation.id,
    });
    return new Response(
      JSON.stringify({
        url: publicUrl.publicUrl,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    const errorStack = err instanceof Error ? err.stack : "";

    log("ERROR", "REQUEST_FAILED", {
      error: errorMessage,
      stack: errorStack,
      type: err?.constructor?.name,
    });

    return new Response(
      JSON.stringify({
        error: errorMessage,
      }),
      {
        status: 500,
        headers: corsHeaders,
      },
    );
  }
});
