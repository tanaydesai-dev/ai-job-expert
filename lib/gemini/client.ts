import { GoogleGenAI } from "@google/genai";

// Server-side only. Never import this file from a Client Component.
// Reads GEMINI_API_KEY (or GOOGLE_API_KEY) from the environment automatically.
//
// The SDK's default retry policy (5 attempts, exponential backoff) can push
// worst-case latency into minutes on the free tier, which is unusable behind
// an HTTP route. Bound it: a couple of retries with a per-attempt timeout.
export const gemini = new GoogleGenAI({
  httpOptions: {
    timeout: 20000,
    retryOptions: { attempts: 2 },
  },
});

/**
 * Races a Gemini call against a hard deadline. The SDK's own `timeout` option
 * did not reliably bound a hung request in testing, so this guarantees the
 * caller (an HTTP route) always resolves within `ms` regardless of what the
 * underlying request is doing.
 */
export function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`Gemini request timed out after ${ms}ms`)),
      ms,
    );
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}
