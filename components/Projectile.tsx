import React from 'react';
import type { ProjectileState } from '../types';

interface ProjectileProps {
  projectile: ProjectileState;
}

const Projectile: React.FC<ProjectileProps> = ({ projectile }) => {
  if (projectile.visualType === 'shockwave') {
    return (
      <div
        style={{
          left: projectile.x,
          top: projectile.y,
          width: projectile.width,
          height: projectile.height,
        }}
        className="absolute bg-red-500 rounded-sm shadow-[0_0_15px_#f00,0_0_8px_#ef4444]"
      />
    );
  }

  return (
    <div
      style={{
        left: projectile.x,
        top: projectile.y,
        width: projectile.width,
        height: projectile.height,
      }}
      className="absolute flex items-center justify-center shuriken-spin"
    >
        <div className="w-full h-1/3 bg-gray-400 absolute rounded-sm"></div>
        <div className="w-1/3 h-full bg-gray-400 absolute rounded-sm"></div>
    </div>
  );
};

export default Projectile;
