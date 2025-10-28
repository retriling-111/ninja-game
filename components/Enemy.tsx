import React from 'react';
import type { EnemyState } from '../types';

interface EnemyProps {
  enemy: EnemyState;
}

const Enemy: React.FC<EnemyProps> = ({ enemy }) => {
  const isBoss = enemy.type === 'boss_1';

  // --- Biome specific styles ---
  let tintClass = '';
  if (enemy.type === 'patrol_fire') {
    tintClass = 'hue-rotate-[-30deg] saturate-150';
  } else if (enemy.type === 'shooter_ice') {
    tintClass = 'hue-rotate-[180deg] saturate-150 brightness-110';
  }

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

  const bossBody = (
     <div className="w-full h-full bg-black border-4 border-red-900 rounded-lg p-2 flex flex-col items-center justify-around">
        <div className="w-1/2 h-1/4 bg-red-700 rounded-full enemy-glow"></div>
        <div className="w-full h-1/2 bg-gray-800 rounded-sm"></div>
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
    (enemy.type === 'ninja' || isBoss) ? '' : 'bg-gray-900 rounded-lg'
  } ${animationClass} ${tintClass}`;
  
  const healthPercentage = isBoss ? (enemy.health! / enemy.maxHealth!) * 100 : 0;

  return (
    <div
      style={{
        left: enemy.x,
        top: enemy.y,
        width: enemy.width,
        height: enemy.height,
      }}
      className="relative"
    >
      {isBoss && (
          <div className="absolute -top-5 left-0 w-full h-3 bg-gray-800 border border-gray-600 rounded-full">
              <div 
                className="h-full bg-red-600 rounded-full transition-all duration-300"
                style={{ width: `${healthPercentage}%`}}
              ></div>
          </div>
      )}
      <div
        style={{
          transform: enemy.direction === 'left' ? 'scaleX(-1)' : 'scaleX(1)',
          width: '100%',
          height: '100%',
        }}
        className={containerClass}
      >
        {enemy.type === 'charger' && chargerHorns}
        {enemy.type === 'shooter' && shooterEye}
        {enemy.type === 'shooter_ice' && shooterEye}
        {enemy.type === 'patrol' && patrolBody}
        {enemy.type === 'patrol_fire' && patrolBody}
        {enemy.type === 'ninja' && ninjaBody}
        {isBoss && bossBody}
      </div>
    </div>
  );
};

export default Enemy;