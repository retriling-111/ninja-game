import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useGameLoop } from '../hooks/useGameLoop';
import { useKeyboardInput } from '../hooks/useKeyboardInput';
import type { PlayerState, LevelObject, GameObject, EnemyState, ProjectileState, EnemyType, SwingingBladeState, ShurikenProjectileState } from '../types';
import { GAME_WIDTH, GAME_HEIGHT, PLAYER, PHYSICS, ALL_LEVELS, ENEMY, ENEMY_DEFINITIONS, getBiomeForLevel, BOSS_LEVEL_INTERVAL, getBossStats } from '../constants';
import Player from './Player';
import Platform from './Platform';
import Spike from './Spike';
import Enemy from './Enemy';
import Goal from './Goal';
import Projectile from './Projectile';
import HealthPack from './HealthPack';
import { useResponsive } from '../hooks/useResponsive';


// --- NEW IN-FILE COMPONENTS ---
const Shuriken: React.FC<{shuriken: ShurikenProjectileState}> = ({ shuriken }) => (
    <div
      style={{
        left: shuriken.x,
        top: shuriken.y,
        width: ENEMY.SHURIKEN_WIDTH,
        height: ENEMY.SHURIKEN_HEIGHT,
        transform: `rotate(${shuriken.rotation}deg)`,
      }}
      className="absolute flex items-center justify-center"
    >
        <div className="w-full h-1/3 bg-gray-300 absolute rounded-sm shadow-lg shadow-black"></div>
        <div className="w-1/3 h-full bg-gray-300 absolute rounded-sm shadow-lg shadow-black"></div>
    </div>
);

const SwingingBlade: React.FC<{blade: SwingingBladeState}> = ({ blade }) => {
    const chainStyle: React.CSSProperties = {
        position: 'absolute',
        top: `${blade.pivotY}px`,
        left: `${blade.pivotX}px`,
        width: '2px',
        height: `${blade.chainLength}px`,
        backgroundColor: '#4a4a4a',
        transformOrigin: 'top center',
        transform: `rotate(${blade.angle}rad)`,
    };
    const bladeStyle: React.CSSProperties = {
        position: 'absolute',
        top: `${blade.y}px`,
        left: `${blade.x}px`,
        width: `${blade.width}px`,
        height: `${blade.height}px`,
        backgroundColor: '#ef4444',
        borderRadius: '2px',
        transform: `translate(-50%, -50%) rotate(${blade.angle}rad)`,
        boxShadow: '0 0 8px #ef4444',
    };

    return (
        <>
            <div style={chainStyle}></div>
            <div style={bladeStyle}></div>
        </>
    );
};

interface PauseMenuProps {
    onResume: () => void;
    onRestart: () => void;
    onGoToMainMenu: () => void;
}
const PauseMenu: React.FC<PauseMenuProps> = ({ onResume, onRestart, onGoToMainMenu }) => {
    return (
        <div className="absolute inset-0 bg-black/40 ios-backdrop-blur flex flex-col items-center justify-center z-30">
            <div className="flex flex-col gap-4 p-8 rounded-2xl bg-gray-900/50 border border-white/20">
                <h2 className="text-5xl font-bold text-red-600 blood-text-shadow mb-4 text-center">Paused</h2>
                <button onClick={onResume} className="w-64 px-8 py-3 bg-red-700 hover:bg-red-600 text-white font-semibold text-xl transition-all duration-300 rounded-xl">Resume</button>
                <button onClick={onRestart} className="w-64 px-8 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-600 text-white font-semibold text-lg transition-all duration-300 rounded-xl">Restart Level</button>
                <button onClick={onGoToMainMenu} className="w-64 px-8 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-600 text-white font-semibold text-lg transition-all duration-300 rounded-xl">Main Menu</button>
            </div>
        </div>
    );
};

interface MobileControlsProps {
    onKeyPress: (key: string) => void;
    onKeyRelease: (key: string) => void;
}

const MobileControlButton: React.FC<{
    label: string | React.ReactNode;
    actionKey: string;
    onKeyPress: (key: string) => void;
    onKeyRelease: (key: string) => void;
    className?: string;
}> = ({ label, actionKey, onKeyPress, onKeyRelease, className }) => {
      
    return (
        <button
            onTouchStart={() => onKeyPress(actionKey)}
            onTouchEnd={() => onKeyRelease(actionKey)}
            onMouseDown={(e) => { e.preventDefault(); onKeyPress(actionKey); }}
            onMouseUp={(e) => { e.preventDefault(); onKeyRelease(actionKey); }}
            className={`w-16 h-16 flex items-center justify-center bg-white/10 rounded-full text-white text-3xl font-bold active:bg-white/20 select-none ${className}`}
            aria-label={`Control for ${actionKey}`}
        >
            {label}
        </button>
    );
};

const MobileControls: React.FC<MobileControlsProps> = ({ onKeyPress, onKeyRelease }) => {
    return (
        <div className="absolute inset-0 z-20 pointer-events-none">
            {/* Movement Controls */}
            <div className="absolute bottom-4 left-4 flex items-center gap-4 pointer-events-auto">
                <MobileControlButton label="←" actionKey="ArrowLeft" onKeyPress={onKeyPress} onKeyRelease={onKeyRelease} />
                <MobileControlButton label="→" actionKey="ArrowRight" onKeyPress={onKeyPress} onKeyRelease={onKeyRelease} />
            </div>

            {/* Action Controls */}
            <div className="absolute bottom-4 right-4 flex items-end gap-3 pointer-events-auto">
                 <MobileControlButton label="S" actionKey="s" onKeyPress={onKeyPress} onKeyRelease={onKeyRelease} className="w-14 h-14" />
                 <MobileControlButton label="D" actionKey="d" onKeyPress={onKeyPress} onKeyRelease={onKeyRelease} className="w-14 h-14" />
                 <MobileControlButton label="W" actionKey="w" onKeyPress={onKeyPress} onKeyRelease={onKeyRelease} className="w-14 h-14" />
                 <MobileControlButton label="A" actionKey="a" onKeyPress={onKeyPress} onKeyRelease={onKeyRelease} />
                 <MobileControlButton label="↑" actionKey="ArrowUp" onKeyPress={onKeyPress} onKeyRelease={onKeyRelease} className="w-20 h-20 text-4xl"/>
            </div>
        </div>
    );
};


// --- UTILITIES ---
const isColliding = (a: GameObject, b: GameObject) => {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
};

// --- MODULAR AI LOGIC ---
type EnemySpawnFunction = (enemyData: Omit<EnemyState, 'id' | 'health' | 'maxHealth'>) => void;

type AiUpdateFunction = (
  enemy: EnemyState,
  player: PlayerState,
  deltaTime: number,
  spawnProjectile: (projectile: Omit<ProjectileState, 'id'>) => void,
  spawnEnemy: EnemySpawnFunction,
) => EnemyState;

const updatePatrol: AiUpdateFunction = (enemy, _player, _deltaTime, _spawnProjectile) => {
    const updatedEnemy = { ...enemy };
    const def = ENEMY_DEFINITIONS[enemy.type];

    if (updatedEnemy.patrolBounds) {
        if (updatedEnemy.x <= updatedEnemy.patrolBounds.left && updatedEnemy.vx < 0) {
            updatedEnemy.vx = def.patrolSpeed;
            updatedEnemy.direction = 'right';
        } else if (updatedEnemy.x >= updatedEnemy.patrolBounds.right && updatedEnemy.vx > 0) {
            updatedEnemy.vx = -def.patrolSpeed;
            updatedEnemy.direction = 'left';
        }
    }
    updatedEnemy.x += updatedEnemy.vx;
    return updatedEnemy;
};

const updateCharger: AiUpdateFunction = (enemy, player, deltaTime, _spawnProjectile) => {
    const updatedEnemy = { ...enemy };
    const def = ENEMY_DEFINITIONS.charger;

    if (updatedEnemy.attackCooldown > 0) updatedEnemy.attackCooldown -= deltaTime;
    
    const distanceToPlayer = Math.hypot(player.x - updatedEnemy.x, player.y - updatedEnemy.y);
    const directionToPlayer = player.x + player.width / 2 < updatedEnemy.x + updatedEnemy.width / 2 ? 'left' : 'right';
    updatedEnemy.direction = directionToPlayer;

    if (updatedEnemy.aiState !== 'aggro' && Math.abs(player.y - updatedEnemy.y) < 50 && distanceToPlayer < def.range && updatedEnemy.attackCooldown <= 0) {
        updatedEnemy.aiState = 'aggro';
        updatedEnemy.vx = (directionToPlayer === 'right' ? 1 : -1) * def.speed;
    }

    if (updatedEnemy.aiState === 'aggro') {
        updatedEnemy.x += updatedEnemy.vx;
        if (isColliding(updatedEnemy, player) || distanceToPlayer > def.range + 50 || updatedEnemy.x < 0) {
            updatedEnemy.aiState = 'patrolling';
            updatedEnemy.vx = 0;
            updatedEnemy.attackCooldown = def.cooldown;
        }
    }
    return updatedEnemy;
};

const updateShooter: AiUpdateFunction = (enemy, player, deltaTime, spawnProjectile) => {
    const updatedEnemy = { ...enemy };
    const def = ENEMY_DEFINITIONS[enemy.type];

    if (updatedEnemy.attackCooldown > 0) updatedEnemy.attackCooldown -= deltaTime;

    const distanceToPlayer = Math.hypot(player.x - updatedEnemy.x, player.y - updatedEnemy.y);
    const directionToPlayer = player.x + player.width / 2 < updatedEnemy.x + updatedEnemy.width / 2 ? 'left' : 'right';
    updatedEnemy.direction = directionToPlayer;

    if (distanceToPlayer < def.range && updatedEnemy.attackCooldown <= 0) {
        updatedEnemy.attackCooldown = def.cooldown;
        spawnProjectile({
            x: updatedEnemy.x + (directionToPlayer === 'right' ? updatedEnemy.width : -ENEMY.PROJECTILE_WIDTH),
            y: updatedEnemy.y + updatedEnemy.height / 2 - ENEMY.PROJECTILE_HEIGHT / 2,
            width: ENEMY.PROJECTILE_WIDTH,
            height: ENEMY.PROJECTILE_HEIGHT,
            vx: (directionToPlayer === 'right' ? 1 : -1) * ENEMY.PROJECTILE_SPEED,
        });
    }
    return updatedEnemy;
};

const updateNinja: AiUpdateFunction = (enemy, player, deltaTime, spawnProjectile) => {
    const updatedEnemy = { ...enemy };
    const def = ENEMY_DEFINITIONS.ninja;

    if (updatedEnemy.attackCooldown > 0) updatedEnemy.attackCooldown -= deltaTime;
    if (updatedEnemy.meleeAttackTimer > 0) {
        updatedEnemy.meleeAttackTimer -= deltaTime;
        if (updatedEnemy.meleeAttackTimer <= 0) {
            updatedEnemy.vx = 0; // End melee dash
        }
    }

    const isMeleeDashing = updatedEnemy.meleeAttackTimer > 0;
    if (isMeleeDashing) {
        updatedEnemy.x += updatedEnemy.vx;
        return updatedEnemy;
    }

    const distanceToPlayer = Math.hypot(player.x - updatedEnemy.x, player.y - updatedEnemy.y);
    const directionToPlayer = player.x + player.width / 2 < updatedEnemy.x + updatedEnemy.width / 2 ? 'left' : 'right';
    updatedEnemy.direction = directionToPlayer;
    
    const isInAggroRange = distanceToPlayer < def.aggroRange;
    const isInMeleeRange = distanceToPlayer < def.meleeRange;
    const canSeePlayer = Math.abs(player.y - updatedEnemy.y) < 150;

    if (isInAggroRange && canSeePlayer) {
        updatedEnemy.aiState = 'aggro';
    } else if (updatedEnemy.aiState === 'aggro') {
        updatedEnemy.aiState = 'patrolling';
    }

    if (updatedEnemy.aiState === 'aggro') {
        updatedEnemy.vx = 0;
        if (updatedEnemy.attackCooldown <= 0) {
            if (isInMeleeRange) {
                updatedEnemy.vx = (directionToPlayer === 'right' ? 1 : -1) * def.meleeDashSpeed;
                updatedEnemy.meleeAttackTimer = def.meleeDashDuration;
                updatedEnemy.attackCooldown = def.attackCooldown;
            } else {
                spawnProjectile({
                    x: updatedEnemy.x + (directionToPlayer === 'right' ? updatedEnemy.width : -ENEMY.PROJECTILE_WIDTH),
                    y: updatedEnemy.y + updatedEnemy.height / 3,
                    width: ENEMY.PROJECTILE_WIDTH,
                    height: ENEMY.PROJECTILE_HEIGHT,
                    vx: (directionToPlayer === 'right' ? 1 : -1) * ENEMY.PROJECTILE_SPEED,
                });
                updatedEnemy.attackCooldown = def.attackCooldown;
            }
        }
    } else { // Patrolling
        if (updatedEnemy.vx === 0) {
            updatedEnemy.vx = updatedEnemy.direction === 'left' ? -def.patrolSpeed : def.patrolSpeed;
        }

        if (updatedEnemy.patrolBounds) {
            if (updatedEnemy.x <= updatedEnemy.patrolBounds.left && updatedEnemy.vx < 0) {
                updatedEnemy.vx = def.patrolSpeed;
                updatedEnemy.direction = 'right';
            } else if (updatedEnemy.x >= updatedEnemy.patrolBounds.right && updatedEnemy.vx > 0) {
                updatedEnemy.vx = -def.patrolSpeed;
                updatedEnemy.direction = 'left';
            }
        }
        updatedEnemy.x += updatedEnemy.vx;
    }
    return updatedEnemy;
};

const updateBoss: AiUpdateFunction = (enemy, player, deltaTime, spawnProjectile, spawnEnemy) => {
    let updatedEnemy = { ...enemy };

    if (updatedEnemy.attackCooldown > 0) updatedEnemy.attackCooldown -= deltaTime;
    if (updatedEnemy.aiTimer > 0) updatedEnemy.aiTimer -= deltaTime;

    const directionToPlayer = player.x + player.width / 2 < updatedEnemy.x + updatedEnemy.width / 2 ? 'left' : 'right';
    updatedEnemy.direction = directionToPlayer;

    if (updatedEnemy.attackCooldown <= 0 && updatedEnemy.aiState === 'patrolling') {
        updatedEnemy.attackCooldown = updatedEnemy.baseAttackCooldown!;
        const attackType = Math.random();
        
        if (attackType < 0.4) { 
            updatedEnemy.aiState = 'boss_barrage';
            updatedEnemy.aiTimer = 1000;
        } else if (attackType < 0.75) { 
             updatedEnemy.aiState = 'boss_teleport_slam';
             updatedEnemy.aiTimer = 500;
             updatedEnemy.isSlamming = false;
             updatedEnemy.isChargingSlam = false;
        } else {
            updatedEnemy.aiState = 'boss_spawn_minions';
            updatedEnemy.aiTimer = 200;
        }
    }
    
    switch(updatedEnemy.aiState) {
        case 'boss_barrage':
            if (updatedEnemy.aiTimer > 0) {
                if (Math.floor(updatedEnemy.aiTimer / 100) % 2 === 0) { // Shoots in bursts
                    spawnProjectile({
                        x: updatedEnemy.x + (directionToPlayer === 'right' ? updatedEnemy.width : -ENEMY.PROJECTILE_WIDTH),
                        y: updatedEnemy.y + (updatedEnemy.height * (0.2 + Math.random() * 0.6)),
                        width: ENEMY.PROJECTILE_WIDTH * 1.5,
                        height: ENEMY.PROJECTILE_HEIGHT * 1.5,
                        vx: (directionToPlayer === 'right' ? 1 : -1) * (ENEMY.PROJECTILE_SPEED + 2),
                    });
                }
            } else {
                updatedEnemy.aiState = 'patrolling';
            }
            break;

        case 'boss_teleport_slam':
            if (updatedEnemy.aiTimer <= 0 && !updatedEnemy.isChargingSlam && !updatedEnemy.isSlamming) {
                const targetX = player.x;
                updatedEnemy.x = Math.max(0, Math.min(targetX - updatedEnemy.width / 2, GAME_WIDTH - updatedEnemy.width));
                updatedEnemy.y = -updatedEnemy.height; // Teleport offscreen above player
                updatedEnemy.isChargingSlam = true;
                updatedEnemy.aiTimer = 700;
            } else if (updatedEnemy.isChargingSlam && updatedEnemy.aiTimer <= 0) {
                updatedEnemy.isChargingSlam = false;
                updatedEnemy.isSlamming = true;
                updatedEnemy.vy = 45; // Slam speed
            }
            break;

        case 'boss_spawn_minions':
            if(updatedEnemy.aiTimer <= 0) {
                 spawnEnemy({
                    x: updatedEnemy.x - 40, y: updatedEnemy.y + updatedEnemy.height - 35,
                    width: 35, height: 35, type: 'patrol',
                    direction: 'left', attackCooldown: 0, aiState: 'patrolling',
                    vx: -ENEMY_DEFINITIONS.patrol.patrolSpeed, initialX: updatedEnemy.x - 40, meleeAttackTimer: 0,
                    aiTimer: 0,
                });
                spawnEnemy({
                    x: updatedEnemy.x + updatedEnemy.width + 5, y: updatedEnemy.y + updatedEnemy.height - 35,
                    width: 35, height: 35, type: 'patrol',
                    direction: 'right', attackCooldown: 0, aiState: 'patrolling',
                    vx: ENEMY_DEFINITIONS.patrol.patrolSpeed, initialX: updatedEnemy.x  + updatedEnemy.width + 5, meleeAttackTimer: 0,
                    aiTimer: 0,
                });
                updatedEnemy.aiState = 'patrolling';
            }
            break;
    }

    if (updatedEnemy.isSlamming) {
        updatedEnemy.y! += updatedEnemy.vy!;
        const groundY = GAME_HEIGHT - 40 - updatedEnemy.height;
        if (updatedEnemy.y! >= groundY) {
            updatedEnemy.y = groundY;
            updatedEnemy.isSlamming = false;
            updatedEnemy.vy = 0;
            updatedEnemy.aiState = 'patrolling';
            
            const shockwaveY = GAME_HEIGHT - 40 - 50; // Shockwave height is 50
            spawnProjectile({
                x: updatedEnemy.x + updatedEnemy.width / 2,
                y: shockwaveY,
                width: 15,
                height: 50,
                vx: -12,
                visualType: 'shockwave',
            });
            spawnProjectile({
                x: updatedEnemy.x + updatedEnemy.width / 2,
                y: shockwaveY,
                width: 15,
                height: 50,
                vx: 12,
                visualType: 'shockwave',
            });
        }
    }
    
    return updatedEnemy;
};


const ENEMY_AI_UPDATES: Record<EnemyType, AiUpdateFunction | undefined> = {
    patrol: updatePatrol,
    shooter: updateShooter,
    charger: updateCharger,
    ninja: updateNinja,
    patrol_fire: updatePatrol,
    shooter_ice: updateShooter,
    boss_1: updateBoss,
};


// --- UI COMPONENTS ---

interface GameProps {
  level: number;
  onGameOver: () => void;
  onLevelComplete: () => void;
  onGoToMainMenu: () => void;
  onRestartCurrentLevel: () => void;
}

const HealthBar: React.FC<{ health: number; maxHealth: number; }> = ({ health, maxHealth }) => {
  const healthIcons = [];
  for (let i = 0; i < maxHealth; i++) {
    healthIcons.push(
       <div key={i} className="w-8 h-8 relative">
        <svg viewBox="0 0 24 24" className={`w-full h-full transition-colors duration-200 drop-shadow-lg ${i < health ? 'text-red-600' : 'text-gray-800'}`} fill="currentColor">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
        { i < health && <div className="absolute inset-0 bg-red-500/30 blur-sm -z-10"></div> }
      </div>
    );
  }

  return <div className="flex gap-1">{healthIcons}</div>;
};

const CooldownIndicator: React.FC<{ cooldown: number; maxCooldown: number, label: string }> = ({ cooldown, maxCooldown, label }) => {
    const ready = cooldown <= 0;
    const fillPercentage = ready ? 1 : Math.max(0, 1 - (cooldown / maxCooldown));
    const circumference = 2 * Math.PI * 14; // 2 * pi * radius (14)
    const strokeDashoffset = circumference * (1 - fillPercentage);

    return (
        <div className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${ready ? 'bg-red-900/50' : 'bg-black/50'}`}>
             <svg className="absolute w-full h-full" viewBox="0 0 32 32">
                <circle
                    cx="16" cy="16" r="14"
                    className="stroke-current text-gray-700"
                    strokeWidth="3"
                    fill="transparent"
                />
                <circle
                    cx="16" cy="16" r="14"
                    className="stroke-current text-red-500"
                    strokeWidth="3"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    style={{ transition: strokeDashoffset > 1 ? 'stroke-dashoffset 0.1s linear' : 'none' }}
                    transform="rotate(-90 16 16)"
                />
            </svg>
            <span className={`font-semibold z-10 transition-colors ${ready ? 'text-white' : 'text-gray-400'}`}>
                {label}
            </span>
        </div>
    );
};


// --- MAIN GAME COMPONENT ---

const Game: React.FC<GameProps> = ({ level, onGameOver, onLevelComplete, onGoToMainMenu, onRestartCurrentLevel }) => {
  const currentLevelData = useMemo(() => ALL_LEVELS[level - 1] || ALL_LEVELS[0], [level]);
  const [isPaused, setIsPaused] = useState(false);
  const [, setFrame] = useState(0);
  const { device } = useResponsive();
  const isDesktop = device === 'desktop';
  
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number | null>(null);

  const playerRef = useRef<PlayerState>({
    id: 'player',
    x: 50,
    y: GAME_HEIGHT - PLAYER.HEIGHT - 50,
    width: PLAYER.WIDTH,
    height: PLAYER.HEIGHT,
    vx: 0,
    vy: 0,
    isOnGround: false,
    isAttacking: false,
    attackCooldown: 0,
    direction: 'right',
    health: PLAYER.INITIAL_HEALTH,
    invincibilityTimer: 0,
    isDashing: false,
    dashCooldown: 0,
    dashTimer: 0,
    doubleJumpUsed: false,
    teleportCooldown: 0,
    teleportTimer: 0,
    isShielding: false,
    shieldCooldown: 0,
    shieldTimer: 0,
    shurikenOut: false,
  });

  const [enemies, setEnemies] = useState<EnemyState[]>([]);
  const [projectiles, setProjectiles] = useState<ProjectileState[]>([]);
  const [swingingBlades, setSwingingBlades] = useState<SwingingBladeState[]>([]);
  const [healthPacks, setHealthPacks] = useState<LevelObject[]>([]);
  const [shuriken, setShuriken] = useState<ShurikenProjectileState | null>(null);
  
  const keyboardPressedKeys = useKeyboardInput();
  const [touchPressedKeys, setTouchPressedKeys] = useState<Set<string>>(new Set());
  const pressedKeys = useMemo(() => new Set([...keyboardPressedKeys, ...touchPressedKeys].map(key => key.toLowerCase())), [keyboardPressedKeys, touchPressedKeys]);
  const prevPressedKeys = useRef<Set<string>>(new Set());
  const hitEnemiesDuringSwing = useRef(new Set<string>());
  
  const cameraRef = useRef({ x: 0, y: 0 });
  const levelWidth = useRef(GAME_WIDTH);
  const isBossLevel = level > 0 && level % BOSS_LEVEL_INTERVAL === 0;
  const [isBossDefeated, setIsBossDefeated] = useState(false);
  const [levelObjects, setLevelObjects] = useState<LevelObject[]>([]);
  const enemySpawnQueue = useRef<Omit<EnemyState, 'id' | 'health' | 'maxHealth'>[]>([]);

  useEffect(() => {
    setLevelObjects(currentLevelData);
  }, [currentLevelData]);

  // Screen orientation lock
  useEffect(() => {
    const lockOrientation = async () => {
      try {
        if (screen.orientation && (screen.orientation as any).lock) {
          await (screen.orientation as any).lock('landscape');
        }
      } catch (error) {
        console.error('Failed to lock screen orientation:', error);
      }
    };
    if (device !== 'desktop') {
      lockOrientation();
    }
    return () => {
      if (screen.orientation && (screen.orientation as any).unlock && device !== 'desktop') {
        (screen.orientation as any).unlock();
      }
    };
  }, [device]);
  
  // Responsive scaling
  useEffect(() => {
    const container = gameContainerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(() => {
        if (container && container.offsetWidth > 0) {
            const newScale = container.offsetWidth / GAME_WIDTH;
            setScale(newScale);
        }
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);
  
  // Pause listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key.toLowerCase() === 'p' || e.key === 'Escape') {
            setIsPaused(prev => !prev);
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Level setup
  useEffect(() => {
    const goal = currentLevelData.find(obj => obj.type === 'goal');
    levelWidth.current = isBossLevel ? GAME_WIDTH : (goal ? goal.x + 200 : GAME_WIDTH * 2);

    setHealthPacks(currentLevelData.filter(obj => obj.type === 'healthPack'));

    const initialEnemies: EnemyState[] = currentLevelData
      .filter(obj => obj.type === 'enemy' && obj.enemyType)
      .map(obj => {
        const def = ENEMY_DEFINITIONS[obj.enemyType!];
        const bossStats = obj.enemyType === 'boss_1' ? getBossStats(level) : null;
        const platformBeneath = currentLevelData
          .filter(p => p.type === 'platform')
          .find(p => Math.abs((obj.y + obj.height) - p.y) < 5 && obj.x < p.x + p.width && obj.x + obj.width > p.x );

        const health = bossStats ? bossStats.health : def.health;
        const baseAttackCooldown = bossStats ? bossStats.attackCooldown : (def.cooldown || 0);

        return {
          id: obj.id, x: obj.x, y: obj.y, width: def.width, height: def.height, type: obj.enemyType!,
          direction: 'left', 
          attackCooldown: baseAttackCooldown,
          baseAttackCooldown: baseAttackCooldown,
          aiState: 'patrolling',
          patrolBounds: platformBeneath ? { left: platformBeneath.x, right: platformBeneath.x + platformBeneath.width - obj.width } : undefined,
          vx: (obj.enemyType?.startsWith('patrol') || obj.enemyType === 'ninja') ? -(def.patrolSpeed || 0) : 0,
          initialX: obj.x, meleeAttackTimer: 0,
          health: health, maxHealth: health,
          aiTimer: 0,
        };
      });
    setEnemies(initialEnemies);

    const initialBlades: SwingingBladeState[] = currentLevelData
        .filter(obj => obj.type === 'swingingBlade')
        .map(obj => ({ ...obj, angle: obj.initialAngle || 0 } as SwingingBladeState));
    setSwingingBlades(initialBlades);

    setProjectiles([]);
    setShuriken(null);
    playerRef.current.shurikenOut = false;
    setIsBossDefeated(false);

  }, [level, currentLevelData, isBossLevel]);

  const handleTouchKeyPress = (key: string) => {
    setTouchPressedKeys(prev => new Set(prev).add(key));
  };
  const handleTouchKeyRelease = (key: string) => {
    setTouchPressedKeys(prev => {
        const newKeys = new Set(prev);
        newKeys.delete(key);
        return newKeys;
    });
  };

  useGameLoop((deltaTime) => {
    if (isPaused) return;

    const player = playerRef.current;
    
    const justPressed = (key: string) => pressedKeys.has(key.toLowerCase()) && !prevPressedKeys.current.has(key.toLowerCase());

    // --- PLAYER TIMERS ---
    if (player.attackCooldown > 0) player.attackCooldown -= deltaTime;
    if (player.invincibilityTimer > 0) player.invincibilityTimer -= deltaTime;
    if (player.dashCooldown > 0) player.dashCooldown -= deltaTime;
    if (player.teleportCooldown > 0) player.teleportCooldown -= deltaTime;
    if (player.shieldCooldown > 0) player.shieldCooldown -= deltaTime;
    if (player.teleportTimer > 0) player.teleportTimer -= deltaTime;
    if (player.dashTimer > 0) {
        player.dashTimer -= deltaTime;
        if (player.dashTimer <= 0) player.isDashing = false;
    }
    if (player.shieldTimer > 0) {
      player.shieldTimer -= deltaTime;
      if (player.shieldTimer <= 0) player.isShielding = false;
    }


    // --- PLAYER INPUT & MOVEMENT ---
     if (justPressed('w') && player.teleportCooldown <= 0) {
        if (!shuriken) {
            // Throw shuriken
            player.shurikenOut = true;
            setShuriken({
                id: 'player_shuriken',
                x: player.x + player.width / 2,
                y: player.y + player.height / 2,
                width: ENEMY.SHURIKEN_WIDTH,
                height: ENEMY.SHURIKEN_HEIGHT,
                vx: (player.direction === 'right' ? 1 : -1) * PLAYER.SHURIKEN_SPEED,
                vy: -2, // Slight upward arc
                rotation: 0
            });
            setTimeout(() => {
                player.shurikenOut = false;
                setShuriken(null);
            }, PLAYER.SHURIKEN_LIFESPAN);
        } else {
            // Teleport to shuriken
            player.x = shuriken.x - player.width / 2;
            player.y = shuriken.y - player.height / 2;
            player.vy = 0; // Reset velocity after teleport
            player.teleportCooldown = PLAYER.TELEPORT_COOLDOWN;
            player.teleportTimer = PLAYER.TELEPORT_EFFECT_DURATION;
            player.shurikenOut = false;
            setShuriken(null);
        }
    }

    if (justPressed('d') && player.dashCooldown <= 0 && !player.isDashing) {
        player.isDashing = true;
        player.dashTimer = PLAYER.DASH_DURATION;
        player.dashCooldown = PLAYER.DASH_COOLDOWN;
        player.invincibilityTimer = Math.max(player.invincibilityTimer, PLAYER.DASH_DURATION);
        player.vy = 0;
    }

    if (justPressed('s') && player.shieldCooldown <= 0) {
      player.isShielding = true;
      player.shieldTimer = PLAYER.SHIELD_DURATION;
      player.shieldCooldown = PLAYER.SHIELD_COOLDOWN;
    }

    if (justPressed('a')) {
        hitEnemiesDuringSwing.current.clear();
        if(player.attackCooldown <= 0) {
            player.isAttacking = true;
            player.attackCooldown = PLAYER.ATTACK_COOLDOWN;
            setTimeout(() => { player.isAttacking = false; }, PLAYER.ATTACK_DURATION);
        }
    }
    
    if (player.isDashing) {
        player.vx = (player.direction === 'right' ? 1 : -1) * PLAYER.DASH_SPEED;
    } else {
        player.vx = 0;
        if (pressedKeys.has('arrowleft')) {
          player.vx = -PLAYER.SPEED;
          player.direction = 'left';
        }
        if (pressedKeys.has('arrowright')) {
          player.vx = PLAYER.SPEED;
          player.direction = 'right';
        }
        
        if (justPressed('arrowup')) {
          if (player.isOnGround) {
            player.vy = -PLAYER.JUMP_FORCE;
            player.isOnGround = false;
            player.doubleJumpUsed = false;
          } else if (!player.doubleJumpUsed) {
             player.vy = -PLAYER.JUMP_FORCE * 0.9;
             player.doubleJumpUsed = true;
          }
        }
    }
    
    // Gravity (unless dashing)
    if (!player.isDashing) {
        player.vy += PHYSICS.GRAVITY;
        if (player.vy > PHYSICS.MAX_FALL_SPEED) player.vy = PHYSICS.MAX_FALL_SPEED;
    }

    const nextY = player.y + player.vy;
    let nextX = player.x + player.vx;
    player.isOnGround = false;

    // --- PLAYER COLLISION DETECTION & RESOLUTION ---
    const platforms = levelObjects.filter(obj => obj.type === 'platform');
    const verticalPlayerBounds = { ...player, y: nextY, x: player.x + 2, width: player.width - 4 };
    let verticalCollision = false;
    for (const platform of platforms) {
      if (isColliding(verticalPlayerBounds, platform)) {
        if (player.vy >= 0) {
          player.y = platform.y - player.height;
          player.isOnGround = true;
          player.doubleJumpUsed = false;
          player.vy = 0;
        } else {
          player.y = platform.y + platform.height;
          player.vy = 0;
        }
        verticalCollision = true;
        break;
      }
    }
    if (!verticalCollision) player.y = nextY;

    const horizontalPlayerBounds = { ...player, x: nextX, y: player.y + 2, height: player.height - 4 };
    let horizontalCollision = false;
    for (const platform of platforms) {
        if (isColliding(horizontalPlayerBounds, platform)) {
            if (player.vx > 0) { nextX = platform.x - player.width; } 
            else if (player.vx < 0) { nextX = platform.x + platform.width; }
            player.vx = 0;
            horizontalCollision = true;
            break;
        }
    }
    player.x = nextX;


    if (player.x < 0) player.x = 0;
    if (player.y > GAME_HEIGHT + 200) onGameOver();

    const handleDamage = () => {
        if (player.isShielding) return;
        if (player.invincibilityTimer <= 0) {
            player.health -= 1;
            player.invincibilityTimer = PLAYER.INVINCIBILITY_DURATION;
            if (player.health <= 0) onGameOver();
        }
    }

    levelObjects.filter(obj => obj.type === 'spike').forEach(spike => {
        if (isColliding(player, spike)) handleDamage();
    });

    const collectedPackIds = new Set<string>();
    for (const pack of healthPacks) {
        if (isColliding(player, pack)) {
            if (player.health < PLAYER.INITIAL_HEALTH) {
                player.health += 1;
                collectedPackIds.add(pack.id);
            }
        }
    }
    if (collectedPackIds.size > 0) {
        setHealthPacks(prev => prev.filter(p => !collectedPackIds.has(p.id)));
    }


    const attackBox: GameObject = {
      id: 'attack',
      width: PLAYER.ATTACK_WIDTH,
      height: PLAYER.ATTACK_HEIGHT,
      x: player.direction === 'right' ? player.x + player.width : player.x - PLAYER.ATTACK_WIDTH,
      y: player.y,
    };
    
    // --- AI, PROJECTILES, AND COMBAT ---
    const newProjectiles: ProjectileState[] = [];
    const spawnProjectile = (pData: Omit<ProjectileState, 'id'>) => {
        newProjectiles.push({ id: `proj_${Date.now()}_${Math.random()}`, ...pData });
    };
    
    const spawnEnemy: EnemySpawnFunction = (enemyData) => {
        enemySpawnQueue.current.push(enemyData);
    };

    const updatedEnemies = enemies.map(enemy => {
        const updateFunction = ENEMY_AI_UPDATES[enemy.type];
        return updateFunction ? updateFunction(enemy, player, deltaTime, spawnProjectile, spawnEnemy) : enemy;
    });
    
    if (enemySpawnQueue.current.length > 0) {
        const newEnemies = enemySpawnQueue.current.map(data => {
            const def = ENEMY_DEFINITIONS[data.type];
            return {
                ...data,
                id: `e_${Date.now()}_${Math.random()}`,
                health: def.health,
                maxHealth: def.health,
            };
        });
        updatedEnemies.push(...newEnemies);
        enemySpawnQueue.current = [];
    }

    let remainingEnemies = [...updatedEnemies];
    if (player.isAttacking) {
        remainingEnemies = remainingEnemies.map(enemy => {
             if (isColliding(attackBox, enemy) && !hitEnemiesDuringSwing.current.has(enemy.id)) {
                hitEnemiesDuringSwing.current.add(enemy.id);
                return { ...enemy, health: enemy.health - PLAYER.ATTACK_DAMAGE };
            }
            return enemy;
        });
    }

    remainingEnemies.forEach(enemy => {
        if (isColliding(player, enemy)) {
            handleDamage();
        }
    });
    
    // --- Update player shuriken & shuriken damage
    if (shuriken) {
        const nextShuriken = { ...shuriken };
        nextShuriken.x += nextShuriken.vx;
        nextShuriken.vy += PHYSICS.GRAVITY * 0.5; // Less gravity
        nextShuriken.y += nextShuriken.vy;
        nextShuriken.rotation += 30;
        
        let shurikenVanished = false;
        for (const platform of platforms) {
            if (isColliding(nextShuriken, platform)) {
                shurikenVanished = true;
                break;
            }
        }
        
        if(!shurikenVanished) {
            for (const enemy of remainingEnemies) {
                if (isColliding(nextShuriken, enemy)) {
                    enemy.health -= PLAYER.SHURIKEN_DAMAGE;
                    shurikenVanished = true;
                    break;
                }
            }
        }
        
        if (shurikenVanished) {
            player.shurikenOut = false;
            setShuriken(null);
        } else {
            setShuriken(nextShuriken);
        }
    }

    remainingEnemies = remainingEnemies.filter(e => e.health > 0);
    
    // Check for boss defeat
    if (isBossLevel && !isBossDefeated && enemies.some(e => e.type === 'boss_1') && remainingEnemies.every(e => e.type !== 'boss_1')) {
        setIsBossDefeated(true);
        // Spawn goal
        setLevelObjects(prev => [...prev, { id: 'goal', type: 'goal', x: GAME_WIDTH / 2 - 30, y: GAME_HEIGHT - 120, width: 60, height: 60 }]);
    }
    setEnemies(remainingEnemies);

    let stillActiveProjectiles = [...projectiles, ...newProjectiles]
        .map(p => ({...p, x: p.x + p.vx}))
        .filter(p => p.x > -50 && p.x < levelWidth.current + 50);
        
    stillActiveProjectiles = stillActiveProjectiles.filter(p => {
        if(isColliding(player, p)) {
            handleDamage();
            return false;
        }
        return true;
    });
    setProjectiles(stillActiveProjectiles);
    
    
    const time = Date.now();
    const updatedBlades = swingingBlades.map(blade => {
        const newAngle = (Math.PI / 3) * Math.sin(time / (blade.period! * 500) + blade.initialAngle!);
        const bladeCenterX = blade.pivotX! + blade.chainLength! * Math.sin(newAngle);
        const bladeCenterY = blade.pivotY! + blade.chainLength! * Math.cos(newAngle);
        const updatedBlade = { ...blade, angle: newAngle, x: bladeCenterX, y: bladeCenterY };
        const bladeHitbox = { ...updatedBlade, x: updatedBlade.x - blade.width/2, y: updatedBlade.y - blade.height/2 };

        if (isColliding(player, bladeHitbox)) handleDamage();
        return updatedBlade;
    });
    setSwingingBlades(updatedBlades);

    levelObjects.filter(obj => obj.type === 'goal').forEach(goal => {
        if (isColliding(player, goal)) onLevelComplete();
    });
    
    // --- CAMERA UPDATE ---
    const camera = cameraRef.current;
    const targetCamX = player.x - GAME_WIDTH / 2;
    camera.x += (targetCamX - camera.x) * 0.1;
    camera.y = 0;
    camera.x = Math.max(0, Math.min(camera.x, levelWidth.current - GAME_WIDTH));

    prevPressedKeys.current = new Set([...pressedKeys].map(k => k.toLowerCase()));
    setFrame(f => f + 1);
  });

  const renderMapObject = (obj: LevelObject) => {
    switch (obj.type) {
      case 'platform': return <Platform key={obj.id} platform={obj} />;
      case 'spike': return <Spike key={obj.id} spike={obj} />;
      case 'goal': return <Goal key={obj.id} goal={obj} />;
      default: return null;
    }
  };

  const camera = cameraRef.current;
  const biome = getBiomeForLevel(level);

  return (
    <div
      ref={gameContainerRef}
      className={`relative overflow-hidden border-4 border-gray-700 w-full h-full ${biome}`}
      style={{
          // Use max-height with aspect ratio for better responsive behavior
          maxHeight: '100vh',
          aspectRatio: `${GAME_WIDTH} / ${GAME_HEIGHT}`
      }}
    >
      {/* Non-scaled UI overlays */}
      {isPaused && <PauseMenu onResume={() => setIsPaused(false)} onRestart={onRestartCurrentLevel} onGoToMainMenu={onGoToMainMenu} />}
      {!isDesktop && <MobileControls onKeyPress={handleTouchKeyPress} onKeyRelease={handleTouchKeyRelease} />}
      
      {/* Scaled game container */}
      <div
        style={{
          width: GAME_WIDTH,
          height: GAME_HEIGHT,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          visibility: scale === null ? 'hidden' : 'visible',
        }}
      >
        {/* Scaled UI */}
        <div className="absolute top-4 left-4 flex items-center gap-2 p-2 bg-black/40 ios-backdrop-blur rounded-xl border border-white/10 z-10">
          <HealthBar health={playerRef.current.health} maxHealth={PLAYER.INITIAL_HEALTH} />
          <div className="w-px h-8 bg-white/20 mx-1"></div>
          <CooldownIndicator cooldown={playerRef.current.dashCooldown} maxCooldown={PLAYER.DASH_COOLDOWN} label="D" />
          <CooldownIndicator cooldown={playerRef.current.shieldCooldown} maxCooldown={PLAYER.SHIELD_COOLDOWN} label="S" />
          <CooldownIndicator cooldown={playerRef.current.teleportCooldown} maxCooldown={PLAYER.TELEPORT_COOLDOWN} label="W" />
        </div>

        <div className="absolute top-2 left-1/2 -translate-x-1/2 p-2 px-4 bg-black/40 ios-backdrop-blur rounded-xl border border-white/10 z-10 text-lg font-semibold text-white">
          Level: {level}
        </div>

        <button
          onClick={() => setIsPaused(true)}
          className="absolute top-4 right-4 w-10 h-10 bg-black/40 ios-backdrop-blur rounded-xl border border-white/10 z-10 text-white font-bold text-lg flex items-center justify-center active:bg-black/60"
          aria-label="Pause Game"
        >
          ||
        </button>

        {/* Game World */}
        <div
          className="absolute top-0 left-0"
          style={{
            transform: `translate(${-camera.x}px, ${-camera.y}px)`,
            willChange: 'transform'
          }}
        >
          <Player player={playerRef.current} />
          {shuriken && <Shuriken shuriken={shuriken} />}
          {levelObjects.map(renderMapObject)}
          {enemies.map(enemy => <Enemy key={enemy.id} enemy={enemy} />)}
          {projectiles.map(p => <Projectile key={p.id} projectile={p} />)}
          {swingingBlades.map(b => <SwingingBlade key={b.id} blade={b} />)}
          {healthPacks.map(pack => <HealthPack key={pack.id} pack={pack} />)}
        </div>
      </div>
    </div>
  );
};

export default Game;
