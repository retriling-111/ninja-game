
import React from 'react';
import type { LevelObject } from '../types';

interface SpikeProps {
  spike: LevelObject;
}

const Spike: React.FC<SpikeProps> = ({ spike }) => {
  const spikeCount = Math.floor(spike.width / 20);
  const isCeilingSpike = spike.orientation === 'down';

  const spikeStyle = isCeilingSpike
    ? {
        borderLeft: '10px solid transparent',
        borderRight: '10px solid transparent',
        borderTop: '20px solid #dc2626',
      }
    : {
        borderLeft: '10px solid transparent',
        borderRight: '10px solid transparent',
        borderBottom: '20px solid #dc2626',
      };

  return (
    <div
      style={{
        left: spike.x,
        top: spike.y,
        width: spike.width,
        height: spike.height,
      }}
      className="absolute flex"
    >
      {Array.from({ length: spikeCount }).map((_, i) => (
        <div
          key={i}
          className="w-0 h-0"
          style={spikeStyle}
        />
      ))}
    </div>
  );
};

export default Spike;