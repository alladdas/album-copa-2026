"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { X, Check, Zap, ZapOff, Keyboard } from "lucide-react";
import { toast } from "sonner";
import { useTesseractWorker } from "./useTesseractWorker";
import { incrementOwned, recordAcquisition } from "@/lib/queries";
import type { BancaSticker } from "./BancaClient";

// ── Types ──────────────────────────────────────────────────────────────────
interface ScanHistoryEntry {
  key: string;
  number: number;
  label: string;
  teamCode: string;
  wasNew: boolean;
  count: number;
}

interface PendingMatch {
  sticker: BancaSticker;
}

export interface CameraScannerProps {
  collectionId: string;
  stickers: BancaSticker[];
  onClose: () => void;
  onSwitchToManual: () => void;
  onIncrement: (id: string) => void;
  onDecrement: (id: string) => void;
}

// ── OCR parse ─────────────────────────────────────────────────────────────
// Extracts the first valid CODE + NUMBER pair from raw OCR text.
function parseOCRText(
  text: string,
  validCodes: Set<string>,
  stickers: BancaSticker[]
): BancaSticker | null {
  // Normalise: uppercase, strip non-alphanumeric except space, collapse spaces
  const normalized = text
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Match patterns like "BRA 8", "MEX 12", "SPECIAL 03"
  const RE = /\b([A-Z]{2,8})\s+(\d{1,2})\b/g;
  let m: RegExpExecArray | null;
  while ((m = RE.exec(normalized)) !== null) {
    const code = m[1];
    const num = parseInt(m[2], 10);
    if (!validCodes.has(code)) continue;
    const sticker = stickers.find((s) => s.teamCode === code && s.number === num);
    if (sticker) return sticker;
  }
  return null;
}

// ── Constants ──────────────────────────────────────────────────────────────
const AUTO_CONFIRM_MS = 1500;
const COOLDOWN_MS = 3000;
const SCAN_INTERVAL_MS = 1000;
// Scan zone: vertical 35–65 % of screen/video, full width
const CROP_Y_START = 0.30;
const CROP_Y_END   = 0.70;

// ── Component ──────────────────────────────────────────────────────────────
export function CameraScanner({
  collectionId,
  stickers,
  onClose,
  onSwitchToManual,
  onIncrement,
  onDecrement,
}: CameraScannerProps) {
  const { status: workerStatus, recognize } = useTesseractWorker();

  // ── DOM refs ──────────────────────────────────────────────────────────
  const videoRef  = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // ── Stable mutable refs (don't drive renders) ─────────────────────────
  const isProcessingRef   = useRef(false);
  const lastMatchKeyRef   = useRef<string | null>(null);
  const cooldownMapRef    = useRef(new Map<string, number>());
  const pendingDbRef      = useRef(new Set<string>());
  const autoConfirmRef    = useRef(true);
  const pendingMatchRef   = useRef<PendingMatch | null>(null);
  // Keep latest stickers/codes accessible in the setInterval callback
  const stickersRef       = useRef(stickers);
  const validCodesRef     = useRef(new Set<string>());

  // ── Reactive state ────────────────────────────────────────────────────
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [pendingMatch, setPendingMatch] = useState<PendingMatch | null>(null);
  const [autoConfirm, setAutoConfirmState] = useState(true);
  const [history, setHistory] = useState<ScanHistoryEntry[]>([]);
  const [autoConfirmProgress, setAutoConfirmProgress] = useState(0);

  // Keep refs in sync with state/props
  useEffect(() => { autoConfirmRef.current = autoConfirm; }, [autoConfirm]);
  useEffect(() => { pendingMatchRef.current = pendingMatch; }, [pendingMatch]);
  useEffect(() => {
    stickersRef.current = stickers;
    validCodesRef.current = new Set(stickers.map((s) => s.teamCode));
  }, [stickers]);

  // Build validCodes once for stable useMemo deps elsewhere
  const validCodes = useMemo(
    () => new Set(stickers.map((s) => s.teamCode)),
    [stickers]
  );

  // ── Camera setup ──────────────────────────────────────────────────────
  useEffect(() => {
    let stream: MediaStream | null = null;

    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: "environment" },
            width:  { ideal: 1280 },
            height: { ideal: 720 },
          },
        });
        if (!videoRef.current) return;
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraReady(true);
      } catch (err) {
        const name = err instanceof Error ? err.name : "";
        if (name === "NotAllowedError" || name === "PermissionDeniedError") {
          setCameraError("Permissão de câmera negada. Verifique as configurações do navegador.");
        } else if (name === "NotFoundError") {
          setCameraError("Câmera não encontrada neste dispositivo.");
        } else {
          setCameraError("Não foi possível acessar a câmera.");
        }
      }
    })();

    return () => {
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // ── Confirm match (call DB, update optimistic state) ──────────────────
  const confirmMatch = useCallback(
    async (match: PendingMatch) => {
      const { sticker } = match;
      if (pendingDbRef.current.has(sticker.id)) return;

      const wasNew   = sticker.owned_count === 0;
      const newCount = sticker.owned_count + 1;
      const entryKey = `${sticker.id}-${Date.now()}`;

      // Clear pending UI immediately so scanning can continue
      setPendingMatch(null);
      pendingMatchRef.current = null;
      lastMatchKeyRef.current = null;
      cooldownMapRef.current.set(`${sticker.teamCode}_${sticker.number}`, Date.now());

      onIncrement(sticker.id);
      setHistory((h) =>
        [
          { key: entryKey, number: sticker.number, label: sticker.label,
            teamCode: sticker.teamCode, wasNew, count: newCount },
          ...h,
        ].slice(0, 10)
      );

      pendingDbRef.current.add(sticker.id);
      try {
        await incrementOwned(sticker.id);
        await recordAcquisition({
          collectionId,
          stickerId: sticker.id,
          wasNew,
          // No source picker in camera mode — kept simple for rapid scanning
          sourceId: undefined,
        });
      } catch {
        onDecrement(sticker.id);
        setHistory((h) => h.filter((e) => e.key !== entryKey));
        toast.error(`Erro ao salvar ${sticker.teamCode} #${sticker.number} — tente novamente`);
      } finally {
        pendingDbRef.current.delete(sticker.id);
      }
    },
    [collectionId, onIncrement, onDecrement]
  );

  // ── Skip pending match ─────────────────────────────────────────────────
  const skipMatch = useCallback(() => {
    setPendingMatch(null);
    pendingMatchRef.current = null;
    lastMatchKeyRef.current = null;
  }, []);

  // ── Auto-confirm timer ─────────────────────────────────────────────────
  useEffect(() => {
    if (!pendingMatch || !autoConfirm) {
      setAutoConfirmProgress(0);
      return;
    }

    const startedAt = Date.now();
    setAutoConfirmProgress(0);

    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startedAt;
      setAutoConfirmProgress(Math.min(100, (elapsed / AUTO_CONFIRM_MS) * 100));
    }, 40);

    const confirmTimer = setTimeout(() => {
      clearInterval(progressInterval);
      setAutoConfirmProgress(0);
      if (pendingMatchRef.current) {
        confirmMatch(pendingMatchRef.current);
      }
    }, AUTO_CONFIRM_MS);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(confirmTimer);
      setAutoConfirmProgress(0);
    };
  }, [pendingMatch, autoConfirm, confirmMatch]);

  // ── Frame processing loop ──────────────────────────────────────────────
  useEffect(() => {
    if (workerStatus !== "ready" || !cameraReady) return;

    const interval = setInterval(async () => {
      if (isProcessingRef.current) return;

      const video  = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState < 2) return;

      const vw = video.videoWidth;
      const vh = video.videoHeight;
      if (vw === 0 || vh === 0) return;

      isProcessingRef.current = true;
      try {
        // Crop the vertical center strip (handles both landscape/portrait native res)
        const sy = Math.round(vh * CROP_Y_START);
        const sh = Math.round(vh * (CROP_Y_END - CROP_Y_START));

        canvas.width  = vw;
        canvas.height = sh;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        // Boost contrast to help OCR with low-light / glossy stickers
        ctx.filter = "grayscale(1) contrast(1.8)";
        ctx.drawImage(video, 0, sy, vw, sh, 0, 0, vw, sh);

        const blob = await new Promise<Blob | null>((res) =>
          canvas.toBlob(res, "image/jpeg", 0.85)
        );
        if (!blob) return;

        const result = await recognize(blob);
        // Discard low-confidence frames (noise, blur, etc.)
        if (!result || result.confidence < 50) return;

        const matched = parseOCRText(
          result.text,
          validCodesRef.current,
          stickersRef.current
        );
        if (!matched) {
          lastMatchKeyRef.current = null;
          return;
        }

        const key = `${matched.teamCode}_${matched.number}`;

        // Skip if within cooldown window after last confirmation
        const lastConfirmed = cooldownMapRef.current.get(key);
        if (lastConfirmed && Date.now() - lastConfirmed < COOLDOWN_MS) return;

        // If a different match is already pending, don't interrupt it
        const current = pendingMatchRef.current;
        if (current) {
          const currentKey = `${current.sticker.teamCode}_${current.sticker.number}`;
          if (currentKey !== key) return;
          // Same match still visible — auto-confirm timer is already running
          return;
        }

        // New match: show confirmation overlay
        const newMatch: PendingMatch = { sticker: matched };
        setPendingMatch(newMatch);
        pendingMatchRef.current = newMatch;
        lastMatchKeyRef.current = key;
      } finally {
        isProcessingRef.current = false;
      }
    }, SCAN_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [workerStatus, cameraReady, recognize]);

  // ── Helpers ───────────────────────────────────────────────────────────
  const setAutoConfirm = (v: boolean) => {
    autoConfirmRef.current = v;
    setAutoConfirmState(v);
  };

  const workerLabel =
    workerStatus === "loading" ? "Carregando OCR…" :
    workerStatus === "error"   ? "OCR indisponível" :
    "Aponte o código para a área de leitura";

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div data-theme="dark" className="fixed inset-0 z-50 bg-black overflow-hidden">
      {/* Hidden canvas — frame capture only, never displayed */}
      <canvas ref={canvasRef} className="hidden" aria-hidden="true" />

      {/* Camera video — fills screen, maintains native ratio via object-cover */}
      <video
        ref={videoRef}
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity: cameraReady ? 1 : 0, transition: "opacity 300ms" }}
      />

      {/* ── Camera loading ──────────────────────────────────────────── */}
      {!cameraReady && !cameraError && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="font-sans text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
            Abrindo câmera…
          </p>
        </div>
      )}

      {/* ── Camera error ────────────────────────────────────────────── */}
      {cameraError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 px-8 text-center">
          <span className="text-5xl">📵</span>
          <p className="font-sans text-sm text-white leading-relaxed">{cameraError}</p>
          <button
            onClick={onSwitchToManual}
            className="rounded-full px-7 py-3 font-display font-bold text-base text-white active:scale-95 transition-transform"
            style={{ background: "var(--green)" }}
          >
            Usar teclado
          </button>
        </div>
      )}

      {/* ── Scan zone overlays (only when camera is live) ───────────── */}
      {cameraReady && (
        <>
          {/* Top dark mask */}
          <div
            className="absolute inset-x-0 top-0 pointer-events-none"
            style={{ height: "35%", background: "rgba(0,0,0,0.62)" }}
          />
          {/* Bottom dark mask */}
          <div
            className="absolute inset-x-0 pointer-events-none"
            style={{ top: "65%", bottom: 0, background: "rgba(0,0,0,0.62)" }}
          />
          {/* Left sliver */}
          <div
            className="absolute pointer-events-none"
            style={{ top: "35%", height: "30%", left: 0, width: 16, background: "rgba(0,0,0,0.62)" }}
          />
          {/* Right sliver */}
          <div
            className="absolute pointer-events-none"
            style={{ top: "35%", height: "30%", right: 0, width: 16, background: "rgba(0,0,0,0.62)" }}
          />

          {/* Scan zone border + corner accents */}
          <div
            className="absolute pointer-events-none"
            style={{
              top: "35%", height: "30%",
              left: 16, right: 16,
              border: "1px solid rgba(255,255,255,0.35)",
              borderRadius: 14,
            }}
          >
            {/* Green corner marks */}
            {(["tl","tr","bl","br"] as const).map((c) => (
              <span
                key={c}
                className="absolute"
                style={{
                  width: 22, height: 22,
                  top:    c.startsWith("t") ? -1 : undefined,
                  bottom: c.startsWith("b") ? -1 : undefined,
                  left:   c.endsWith("l")   ? -1 : undefined,
                  right:  c.endsWith("r")   ? -1 : undefined,
                  borderTop:    c.startsWith("t") ? "3px solid var(--green)" : undefined,
                  borderBottom: c.startsWith("b") ? "3px solid var(--green)" : undefined,
                  borderLeft:   c.endsWith("l")   ? "3px solid var(--green)" : undefined,
                  borderRight:  c.endsWith("r")   ? "3px solid var(--green)" : undefined,
                  borderRadius: c === "tl" ? "12px 0 0 0" : c === "tr" ? "0 12px 0 0" : c === "bl" ? "0 0 0 12px" : "0 0 12px 0",
                }}
              />
            ))}

            {/* Guide label inside zone */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span
                className="font-sans text-xs font-semibold rounded-full px-3 py-1.5"
                style={{
                  color: "rgba(255,255,255,0.85)",
                  background: "rgba(0,0,0,0.45)",
                  letterSpacing: "0.04em",
                }}
              >
                {workerLabel}
              </span>
            </div>
          </div>
        </>
      )}

      {/* ── Header bar ──────────────────────────────────────────────── */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-14 pb-2 z-20">
        {/* Close */}
        <button
          onClick={onClose}
          className="w-11 h-11 flex items-center justify-center rounded-full active:scale-95 transition-transform"
          style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)" }}
          aria-label="Fechar scanner"
        >
          <X size={20} strokeWidth={2} color="white" />
        </button>

        <div className="flex items-center gap-2">
          {/* Switch to keyboard */}
          <button
            onClick={onSwitchToManual}
            className="h-9 px-3 flex items-center gap-1.5 rounded-full font-sans text-xs font-semibold active:scale-95 transition-transform"
            style={{
              background: "rgba(0,0,0,0.5)",
              backdropFilter: "blur(6px)",
              color: "rgba(255,255,255,0.8)",
            }}
            aria-label="Usar teclado"
          >
            <Keyboard size={13} strokeWidth={2} />
            Teclado
          </button>

          {/* Auto-confirm toggle */}
          <button
            onClick={() => setAutoConfirm(!autoConfirm)}
            className="h-9 px-3 flex items-center gap-1.5 rounded-full font-sans text-xs font-semibold active:scale-95 transition-transform"
            style={{
              background: autoConfirm ? "var(--green)" : "rgba(0,0,0,0.5)",
              backdropFilter: "blur(6px)",
              color: "white",
            }}
            aria-label={autoConfirm ? "Auto-confirmar ligado" : "Auto-confirmar desligado"}
          >
            {autoConfirm
              ? <Zap size={13} strokeWidth={2.5} />
              : <ZapOff size={13} strokeWidth={2} />}
            Auto
          </button>
        </div>
      </div>

      {/* ── Pending match confirmation panel ────────────────────────── */}
      {pendingMatch && (
        <div
          className="absolute left-0 right-0 z-20 px-4"
          style={{ top: "67%" }}
        >
          {/* Auto-confirm progress bar */}
          {autoConfirm && (
            <div
              className="h-0.5 mb-3 rounded-full overflow-hidden"
              style={{ background: "rgba(255,255,255,0.15)" }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: `${autoConfirmProgress}%`,
                  background: "var(--green)",
                  transition: "width 40ms linear",
                }}
              />
            </div>
          )}

          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: "var(--bg)", border: "1px solid var(--line)" }}
          >
            <div className="px-4 py-3">
              {/* Sticker info row */}
              <div className="flex items-center gap-3 mb-3">
                <span
                  className="font-mono font-extrabold text-xs rounded-md px-2 py-1 flex-shrink-0"
                  style={{ background: "var(--elev)", color: "var(--ink-mute)" }}
                >
                  {pendingMatch.sticker.teamCode} #{pendingMatch.sticker.number}
                </span>
                <span className="font-sans font-semibold text-sm text-ink truncate flex-1 min-w-0">
                  {pendingMatch.sticker.label}
                </span>
                {pendingMatch.sticker.owned_count === 0 ? (
                  <span
                    className="font-display font-extrabold text-xs rounded-full px-3 py-1 flex-shrink-0"
                    style={{ background: "var(--green)", color: "white" }}
                  >
                    FALTAVA!
                  </span>
                ) : (
                  <span
                    className="font-display font-extrabold text-xs rounded-full px-3 py-1 flex-shrink-0"
                    style={{ background: "var(--magenta)", color: "white" }}
                  >
                    JÁ TENHO ×{pendingMatch.sticker.owned_count}
                  </span>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => confirmMatch(pendingMatch)}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl min-h-[52px] font-display font-bold text-base text-white active:scale-[.97] transition-transform"
                  style={{ background: "var(--green)" }}
                >
                  <Check size={20} strokeWidth={2.5} />
                  Confirmar
                </button>
                <button
                  onClick={skipMatch}
                  className="w-14 flex items-center justify-center rounded-xl min-h-[52px] active:scale-[.97] transition-transform"
                  style={{ background: "var(--elev)", border: "1px solid var(--line)" }}
                  aria-label="Pular"
                >
                  <X size={20} strokeWidth={2} color="var(--ink-soft)" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── OCR unavailable fallback ─────────────────────────────────── */}
      {workerStatus === "error" && cameraReady && !cameraError && (
        <div
          className="absolute left-4 right-4 z-20 rounded-2xl px-4 py-3 text-center"
          style={{ bottom: "10%", background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
        >
          <p className="font-sans text-sm mb-2" style={{ color: "rgba(255,255,255,0.7)" }}>
            Falha ao carregar OCR
          </p>
          <button
            onClick={onSwitchToManual}
            className="font-sans text-sm font-semibold"
            style={{ color: "var(--green)" }}
          >
            Voltar ao teclado →
          </button>
        </div>
      )}

      {/* ── Session history ──────────────────────────────────────────── */}
      {history.length > 0 && !pendingMatch && (
        <div
          className="absolute bottom-0 left-0 right-0 z-10 pb-10"
          style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(8px)" }}
        >
          <p
            className="font-sans text-[10px] font-semibold uppercase tracking-widest px-4 pt-3 mb-1.5"
            style={{ color: "rgba(255,255,255,0.45)" }}
          >
            Acabei de marcar
          </p>
          <div className="flex gap-2 overflow-x-auto px-4 pb-2 scrollbar-none">
            {history.map((e) => (
              <div
                key={e.key}
                className="flex-shrink-0 flex items-center gap-1.5 rounded-xl px-3 py-2"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <span
                  className="font-mono text-[11px] flex-shrink-0"
                  style={{ color: "rgba(255,255,255,0.45)" }}
                >
                  {e.teamCode}·{e.number}
                </span>
                <span
                  className="font-sans text-xs truncate max-w-[80px]"
                  style={{ color: "rgba(255,255,255,0.85)" }}
                >
                  {e.label}
                </span>
                {e.wasNew ? (
                  <span
                    className="font-display font-extrabold text-[10px] rounded-full px-2 py-0.5 flex-shrink-0"
                    style={{ background: "var(--green)", color: "white" }}
                  >
                    NOVA
                  </span>
                ) : (
                  <span
                    className="font-mono font-extrabold text-[10px] rounded-full px-2 py-0.5 flex-shrink-0"
                    style={{ background: "var(--magenta)", color: "white" }}
                  >
                    ×{e.count}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
