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
  SPINNING_BLADE_COOLDOWN: 3000, // ms
  SPINNING_BLADE_SPEED: 8,
  SPINNING_BLADE_WIDTH: 25,
  SPINNING_BLADE_HEIGHT: 25,
  SHIELD_DURATION: 2500, // ms
  SHIELD_COOLDOWN: 5000, // ms
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

    const isChallengeLevel = levelNumber > 20 && (levelNumber - 1) % 20 === 0;

    // Difficulty scales from 0 to 1, reaching max difficulty around level 200
    // Challenge levels get a significant difficulty spike
    let difficulty = Math.min(1, levelNumber / 200); 
    if (isChallengeLevel) {
        difficulty = Math.min(1, (levelNumber + 40) / 200);
    }

    let currentX = 0;
    let currentY = GAME_HEIGHT - 100;

    // Start platform
    level.push({ id: `p_${idCounter++}`, type: 'platform', x: 0, y: GAME_HEIGHT - 40, width: 150, height: 40 });
    currentX = 150;
    currentY = GAME_HEIGHT - 40;

    // Determine level length based on difficulty
    const levelLength = 15 + Math.floor(rand() * 5) + Math.floor(difficulty * 30) + (isChallengeLevel ? 10 : 0);
    
    // Available enemies pool grows as the player progresses
    const enemyPool: EnemyType[] = ['patrol'];
    if (levelNumber > 10) enemyPool.push('charger');
    if (levelNumber > 25) enemyPool.push('shooter');
    if (levelNumber > 50) enemyPool.push('ninja');

    for (let i = 0; i < levelLength; i++) {
        // Platform width decreases and gap width increases with difficulty
        const platformWidth = Math.max(40, 90 + (rand() * 120) * (1 - difficulty));
        const gapWidth = 60 + rand() * (100 + 80 * difficulty);
        
        let nextX = currentX + gapWidth;
        
        // Vertical variation increases with difficulty
        const yChange = (rand() - 0.48) * 220 * (1.0 + difficulty * 0.7);
        let nextY = currentY + yChange;
        // Clamp Y to be within screen bounds
        nextY = Math.max(100, Math.min(GAME_HEIGHT - 40, nextY));

        const newPlatform: LevelObject = {
            id: `p_${idCounter++}`,
            type: 'platform',
            x: nextX,
            y: nextY,
            width: platformWidth,
            height: 20
        };
        level.push(newPlatform);

        // Add enemies on the new platform
        const enemyChance = isChallengeLevel ? 0.7 : 0.25 + difficulty * 0.5;
        if (rand() < enemyChance) {
            const enemyType = enemyPool[Math.floor(rand() * enemyPool.length)];
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
            }
        }
        
        // Add hazards on or around the new platform
        const hazardChance = isChallengeLevel ? 0.65 : 0.15 + difficulty * 0.45;
        if (rand() < hazardChance) {
            // After level 40, swinging blades can appear
            if (rand() > 0.4 || levelNumber < 40) { // Spikes are more common
                const spikeWidth = Math.min(platformWidth, Math.floor(2 + rand() * 4) * 20);
                const spikeX = nextX + rand() * (platformWidth - spikeWidth);
                
                if (rand() > 0.3 || newPlatform.y < 150) { // Ground spikes
                    level.push({
                        id: `s_${idCounter++}`,
                        type: 'spike',
                        x: spikeX,
                        y: newPlatform.y - 20, // Above platform
                        width: spikeWidth,
                        height: 20,
                        orientation: 'up'
                    });
                } else { // Ceiling spikes
                    const ceilingY = Math.max(20, newPlatform.y - (100 + rand() * 100));
                    level.push({
                        id: `s_${idCounter++}`,
                        type: 'spike',
                        x: spikeX,
                        y: ceilingY,
                        width: spikeWidth,
                        height: 20,
                        orientation: 'down',
                    });
                }
            } else { // Swinging blade hazard
                 level.push({ 
                    id: `sb_${idCounter++}`, 
                    type: 'swingingBlade', 
                    x:0, y:0, // x,y are calculated in game logic based on pivot and angle
                    width: 80, 
                    height: 15, 
                    pivotX: nextX + platformWidth / 2, 
                    pivotY: Math.max(20, newPlatform.y - (100 + rand() * 100)), // Pivot above platform
                    chainLength: 130, 
                    period: Math.max(1.8, 4 - (difficulty * 2)), // Faster swing on harder levels
                    initialAngle: (rand() - 0.5) * Math.PI
                });
            }
        }

        currentX = nextX + platformWidth;
        currentY = nextY;
    }

    // Goal at the end of the level
    const goalY = levelNumber > 150 ? currentY - (100 + rand() * 100) : currentY - 80; // Harder to reach goal
    level.push({ id: 'goal', type: 'goal', x: currentX + 100, y: goalY, width: 60, height: 60 });

    // Every 10th level is a pitfall level (no floor)
    if (levelNumber > 5 && levelNumber % 10 !== 0) {
        level.push({ id: 'floor', type: 'platform', x: 0, y: GAME_HEIGHT - 20, width: currentX + 200, height: 20 });
    }

    return level;
};

// Generate all 250 levels
export const ALL_LEVELS = Array.from({ length: 250 }, (_, i) => generateLevel(i + 1));