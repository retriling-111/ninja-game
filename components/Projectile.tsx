import React from 'react';
import type { GameObject } from '../../types';

interface ProjectileProps {
  projectile: GameObject;
}

const Projectile: React.FC<ProjectileProps> = ({ projectile }) => {
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