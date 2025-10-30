import { useMemo, useRef, useEffect } from 'react';
import { useControlsContext } from '../contexts/ControlsContext';
import type { ControlAction } from '../types';

export const useControls = () => {
  const { keymap, pressedKeys } = useControlsContext();
  const prevPressedKeys = useRef<ReadonlySet<string>>(new Set());

  // This effect runs AFTER the render, so when the next render's useMemo runs,
  // prevPressedKeys will hold the value from the render that just finished.
  useEffect(() => {
    prevPressedKeys.current = pressedKeys;
  });

  const controls = useMemo(() => {
    const isActionPressed = (action: ControlAction): boolean => {
      const key = keymap[action];
      if (!key) return false; // Guard against missing keymap
      return pressedKeys.has(key.toLowerCase());
    };

    const isActionJustPressed = (action: ControlAction): boolean => {
      const key = keymap[action];
      if (!key) return false; // Guard against missing keymap
      return pressedKeys.has(key.toLowerCase()) && !prevPressedKeys.current.has(key.toLowerCase());
    };

    return { isActionPressed, isActionJustPressed };
  }, [keymap, pressedKeys]);

  return controls;
};
