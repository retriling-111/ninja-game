import type { LevelObject, EnemyType } from './types';

export const GAME_WIDTH = 1024;
export const GAME_HEIGHT = 576;

export const PHYSICS = {
  GRAVITY: 0.8,
  MAX_FALL_SPEED: 15,
};

export const PLAYER = {
  WIDTH: 32,
  HEIGHT: 60,
  SPEED: 6,
  JUMP_FORCE: 18,
  ATTACK_DURATION: 200, // ms
  ATTACK_COOLDOWN: 400, // ms
  ATTACK_WIDTH: 50,
  ATTACK_HEIGHT: 60,
  INITIAL_HEALTH: 3,
  INVINCIBILITY_DURATION: 1500, // ms
  DASH_SPEED: 14,
  DASH_DURATION: 180, // ms
  DASH_COOLDOWN: 1000, // ms
  TELEPORT_COOLDOWN: 2000, // ms
  SHADOW_CLONE_COOLDOWN: 5000, // ms
};

export const ENEMY_DEFINITIONS: Record<EnemyType, any> = {
    patrol: {
        width: 35,
        height: 35,
        patrolSpeed: 2,
    },
    shooter: {
        width: 35,
        height: 35,
        cooldown: 2000,
        range: 400,
    },
    charger: {
        width: 35,
        height: 35,
        speed: 8,
        range: 300,
        cooldown: 1500,
    },
    ninja: {
        width: 38,
        height: 50,
        patrolSpeed: 2,
        aggroRange: 450,
        meleeRange: 120,
        attackCooldown: 1800,
        meleeDashSpeed: 9,
        meleeDashDuration: 300,
    },
};

export const ENEMY = {
  PROJECTILE_SPEED: 7,
  PROJECTILE_WIDTH: 15,
  PROJECTILE_HEIGHT: 15,
};

export const LEVEL_ONE: LevelObject[] = [
  // Floor
  { id: 'p1', type: 'platform', x: 0, y: GAME_HEIGHT - 20, width: GAME_WIDTH, height: 20 },
  
  // Platforms
  { id: 'p2', type: 'platform', x: 200, y: GAME_HEIGHT - 120, width: 150, height: 20 },
  { id: 'p3', type: 'platform', x: 450, y: GAME_HEIGHT - 220, width: 150, height: 20 },
  { id: 'p4', type: 'platform', x: 200, y: GAME_HEIGHT - 350, width: 100, height: 20 },
  { id: 'p5', type: 'platform', x: 650, y: GAME_HEIGHT - 350, width: 200, height: 20 },
  
  // Spikes
  { id: 's1', type: 'spike', x: 500, y: GAME_HEIGHT - 40, width: 100, height: 20 },
  
  // Enemies
  { id: 'e1', type: 'enemy', enemyType: 'charger', x: 500, y: GAME_HEIGHT - 220 - ENEMY_DEFINITIONS.charger.height, width: ENEMY_DEFINITIONS.charger.width, height: ENEMY_DEFINITIONS.charger.height },
  { id: 'e2', type: 'enemy', enemyType: 'patrol', x: 750, y: GAME_HEIGHT - 350 - ENEMY_DEFINITIONS.patrol.height, width: ENEMY_DEFINITIONS.patrol.width, height: ENEMY_DEFINITIONS.patrol.height },
  { id: 'e3', type: 'enemy', enemyType: 'patrol', x: 250, y: GAME_HEIGHT - 120 - ENEMY_DEFINITIONS.patrol.height, width: ENEMY_DEFINITIONS.patrol.width, height: ENEMY_DEFINITIONS.patrol.height },
  { id: 'e4', type: 'enemy', enemyType: 'patrol', x: 680, y: GAME_HEIGHT - 350 - ENEMY_DEFINITIONS.patrol.height, width: ENEMY_DEFINITIONS.patrol.width, height: ENEMY_DEFINITIONS.patrol.height },
  { id: 'e5', type: 'enemy', enemyType: 'charger', x: 800, y: GAME_HEIGHT - 20 - ENEMY_DEFINITIONS.charger.height, width: ENEMY_DEFINITIONS.charger.width, height: ENEMY_DEFINITIONS.charger.height },

  // Goal
  { id: 'g1', type: 'goal', x: 100, y: GAME_HEIGHT - 350 - 60, width: 60, height: 60 },
];


export const LEVEL_TWO: LevelObject[] = [
  // Floor sections
  { id: 'l2_p1', type: 'platform', x: 0, y: GAME_HEIGHT - 20, width: 300, height: 20 },
  { id: 'l2_p2', type: 'platform', x: GAME_WIDTH - 300, y: GAME_HEIGHT - 20, width: 300, height: 20 },
  
  // Spikes in the middle floor
  { id: 'l2_s1', type: 'spike', x: 300, y: GAME_HEIGHT - 40, width: GAME_WIDTH - 600, height: 20 },

  // Rising platforms
  { id: 'l2_p3', type: 'platform', x: 100, y: GAME_HEIGHT - 120, width: 100, height: 20 },
  { id: 'l2_p4', type: 'platform', x: GAME_WIDTH - 200, y: GAME_HEIGHT - 120, width: 100, height: 20 },
  { id: 'l2_p5', type: 'platform', x: 400, y: GAME_HEIGHT - 220, width: 224, height: 20 },

  // Spikes as a ceiling for the platform below it
  { id: 'l2_s2', type: 'spike', x: 400, y: GAME_HEIGHT - 240, width: 224, height: 20 },

  // Mid-air platforms
  { id: 'l2_p6', type: 'platform', x: 150, y: GAME_HEIGHT - 320, width: 80, height: 20 },
  { id: 'l2_p7', type: 'platform', x: GAME_WIDTH - 230, y: GAME_HEIGHT - 320, width: 80, height: 20 },
  { id: 'l2_p8', type: 'platform', x: 0, y: GAME_HEIGHT - 420, width: 120, height: 20 },

  // Top platform
  { id: 'l2_p9', type: 'platform', x: 300, y: GAME_HEIGHT - 450, width: 424, height: 20 },
  
  // Enemies
  { id: 'l2_e1', type: 'enemy', enemyType: 'shooter', x: 450, y: GAME_HEIGHT - 220 - ENEMY_DEFINITIONS.shooter.height, width: ENEMY_DEFINITIONS.shooter.width, height: ENEMY_DEFINITIONS.shooter.height },
  { id: 'l2_e2', type: 'enemy', enemyType: 'patrol', x: 550, y: GAME_HEIGHT - 220 - ENEMY_DEFINITIONS.patrol.height, width: ENEMY_DEFINITIONS.patrol.width, height: ENEMY_DEFINITIONS.patrol.height },
  { id: 'l2_e3', type: 'enemy', enemyType: 'shooter', x: 400, y: GAME_HEIGHT - 450 - ENEMY_DEFINITIONS.shooter.height, width: ENEMY_DEFINITIONS.shooter.width, height: ENEMY_DEFINITIONS.shooter.height },
  { id: 'l2_e4', type: 'enemy', enemyType: 'ninja', x: 600, y: GAME_HEIGHT - 450 - ENEMY_DEFINITIONS.ninja.height, width: ENEMY_DEFINITIONS.ninja.width, height: ENEMY_DEFINITIONS.ninja.height },

  // Goal
  { id: 'l2_g1', type: 'goal', x: GAME_WIDTH - 100, y: GAME_HEIGHT - 420 - 60, width: 60, height: 60 },
];

export const LEVEL_THREE: LevelObject[] = [
  // No solid floor, just platforms over a void
  // Start platform
  { id: 'l3_p1', type: 'platform', x: 0, y: GAME_HEIGHT - 20, width: 100, height: 20 },

  // Series of small, difficult jumps
  { id: 'l3_p2', type: 'platform', x: 200, y: GAME_HEIGHT - 80, width: 50, height: 20 },
  { id: 'l3_p3', type: 'platform', x: 350, y: GAME_HEIGHT - 140, width: 50, height: 20 },
  { id: 'l3_p4', type: 'platform', x: 200, y: GAME_HEIGHT - 200, width: 50, height: 20 },
  
  // Long platform with an enemy and spikes below it
  { id: 'l3_p5', type: 'platform', x: 450, y: GAME_HEIGHT - 180, width: 250, height: 20 },
  { id: 'l3_s1', type: 'spike', x: 450, y: GAME_HEIGHT - 200, width: 250, height: 20 },
  
  // Path up to the top left
  { id: 'l3_p6', type: 'platform', x: 800, y: GAME_HEIGHT - 250, width: 150, height: 20 },
  { id: 'l3_p7', type: 'platform', x: 600, y: GAME_HEIGHT - 350, width: 80, height: 20 },
  { id: 'l3_p8', type: 'platform', x: 400, y: GAME_HEIGHT - 420, width: 80, height: 20 },
  
  // Spiky ceiling hazard
  { id: 'l3_s2', type: 'spike', x: 300, y: 0, width: 500, height: 20, orientation: 'down' },

  // Swinging Blade Hazard
  { id: 'l3_sb1', type: 'swingingBlade', x:0, y:0, width: 80, height: 15, pivotX: 575, pivotY: 20, chainLength: 100, period: 3, initialAngle: -Math.PI / 3 },


  // Final stretch
  { id: 'l3_p9', type: 'platform', x: 100, y: GAME_HEIGHT - 350, width: 100, height: 20 },
  { id: 'l3_p10', type: 'platform', x: 0, y: GAME_HEIGHT - 450, width: 50, height: 20 },

  // Enemies
  { id: 'l3_e1', type: 'enemy', enemyType: 'ninja', x: 500, y: GAME_HEIGHT - 180 - ENEMY_DEFINITIONS.ninja.height, width: ENEMY_DEFINITIONS.ninja.width, height: ENEMY_DEFINITIONS.ninja.height },
  { id: 'l3_e2', type: 'enemy', enemyType: 'shooter', x: 850, y: GAME_HEIGHT - 250 - ENEMY_DEFINITIONS.shooter.height, width: ENEMY_DEFINITIONS.shooter.width, height: ENEMY_DEFINITIONS.shooter.height },
  { id: 'l3_e3', type: 'enemy', enemyType: 'patrol', x: 120, y: GAME_HEIGHT - 350 - ENEMY_DEFINITIONS.patrol.height, width: ENEMY_DEFINITIONS.patrol.width, height: ENEMY_DEFINITIONS.patrol.height },

  // Goal
  { id: 'l3_g1', type: 'goal', x: 20, y: GAME_HEIGHT - 450 - 60, width: 60, height: 60 },
];

export const ALL_LEVELS = [LEVEL_ONE, LEVEL_TWO, LEVEL_THREE];