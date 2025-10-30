import React, { createContext, useState, useEffect, ReactNode, useContext, useCallback } from 'react';
import type { Keymap, ControlAction, MobileUILayout } from '../types';

// UPDATED: Default keymap changed to the user-requested layout.
// Arrow keys for movement/jump, and A, S, D, W for actions.
export const DEFAULT_KEYMAP: Keymap = {
  moveLeft: 'arrowleft',
  moveRight: 'arrowright',
  jump: 'arrowup',
  attack: 'keya',
  dash: 'keyd',
  shield: 'keys',
  shuriken: 'keyw',
  pause: 'keyp',
};


export const DEFAULT_MOBILE_LAYOUT: MobileUILayout = {
  movement: { bottom: 16, left: 16 },
  actions: { bottom: 16, right: 16 },
};

const KEYMAP_STORAGE_KEY = 'crimsonShinobi_keymap_v2';
// FIX: Add storage key for mobile layout
const MOBILE_LAYOUT_STORAGE_KEY = 'crimsonShinobi_mobileLayout';

// NEW HELPER: Normalizes a keymap to all lowercase values
const normalizeMap = (map: Partial<Keymap>): Keymap => {
  // Start with the (now lowercase) default
  const newMap = { ...DEFAULT_KEYMAP, ...map }; 
  // Loop over all keys and ensure their values are lowercase
  (Object.keys(newMap) as Array<keyof Keymap>).forEach(action => {
    if (newMap[action]) {
      newMap[action] = newMap[action]!.toLowerCase();
    }
  });
  return newMap;
};

// UPDATED: formatKey now handles event.code format (e.g., 'keya' -> 'A')
export const formatKey = (key: string): string => {
  const lowerKey = key.toLowerCase();
  if (lowerKey === 'space') return 'Space';
  if (lowerKey.startsWith('key')) return lowerKey.substring(3).toUpperCase();
  if (lowerKey === 'arrowleft') return 'Left';
  if (lowerKey === 'arrowright') return 'Right';
  if (lowerKey === 'arrowup') return 'Up';
  if (lowerKey === 'arrowdown') return 'Down';
  if (lowerKey.startsWith('arrow')) return lowerKey.substring(5);
  return key.length === 1 ? key.toUpperCase() : key;
};

interface ControlsContextType {
  keymap: Keymap;
  setKeymap: (newKeymap: Keymap) => void;
  resetKeymap: () => void;
  getKeyForAction: (action: ControlAction) => string;
  pressKey: (key: string) => void;
  releaseKey: (key: string) => void;
  pressedKeys: ReadonlySet<string>;
  mobileLayout: MobileUILayout;
  // FIX: Add setMobileLayout and resetMobileLayout to the context type
  setMobileLayout: (newLayout: MobileUILayout) => void;
  resetMobileLayout: () => void;
}

export const ControlsContext = createContext<ControlsContextType>({
  keymap: DEFAULT_KEYMAP,
  setKeymap: () => {},
  resetKeymap: () => {},
  getKeyForAction: () => '',
  pressKey: () => {},
  releaseKey: () => {},
  pressedKeys: new Set(),
  mobileLayout: DEFAULT_MOBILE_LAYOUT,
  // FIX: Provide default values for the new context properties
  setMobileLayout: () => {},
  resetMobileLayout: () => {},
});

interface ControlsProviderProps {
  children: ReactNode;
}

export const ControlsProvider: React.FC<ControlsProviderProps> = ({ children }) => {
  const [keymap, _setKeymap] = useState<Keymap>(() => {
    try {
      const savedKeymap = localStorage.getItem(KEYMAP_STORAGE_KEY);
      if (savedKeymap) {
        const parsed = JSON.parse(savedKeymap);
        return normalizeMap(parsed);
      }
    } catch (e) { console.error("Failed to load keymap", e); }
    return DEFAULT_KEYMAP;
  });
  
  // FIX: Change mobileLayout to be stateful to allow customization
  const [mobileLayout, _setMobileLayout] = useState<MobileUILayout>(() => {
    try {
      const savedLayout = localStorage.getItem(MOBILE_LAYOUT_STORAGE_KEY);
      if (savedLayout) {
        return { ...DEFAULT_MOBILE_LAYOUT, ...JSON.parse(savedLayout) };
      }
    } catch (e) { console.error("Failed to load mobile layout", e); }
    return DEFAULT_MOBILE_LAYOUT;
  });

  const [pressedKeys, setPressedKeys] = useState(new Set<string>());

  const setKeymap = useCallback((newKeymap: Keymap) => {
    const normalizedMap = normalizeMap(newKeymap);
    _setKeymap(normalizedMap);
    try {
      localStorage.setItem(KEYMAP_STORAGE_KEY, JSON.stringify(normalizedMap));
    } catch (e) { console.error("Failed to save keymap", e); }
  }, []);

  const resetKeymap = useCallback(() => setKeymap(DEFAULT_KEYMAP), [setKeymap]);
  
  // FIX: Implement setMobileLayout to update state and localStorage
  const setMobileLayout = useCallback((newLayout: MobileUILayout) => {
    _setMobileLayout(newLayout);
    try {
      localStorage.setItem(MOBILE_LAYOUT_STORAGE_KEY, JSON.stringify(newLayout));
    } catch (e) { console.error("Failed to save mobile layout", e); }
  }, []);

  // FIX: Implement resetMobileLayout to restore default layout
  const resetMobileLayout = useCallback(() => setMobileLayout(DEFAULT_MOBILE_LAYOUT), [setMobileLayout]);

  const getKeyForAction = useCallback((action: ControlAction): string => {
    return formatKey(keymap[action] || '');
  }, [keymap]);

  const pressKey = useCallback((key: string) => {
    setPressedKeys(prev => {
      const lowerKey = key.toLowerCase();
      if (prev.has(lowerKey)) return prev; 
      const newKeys = new Set(prev);
      newKeys.add(lowerKey);
      return newKeys;
    });
  }, []);
  
  const releaseKey = useCallback((key: string) => {
    setPressedKeys(prev => {
      const lowerKey = key.toLowerCase();
      if (!prev.has(lowerKey)) return prev;
      const newKeys = new Set(prev);
      newKeys.delete(lowerKey);
      return newKeys;
    });
  }, []);

  // Set up keyboard event listeners
  useEffect(() => {
    // UPDATED: Using event.code for layout independence
    const handleKeyDown = (event: KeyboardEvent) => pressKey(event.code);
    const handleKeyUp = (event: KeyboardEvent) => releaseKey(event.code);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [pressKey, releaseKey]);

  const value = {
    keymap,
    setKeymap,
    resetKeymap,
    getKeyForAction,
    pressKey,
    releaseKey,
    pressedKeys,
    mobileLayout,
    // FIX: Add layout functions to the context value
    setMobileLayout,
    resetMobileLayout,
  };

  return (
    <ControlsContext.Provider value={value}>
      {children}
    </ControlsContext.Provider>
  );
};

export const useControlsContext = () => useContext(ControlsContext);