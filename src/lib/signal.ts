import { useCallback, useEffect, useState } from "react";
import { CONFIG, SIGNAL } from "@/config";

export const SIGNAL_TASKS = [
  {
    id: "follow",
    num: "01",
    title: `Follow @${CONFIG.X_HANDLE}`,
    href: SIGNAL.FOLLOW,
  },
  {
    id: "like",
    num: "02",
    title: "Like the signal post",
    href: SIGNAL.LIKE,
  },
  {
    id: "repost",
    num: "03",
    title: "Repost the signal post",
    href: SIGNAL.REPOST,
  },
  {
    id: "comment",
    num: "04",
    title: "Comment on the signal post",
    href: SIGNAL.COMMENT,
  },
] as const;

export type SignalTaskId = (typeof SIGNAL_TASKS)[number]["id"];

const STORAGE_KEY = "ba-signal-tasks";

export function useSignalTasks() {
  const [done, setDone] = useState<Set<string>>(new Set());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const ids = JSON.parse(raw) as string[];
        if (Array.isArray(ids)) setDone(new Set(ids));
      }
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  const mark = useCallback((id: string) => {
    setDone((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const complete = ready && done.size === SIGNAL_TASKS.length;
  const remaining = Math.max(0, SIGNAL_TASKS.length - done.size);

  return { done, mark, complete, remaining, ready };
}

export type SignalState = ReturnType<typeof useSignalTasks>;
