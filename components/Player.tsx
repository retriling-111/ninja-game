import React from 'react';
import type { PlayerState } from '../types';

interface PlayerProps {
  player: PlayerState;
}

const Player: React.FC<PlayerProps> = ({ player }) => {
  const isInvincible = player.invincibilityTimer > 0;

  let animationClass = '';
  if (!player.isOnGround) {
    animationClass = 'player-jump';
    // Add specific class for ascending or descending
    if (player.vy < -1) { // A small threshold to prevent flickering at the apex
      animationClass += ' player-jump-up';
    } else {
      animationClass += ' player-jump-down';
    }
  } else if (player.vx !== 0) {
    animationClass = 'player-run';
  } else {
    animationClass = 'player-idle';
  }

  // Don't blink if dashing, the afterimage is enough feedback.
  const playerClasses = `absolute transition-transform duration-100 ${
    isInvincible && !player.isDashing ? 'player-invincible' : ''
  } ${animationClass}`;

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
          <div className="absolute inset-[-10px] bg-red-500/30 border-2 border-red-500 rounded-full animate-pulse z-0"></div>
      )}

      {/* Dash Afterimage */}
      {player.isDashing && (
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-red-500/0 via-red-500/60 to-red-500/0 opacity-80 scale-x-150" />
      )}

      {/* Player Body - redesigned to look more like a classic ninja */}
      <div className="relative w-full h-full z-10">
          <div className="w-full h-full ninja-body">
              {/* Head */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[70%] h-[55%] bg-[#282828] rounded-sm">
                  {/* Eyeslit */}
                  <div className="absolute top-[35%] left-0 w-full h-[30%] bg-[#1a1a1a] flex items-center justify-center gap-1">
                      {/* Eyes */}
                      <div className="w-2 h-2 bg-white"></div>
                      <div className="w-2 h-2 bg-white"></div>
                  </div>
                  {/* Headband */}
                  <div className="absolute top-[10%] left-0 w-full h-[20%] bg-red-700"></div>
              </div>
              
              {/* Torso */}
              <div className="absolute top-[55%] left-1/2 -translate-x-1/2 w-[55%] h-[20%] bg-[#383838]"></div>

              {/* Legs */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[50%] h-[25%] flex justify-between">
                  <div className="w-[45%] h-full bg-[#2a2a2a] rounded-b-sm leg leg-left"></div>
                  <div className="w-[45%] h-full bg-[#2a2a2a] rounded-b-sm leg leg-right"></div>
              </div>
          </div>

          {/* Scarf / Headband Tie */}
          <div
            className="absolute top-[20%] left-[65%] w-1/3 h-[8%] bg-red-700 origin-left scarf z-0 rounded-sm"
          />
      </div>
      
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