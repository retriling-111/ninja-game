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
  ATTACK_DAMAGE: 1,
  INITIAL_HEALTH: 5, // Increased from 3
  INVINCIBILITY_DURATION: 1500, // ms
  DASH_SPEED: 14,
  DASH_DURATION: 250, // ms
  DASH_COOLDOWN: 1000, // ms
  SHIELD_DURATION: 3500, // ms
  SHIELD_COOLDOWN: 5000, // ms
  TELEPORT_COOLDOWN: 2000, // ms
  TELEPORT_EFFECT_DURATION: 200, // ms
  SHURIKEN_SPEED: 12,
  SHURIKEN_LIFESPAN: 2000, // ms
  SHURIKEN_DAMAGE: 1,
};

export const BOSS_LEVEL_INTERVAL = 20;

export const ENEMY_DEFINITIONS: Record<EnemyType, any> = {
    patrol: {
        width: 35,
        height: 35,
        patrolSpeed: 2,
        health: 2,
    },
    shooter: {
        width: 35,
        height: 35,
        cooldown: 2000,
        range: 400,
        health: 1,
    },
    charger: {
        width: 35,
        height: 35,
        speed: 8,
        range: 300,
        cooldown: 1500,
        health: 3,
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
        health: 4,
    },
    // Biome variations - you can change colors or stats
    patrol_fire: {
        width: 35,
        height: 35,
        patrolSpeed: 2.5, // Slightly faster
        health: 3,
    },
    shooter_ice: {
        width: 35,
        height: 35,
        cooldown: 2500, // Slower shooting
        range: 450,
        health: 2,
    },
    // BOSS
    boss_1: {
        width: 100,
        height: 120,
        health: 20, // Base health
        aggroRange: 800,
        attackCooldown: 2500, // Base cooldown
    }
};

export const getBossStats = (levelNumber: number) => {
    const bossTier = Math.floor((levelNumber - 1) / BOSS_LEVEL_INTERVAL); // 0 for level 20, 1 for level 40 etc.
    return {
        health: 20 + bossTier * 15,
        attackCooldown: Math.max(1500, 2500 - bossTier * 300),
    };
};

export const ENEMY = {
  PROJECTILE_SPEED: 7,
  PROJECTILE_WIDTH: 15,
  PROJECTILE_HEIGHT: 15,
  SHURIKEN_WIDTH: 20,
  SHURIKEN_HEIGHT: 20,
};

// --- WORLD/BIOME LOGIC ---
export const BIOMES = ['default', 'fire', 'ice', 'forest', 'sky'];
export const getBiomeForLevel = (levelNumber: number): string => {
    const biomeIndex = Math.floor((levelNumber - 1) / BOSS_LEVEL_INTERVAL);
    return BIOMES[biomeIndex % BIOMES.length];
};


// --- PROCEDURAL LEVEL GENERATION ---

// Helper: Pseudo-random number generator for deterministic levels based on seed
const mulberry32 = (seed: number) => {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const generateLevel = (levelNumber: number): LevelObject[] => {
    const rand = mulberry32(levelNumber);
    const level: LevelObject[] = [];
    let idCounter = 0;

    const isBossLevel = levelNumber > 0 && levelNumber % BOSS_LEVEL_INTERVAL === 0;

    if (isBossLevel) {
        // Simple boss arena
        level.push({ id: `p_start`, type: 'platform', x: 0, y: GAME_HEIGHT - 40, width: GAME_WIDTH, height: 40 });
        const def = ENEMY_DEFINITIONS.boss_1;
        level.push({
            id: 'boss_main',
            type: 'enemy',
            enemyType: 'boss_1',
            x: GAME_WIDTH - def.width - 50,
            y: GAME_HEIGHT - 40 - def.height,
            width: def.width,
            height: def.height,
        });
        // Goal appears after boss is defeated, so it's not generated here initially.
        return level;
    }

    // Regular level generation
    let difficulty = Math.min(1.0, 0.05 + (levelNumber - 1) * 0.01);
    
    let currentX = 0;
    let currentY = GAME_HEIGHT - 100;

    level.push({ id: `p_${idCounter++}`, type: 'platform', x: 0, y: GAME_HEIGHT - 40, width: 150, height: 40 });
    currentX = 150;
    currentY = GAME_HEIGHT - 40;

    const levelLength = 15 + Math.floor(rand() * 5) + Math.floor(difficulty * 30);
    
    // Determine available enemies based on biome/level
    const biome = getBiomeForLevel(levelNumber);
    const enemyPool: EnemyType[] = ['patrol', 'charger', 'shooter', 'ninja'];
    let biomeEnemyPool: EnemyType[] = [];
    if (biome === 'fire') biomeEnemyPool = ['patrol_fire', 'charger'];
    else if (biome === 'ice') biomeEnemyPool = ['shooter_ice', 'patrol'];
    else biomeEnemyPool = enemyPool.filter((_, i) => i < 1 + Math.floor(difficulty * 4)); // Gradually introduce enemies


    for (let i = 0; i < levelLength; i++) {
        const platformWidth = Math.max(80, 100 + (rand() * 120) * (1 - difficulty));
        const gapWidth = 60 + rand() * (80 + 80 * difficulty);
        let nextX = currentX + gapWidth;
        const yChange = (rand() - 0.48) * 220 * (0.5 + difficulty * 0.7);
        let nextY = Math.max(100, Math.min(GAME_HEIGHT - 40, currentY + yChange));

        const newPlatform: LevelObject = {
            id: `p_${idCounter++}`,
            type: 'platform',
            x: nextX,
            y: nextY,
            width: platformWidth,
            height: 20
        };
        level.push(newPlatform);

        let hasHazard = false;

        const enemyChance = 0.15 + difficulty * 0.5;
        if (rand() < enemyChance) {
            const enemyType = biomeEnemyPool[Math.floor(rand() * biomeEnemyPool.length)];
            const def = ENEMY_DEFINITIONS[enemyType];
            if (def) {
                level.push({
                    id: `e_${idCounter++}`,
                    type: 'enemy',
                    enemyType: enemyType,
                    x: nextX + (platformWidth / 2) - (def.width / 2),
                    y: nextY - def.height,
                    width: def.width,
                    height: def.height
                });
                hasHazard = true;
            }
        }
        
        const hazardChance = 0.1 + difficulty * 0.45;
        if (rand() < hazardChance) {
             hasHazard = true;
            if (rand() > 0.4) {
                const spikeWidth = Math.min(platformWidth, Math.floor(2 + rand() * 4) * 20);
                const spikeX = nextX + rand() * (platformWidth - spikeWidth);
                if (rand() > 0.3 || newPlatform.y < 150) {
                    level.push({ id: `s_${idCounter++}`, type: 'spike', x: spikeX, y: newPlatform.y - 20, width: spikeWidth, height: 20, orientation: 'up' });
                } else {
                    level.push({ id: `s_${idCounter++}`, type: 'spike', x: spikeX, y: Math.max(20, newPlatform.y - (100 + rand() * 100)), width: spikeWidth, height: 20, orientation: 'down' });
                }
            } else {
                 level.push({ id: `sb_${idCounter++}`, type: 'swingingBlade', x:0, y:0, width: 80, height: 15, pivotX: nextX + platformWidth / 2, pivotY: Math.max(20, newPlatform.y - (100 + rand() * 100)), chainLength: 130, period: Math.max(1.8, 4 - (difficulty * 2)), initialAngle: (rand() - 0.5) * Math.PI });
            }
        }
        
        const healthPackChance = 0.15;
        if (!hasHazard && rand() < healthPackChance) {
             level.push({ id: `hp_${idCounter++}`, type: 'healthPack', x: nextX + (platformWidth / 2) - 12, y: nextY - 30, width: 24, height: 24 });
        }

        currentX = nextX + platformWidth;
        currentY = nextY;
    }

    const goalY = currentY - 80;
    level.push({ id: 'goal', type: 'goal', x: currentX + 100, y: goalY, width: 60, height: 60 });

    if (levelNumber > 5 && levelNumber % 10 !== 0) {
        level.push({ id: 'floor', type: 'platform', x: 0, y: GAME_HEIGHT - 20, width: currentX + 200, height: 20 });
    }

    return level;
};

export const ALL_LEVELS = Array.from({ length: 250 }, (_, i) => generateLevel(i + 1));