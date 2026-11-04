import { useEffect, useState } from "react";

/**
 * Re-render every `ms` milliseconds and return the current time. Paused while
 * `active` is false.
 */
export function useNow(ms = 1000, active = true) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(id);
  }, [ms, active]);

  return now;
}
