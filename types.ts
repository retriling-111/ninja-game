export type GameStatus = 'loading' | 'login' | 'signup' | 'loadingData' | 'start' | 'playing' | 'gameOver' | 'win' | 'about' | 'levels' | 'settings' | 'gameEnd' | 'levelComplete' | 'leaderboard';

export type ControlAction = 'moveLeft' | 'moveRight' | 'jump' | 'attack' | 'dash' | 'shield' | 'shuriken' | 'pause';
export type Keymap = Record<ControlAction, string>;

// --- Mobile UI Customization Types ---
export type MobileUIGroup = 'movement' | 'actions';
export type MobileUIPosition = { bottom: number; left?: number; right?: number };
export type MobileUILayout = Record<MobileUIGroup, MobileUIPosition>;
// --- End Mobile UI Types ---

export interface GameObject {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export type LevelObjectType = 'platform' | 'enemy' | 'spike' | 'goal' | 'swingingBlade' | 'healthPack';

export type EnemyType = 'patrol' | 'shooter' | 'charger' | 'ninja' | 'boss_1' | 'patrol_fire' | 'shooter_ice';
export type AiState = 'patrolling' | 'aggro' | 'special_attack' | 'boss_barrage' | 'boss_teleport_slam' | 'boss_spawn_minions';
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
  teleportTimer: number;
  isShielding: boolean;
  shieldCooldown: number;
  shieldTimer: number;
  shurikenOut: boolean;
}

export interface EnemyState extends GameObject {
    type: EnemyType;
    direction: Direction;
    attackCooldown: number;
    aiState: AiState;
    patrolBounds?: { left: number; right: number };
    vx: number;
    vy?: number;
    initialX: number;
    meleeAttackTimer: number; // Ninja specific
    health: number;
    maxHealth: number;
    aiTimer: number; // General purpose timer for AI state changes
    isSlamming?: boolean;
    isChargingSlam?: boolean;
    baseAttackCooldown?: number;
}

export interface ProjectileState extends GameObject {
    vx: number;
    vy?: number;
    type?: 'enemy' | 'player_shuriken';
    visualType?: 'default' | 'shockwave';
}

export interface ShurikenProjectileState extends GameObject {
    vx: number;
    vy: number;
    rotation: number;
}

export interface SwingingBladeState extends LevelObject {
  angle: number;
}