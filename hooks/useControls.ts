import { useMemo, useRef, useEffect } from 'react';
import { useControlsContext } from '../contexts/ControlsContext';
import type { ControlAction } from '../types';

export const useControls = () => {
  const { keymap, pressedKeys } = useControlsContext();
  // FIX: Changed useRef type from `Set<string>` to `ReadonlySet<string>` to match the `pressedKeys` type from the context, resolving the assignment error on line 12.
  const prevPressedKeys = useRef<ReadonlySet<string>>(new Set());

  // This effect runs AFTER the render, so when the next render's useMemo runs,
  // prevPressedKeys will hold the value from the render that just finished.
  useEffect(() => {
    prevPressedKeys.current = pressedKeys;
  });

  const controls = useMemo(() => {
    const isActionPressed = (action: ControlAction): boolean => {
      const key = keymap[action];
      return pressedKeys.has(key);
    };

    const isActionJustPressed = (action: ControlAction): boolean => {
      const key = keymap[action];
      return pressedKeys.has(key) && !prevPressedKeys.current.has(key);
    };

    return { isActionPressed, isActionJustPressed };
  }, [keymap, pressedKeys]);

  return controls;
};
