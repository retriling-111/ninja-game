import React from 'react';
import type { GameObject } from '../types';

interface HealthPackProps {
  pack: GameObject;
}

const HealthPack: React.FC<HealthPackProps> = ({ pack }) => {
  return (
    <div
      style={{
        left: pack.x,
        top: pack.y,
        width: pack.width,
        height: pack.height,
      }}
      className="absolute flex items-center justify-center"
    >
      <div className="absolute w-full h-full bg-red-800 rounded-full opacity-50 animate-pulse"></div>
      <div className="relative w-2/3 h-2/3 text-white font-black text-center flex items-center justify-center text-lg bg-red-600 rounded-full border-2 border-red-400 shadow-lg shadow-red-900/50">
        +
      </div>
    </div>
  );
};

export default HealthPack;
