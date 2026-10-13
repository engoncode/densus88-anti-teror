import { useEffect, useRef } from 'react';

export function useTypewriter(onText: (text: string) => void) {
  const callback = useRef(onText);
  callback.current = onText;
  const queue = useRef<string[]>([]);
  const text = useRef('');
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const complete = useRef<(() => void) | null>(null);
  const reducedMotion = useRef(false);

  const cancel = () => {
    if (timer.current !== null) clearInterval(timer.current);
    timer.current = null;
    queue.current = [];
    complete.current?.();
    complete.current = null;
  };

  useEffect(() => cancel, []);

  const start = () => {
    cancel();
    text.current = '';
    reducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    timer.current = setInterval(() => {
      if (queue.current.length) {
        // Catch up with large chunks without making long answers wait indefinitely.
        const count = reducedMotion.current ? queue.current.length : Math.max(2, Math.ceil(queue.current.length / 60));
        text.current += queue.current.splice(0, count).join('');
        callback.current(text.current);
      }
      if (!queue.current.length && complete.current) cancel();
    }, 30);
  };

  const append = (chunk: string) => {
    queue.current.push(...Array.from(chunk));
  };

  const finish = () => new Promise<void>((resolve) => {
    if (!queue.current.length || timer.current === null) {
      cancel();
      resolve();
    } else {
      complete.current = resolve;
    }
  });

  return { start, append, finish, cancel };
}
