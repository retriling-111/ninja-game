import React, { createContext, useState, useEffect, ReactNode } from 'react';

interface AppContextType {
  volume: number;
  setVolume: (volume: number) => void;
}

export const AppContext = createContext<AppContextType>({
  volume: 1,
  setVolume: () => {},
});

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [volume, setVolume] = useState<number>(() => {
    const savedVolume = localStorage.getItem('crimsonShinobi_volume');
    return savedVolume !== null ? parseFloat(savedVolume) : 1;
  });

  useEffect(() => {
    localStorage.setItem('crimsonShinobi_volume', volume.toString());
  }, [volume]);

  const value = {
    volume,
    setVolume,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
