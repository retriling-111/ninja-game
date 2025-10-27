export type GameStatus = 'loading' | 'login' | 'loadingData' | 'start' | 'playing' | 'gameOver' | 'win' | 'about' | 'levels' | 'settings' | 'gameEnd' | 'levelComplete';

export interface GameObject {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export type LevelObjectType = 'platform' | 'enemy' | 'spike' | 'goal' | 'swingingBlade' | 'healthPack';

export type EnemyType = 'patrol' | 'shooter' | 'charger' | 'ninja';
export type AiState = 'patrolling' | 'aggro';
export type Direction = 'left' | 'right';

export interface LevelObject extends GameObject {
  type: LevelObjectType;
  orientation?: 'up' | 'down'; // For spikes
  enemyType?: EnemyType; // For enemies
  // For swinging blades
  pivotX?: number;
  pivotY?: number;
  chainLength?: number;
  period?: number;
  initialAngle?: number;
}

export interface PlayerState extends GameObject {
  vx: number;
  vy: number;
  isOnGround: boolean;
  isAttacking: boolean;
  attackCooldown: number;
  direction: Direction;
  health: number;
  invincibilityTimer: number;
  isDashing: boolean;
  dashCooldown: number;
  dashTimer: number;
  doubleJumpUsed: boolean;
  teleportCooldown: number;
  isShielding: boolean;
  shieldCooldown: number;
  shieldTimer: number;
}

export interface EnemyState extends GameObject {
    type: EnemyType;
    direction: Direction;
    attackCooldown: number;
    aiState: AiState;
    patrolBounds?: { left: number; right: number };
    vx: number;
    initialX: number;
    meleeAttackTimer: number; // Ninja specific
}

export interface ProjectileState extends GameObject {
    vx: number;
}

export interface ShurikenProjectileState extends GameObject {
    vx: number;
}

export interface SwingingBladeState extends LevelObject {
  angle: number;
}