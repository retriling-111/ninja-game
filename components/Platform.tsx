
import React from 'react';
import type { GameObject } from '../types';

interface PlatformProps {
  platform: GameObject;
}

const Platform: React.FC<PlatformProps> = ({ platform }) => {
  return (
    <div
      style={{
        left: platform.x,
        top: platform.y,
        width: platform.width,
        height: platform.height,
      }}
      className="absolute bg-gray-800 border-t-2 border-gray-600"
    />
  );
};

export default Platform;