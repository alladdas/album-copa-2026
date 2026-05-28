"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Worker } from "tesseract.js";

export type WorkerStatus = "idle" | "loading" | "ready" | "error";

export interface OCRResult {
  text: string;
  confidence: number;
}

export function useTesseractWorker() {
  const [status, setStatus] = useState<WorkerStatus>("idle");
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");

    (async () => {
      try {
        const { createWorker } = await import("tesseract.js");
        // OEM 1 = LSTM_ONLY — best accuracy for printed text
        const worker = await createWorker("eng", 1, { logger: () => {} });
        if (cancelled) {
          await worker.terminate();
          return;
        }
        // Whitelist: only uppercase Latin letters, digits, and space.
        // This eliminates false positive characters and speeds up recognition.
        await worker.setParameters({
          tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZ 0123456789",
        });
        workerRef.current = worker;
        setStatus("ready");
      } catch {
        if (!cancelled) setStatus("error");
      }
    })();

    return () => {
      cancelled = true;
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, []);

  const recognize = useCallback(async (blob: Blob): Promise<OCRResult | null> => {
    if (!workerRef.current) return null;
    try {
      const { data } = await workerRef.current.recognize(blob);
      return { text: data.text, confidence: data.confidence };
    } catch {
      return null;
    }
  }, []); // stable: only touches the ref, never changes

  return { status, recognize };
}
