import React from 'react';
import type { EnemyState } from '../types';

interface EnemyProps {
  enemy: EnemyState;
}

const Enemy: React.FC<EnemyProps> = ({ enemy }) => {

  const chargerHorns = (
    <>
      <div className="absolute -top-1 left-1 w-2 h-4 bg-red-700 rounded-tl-full rounded-tr-sm -rotate-12"></div>
      <div className="absolute -top-1 right-1 w-2 h-4 bg-red-700 rounded-tr-full rounded-tl-sm rotate-12"></div>
    </>
  );

  const shooterEye = (
    <div className="w-3 h-3 bg-red-500 rounded-full enemy-glow"></div>
  );

  const patrolBody = (
    <div className="w-2 h-2 bg-red-500 rounded-full enemy-glow"></div>
  );

  const ninjaBody = (
    <div className="w-full h-full ninja-body relative">
      {/* Head */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1/3 bg-black rounded-t-md"></div>
      {/* Body */}
      <div className="absolute bottom-0 left-0 w-full h-2/3 bg-black"></div>
      {/* Sash */}
      <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-3/4 h-2 bg-red-600 ninja-sash-glow enemy-glow"></div>
      {/* Attack Slash Effect (only visible during attack animation) */}
      {enemy.meleeAttackTimer > 0 &&
        <div
          className="absolute top-1/2 -translate-y-1/2 right-[-20px] w-12 h-12 rounded-full border-t-2 border-r-2 border-red-500 attack-slash"
          style={{
            borderColor: 'transparent',
            borderTopColor: '#ef4444',
            borderRightColor: '#ef4444',
            transform: 'rotate(-30deg)',
          }}
        />
      }
    </div>
  );

  let animationClass = '';
  if (enemy.type === 'ninja') {
    if (enemy.meleeAttackTimer > 0) {
      animationClass = 'ninja-attack';
    } else if (enemy.vx !== 0) {
      animationClass = 'ninja-run';
    } else {
      animationClass = 'ninja-idle';
    }
  }

  const containerClass = `absolute flex items-center justify-center transition-transform duration-200 ${
    enemy.type === 'ninja' ? '' : 'bg-gray-900 rounded-lg'
  } ${animationClass}`;

  return (
    <div
      style={{
        left: enemy.x,
        top: enemy.y,
        width: enemy.width,
        height: enemy.height,
        transform: enemy.direction === 'left' ? 'scaleX(-1)' : 'scaleX(1)',
      }}
      className={containerClass}
    >
      {enemy.type === 'charger' && chargerHorns}
      {enemy.type === 'shooter' && shooterEye}
      {enemy.type === 'patrol' && patrolBody}
      {enemy.type === 'ninja' && ninjaBody}
    </div>
  );
};

export default Enemy;