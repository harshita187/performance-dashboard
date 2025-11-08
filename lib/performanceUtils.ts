export interface FPSMonitor {
  start: () => void;
  stop: () => void;
  getFPS: () => number;
  reset: () => void;
}

export function createFPSMonitor(): FPSMonitor {
  let frameCount = 0;
  let lastTime = performance.now();
  let fps = 60;
  let animationId: number | null = null;

  const measure = () => {
    frameCount++;
    const currentTime = performance.now();
    const elapsed = currentTime - lastTime;

    if (elapsed >= 1000) {
      fps = Math.round((frameCount * 1000) / elapsed);
      frameCount = 0;
      lastTime = currentTime;
    }

    if (animationId !== null) {
      animationId = requestAnimationFrame(measure);
    }
  };

  return {
    start: () => {
      if (animationId === null) {
        lastTime = performance.now();
        frameCount = 0;
        animationId = requestAnimationFrame(measure);
      }
    },
    stop: () => {
      if (animationId !== null) {
        cancelAnimationFrame(animationId);
        animationId = null;
      }
    },
    getFPS: () => fps,
    reset: () => {
      frameCount = 0;
      lastTime = performance.now();
      fps = 60;
    },
  };
}

export function getMemoryUsage(): number | null {
  if ("memory" in performance) {
    const memory = (performance as any).memory;
    return memory.usedJSHeapSize / 1048576;
  }
  return null;
}

export function measureExecutionTime<T>(
  fn: () => T,
  label?: string
): { result: T; time: number } {
  const start = performance.now();
  const result = fn();
  const time = performance.now() - start;

  if (label) {
    console.log(`${label}: ${time.toFixed(2)}ms`);
  }

  return { result, time };
}

export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  interval: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  let timeoutId: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    const now = Date.now();
    const timeSinceLastCall = now - lastCall;

    if (timeSinceLastCall >= interval) {
      lastCall = now;
      fn(...args);
    } else {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        lastCall = Date.now();
        fn(...args);
      }, interval - timeSinceLastCall);
    }
  };
}

export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      fn(...args);
    }, delay);
  };
}
