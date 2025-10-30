import React, { createContext, useState, useEffect, ReactNode, useContext, useCallback } from 'react';
import type { Keymap, ControlAction, MobileUILayout } from '../types';

export const DEFAULT_KEYMAP: Keymap = {
  moveLeft: 'ArrowLeft',
  moveRight: 'ArrowRight',
  jump: 'ArrowUp',
  attack: 'a',
  dash: 'd',
  shield: 's',
  shuriken: 'w',
  pause: 'p',
};

export const DEFAULT_MOBILE_LAYOUT: MobileUILayout = {
  movement: { bottom: 16, left: 16 }, // Corresponds to bottom-4, left-4 (1rem=16px)
  actions: { bottom: 16, right: 16 }, // Corresponds to bottom-4, right-4
};

// Helper to display key names nicely
export const formatKey = (key: string): string => {
  if (key === ' ') return 'Space';
  if (key.startsWith('Arrow')) return key.substring(5);
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
  setMobileLayout: () => {},
  resetMobileLayout: () => {},
});

const KeyboardListener: React.FC = () => {
    const { pressKey, releaseKey } = useContext(ControlsContext);
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => pressKey(event.key);
        const handleKeyUp = (event: KeyboardEvent) => releaseKey(event.key);
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
          window.removeEventListener('keydown', handleKeyDown);
          window.removeEventListener('keyup', handleKeyUp);
        };
    }, [pressKey, releaseKey]);
    return null;
};

interface ControlsProviderProps {
  children: ReactNode;
}

export const ControlsProvider: React.FC<ControlsProviderProps> = ({ children }) => {
  const [keymap, _setKeymap] = useState<Keymap>(() => {
    try {
      const savedKeymap = localStorage.getItem('crimsonShinobi_keymap');
      if (savedKeymap) {
        const parsed = JSON.parse(savedKeymap);
        return { ...DEFAULT_KEYMAP, ...parsed };
      }
    } catch (e) { console.error("Failed to load keymap", e); }
    return DEFAULT_KEYMAP;
  });
  
  const [mobileLayout, _setMobileLayout] = useState<MobileUILayout>(() => {
    try {
      const savedLayout = localStorage.getItem('crimsonShinobi_mobileLayout');
      if (savedLayout) {
        const parsed = JSON.parse(savedLayout);
        return { ...DEFAULT_MOBILE_LAYOUT, ...parsed };
      }
    } catch (e) { console.error("Failed to load mobile layout", e); }
    return DEFAULT_MOBILE_LAYOUT;
  });

  const [pressedKeys, setPressedKeys] = useState(new Set<string>());

  const setKeymap = useCallback((newKeymap: Keymap) => {
    _setKeymap(newKeymap);
    try {
      localStorage.setItem('crimsonShinobi_keymap', JSON.stringify(newKeymap));
    } catch (e) { console.error("Failed to save keymap", e); }
  }, []);

  const resetKeymap = useCallback(() => setKeymap(DEFAULT_KEYMAP), [setKeymap]);
  
  const setMobileLayout = useCallback((newLayout: MobileUILayout) => {
    _setMobileLayout(newLayout);
    try {
      localStorage.setItem('crimsonShinobi_mobileLayout', JSON.stringify(newLayout));
    } catch (e) { console.error("Failed to save mobile layout", e); }
  }, []);

  const resetMobileLayout = useCallback(() => setMobileLayout(DEFAULT_MOBILE_LAYOUT), [setMobileLayout]);

  const getKeyForAction = useCallback((action: ControlAction): string => {
    return formatKey(keymap[action] || '');
  }, [keymap]);

  const pressKey = useCallback((key: string) => setPressedKeys(prev => new Set(prev).add(key.toLowerCase())), []);
  const releaseKey = useCallback((key: string) => {
    setPressedKeys(prev => {
      const newKeys = new Set(prev);
      newKeys.delete(key.toLowerCase());
      return newKeys;
    });
  }, []);

  const value = {
    keymap,
    setKeymap,
    resetKeymap,
    getKeyForAction,
    pressKey,
    releaseKey,
    pressedKeys,
    mobileLayout,
    setMobileLayout,
    resetMobileLayout,
  };

  return (
    <ControlsContext.Provider value={value}>
      <KeyboardListener />
      {children}
    </ControlsContext.Provider>
  );
};

export const useControlsContext = () => useContext(ControlsContext);