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
    <>
      <div className="w-full h-full bg-black rounded-sm"></div>
      <div className="absolute top-1/3 w-2/3 h-1 bg-red-600 enemy-glow"></div>
    </>
  );

  const containerClass = `absolute flex items-center justify-center transition-transform duration-200 ${
    enemy.type === 'ninja' ? '' : 'bg-gray-900 rounded-lg'
  }`;

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
