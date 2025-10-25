import React from 'react';
import type { PlayerState } from '../types';

interface PlayerProps {
  player: PlayerState;
}

const Player: React.FC<PlayerProps> = ({ player }) => {
  const isInvincible = player.invincibilityTimer > 0;
  // Don't blink if dashing, the afterimage is enough feedback.
  const playerClasses = `absolute transition-transform duration-100 ${
    isInvincible && !player.isDashing ? 'player-invincible' : ''
  }`;

  return (
    <div
      style={{
        left: player.x,
        top: player.y,
        width: player.width,
        height: player.height,
        transform: player.direction === 'left' ? 'scaleX(-1)' : 'scaleX(1)',
      }}
      className={playerClasses}
    >
      {/* Shield Effect */}
      {player.isShielding && (
        <div className="absolute inset-[-10px] bg-red-500/30 border-2 border-red-500 rounded-full animate-pulse" />
      )}

      {/* Dash Afterimage */}
      {player.isDashing && (
        <div className="absolute top-0 left-0 w-full h-full bg-red-600 opacity-50" />
      )}

      {/* Player Body */}
      <div className="relative w-full h-full bg-black z-10"></div>
      
      {/* Scarf */}
      <div
        className="absolute top-1/4 left-full w-2/3 h-1/6 bg-red-600 origin-left scarf"
        style={{ transform: player.direction === 'left' ? 'scaleX(-1)' : 'scaleX(1)' }}
      />
      
      {/* Attack Slash */}
      {player.isAttacking && (
        <div className="absolute -top-1 right-[-40px] w-20 h-20 rounded-full border-t-4 border-r-4 border-red-500 border-opacity-80 attack-slash"
          style={{
            borderColor: 'transparent',
            borderTopColor: '#ef4444',
            borderRightColor: '#ef4444',
            transform: player.direction === 'left' ? 'scaleX(-1) rotate(0deg)' : 'scaleX(1) rotate(0deg)',
            transformOrigin: 'bottom left'
          }}
        />
      )}
    </div>
  );
};

export default Player;