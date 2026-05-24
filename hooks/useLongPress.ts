"use client";

import { useCallback, useRef } from "react";

interface Options {
  onLongPress: () => void;
  onTap?: () => void;
  delay?: number;
}

export function useLongPress({ onLongPress, onTap, delay = 500 }: Options) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fired = useRef(false);

  const start = useCallback(() => {
    fired.current = false;
    timer.current = setTimeout(() => {
      fired.current = true;
      onLongPress();
    }, delay);
  }, [onLongPress, delay]);

  const clear = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const end = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      clear();
      if (!fired.current) {
        // Previne o ghost click em touchscreens
        e.preventDefault();
        onTap?.();
      }
    },
    [clear, onTap]
  );

  const move = useCallback(() => {
    clear();
    fired.current = true; // cancela o tap se o dedo moveu
  }, [clear]);

  return {
    onMouseDown: start,
    onMouseUp: end as (e: React.MouseEvent) => void,
    onMouseLeave: clear,
    onTouchStart: (e: React.TouchEvent) => { e.stopPropagation(); start(); },
    onTouchEnd: end as (e: React.TouchEvent) => void,
    onTouchMove: move,
  };
}
