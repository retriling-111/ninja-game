import { useRef, useEffect } from 'react';

export const useGameLoop = (callback: (deltaTime: number) => void) => {
  // FIX: Explicitly initialize useRef with null. This provides the required argument and is a common pattern for refs that will hold an ID.
  const requestRef = useRef<number | null>(null);
  // FIX: Explicitly initialize useRef with undefined. This provides the required argument.
  const previousTimeRef = useRef<number | undefined>(undefined);
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    const animate = (time: number) => {
      if (previousTimeRef.current !== undefined) {
        const deltaTime = time - previousTimeRef.current;
        savedCallback.current(deltaTime);
      }
      previousTimeRef.current = time;
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);
};
