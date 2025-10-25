import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useGameLoop } from '../hooks/useGameLoop';
import { useKeyboardInput } from '../hooks/useKeyboardInput';
import type { PlayerState, LevelObject, GameObject, EnemyState, ProjectileState, EnemyType, SwingingBladeState, SpinningBladeProjectileState } from '../types';
import { GAME_WIDTH, GAME_HEIGHT, PLAYER, PHYSICS, ALL_LEVELS, ENEMY, ENEMY_DEFINITIONS } from '../constants';
import Player from './Player';
import Platform from './Platform';
import Spike from './Spike';
import Enemy from './Enemy';
import Goal from './Goal';
import Projectile from './Projectile';


// --- NEW IN-FILE COMPONENTS ---

const SpinningBlade: React.FC<{blade: SpinningBladeProjectileState}> = ({ blade }) => {
    return (
        <div 
            style={{
                left: blade.x,
                top: blade.y,
                width: blade.width,
                height: blade.height,
            }}
            className="absolute bg-red-500 rounded-full spinning-blade flex items-center justify-center shadow-lg shadow-red-500/50"
        >
            <div className="w-1 h-full bg-red-800 absolute"></div>
            <div className="w-full h-1 bg-red-800 absolute"></div>
        </div>
    )
}

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
        <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-30">
            <h2 className="text-5xl font-bold text-red-600 blood-text-shadow mb-8">Paused</h2>
            <div className="flex flex-col gap-4">
                <button onClick={onResume} className="px-8 py-3 bg-red-800 hover:bg-red-700 border-2 border-red-600 text-white font-bold text-xl transition-all duration-300 rounded-sm">Resume</button>
                <button onClick={onRestart} className="px-8 py-3 bg-gray-700 hover:bg-gray-600 border-2 border-gray-500 text-white font-bold text-xl transition-all duration-300 rounded-sm">Restart Level</button>
                <button onClick={onGoToMainMenu} className="px-8 py-3 bg-gray-700 hover:bg-gray-600 border-2 border-gray-500 text-white font-bold text-xl transition-all duration-300 rounded-sm">Main Menu</button>
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
            className={`w-16 h-16 bg-gray-500/40 rounded-full flex items-center justify-center text-white text-2xl font-bold active:bg-gray-500/70 select-none ${className}`}
            aria-label={`Control for ${actionKey}`}
        >
            {label}
        </button>
    );
};

const MobileControls: React.FC<MobileControlsProps> = ({ onKeyPress, onKeyRelease }) => {
    return (
        <div className="absolute inset-0 z-20 md:hidden pointer-events-none">
            {/* Movement Controls */}
            <div className="absolute bottom-4 left-4 flex items-end gap-2 pointer-events-auto">
                <MobileControlButton label="←" actionKey="ArrowLeft" onKeyPress={onKeyPress} onKeyRelease={onKeyRelease} />
                <div className="flex flex-col gap-2">
                    <MobileControlButton label="↑" actionKey="ArrowUp" onKeyPress={onKeyPress} onKeyRelease={onKeyRelease} />
                    <MobileControlButton label="↷" actionKey=" " onKeyPress={onKeyPress} onKeyRelease={onKeyRelease} className="text-xl" />
                </div>
                <MobileControlButton label="→" actionKey="ArrowRight" onKeyPress={onKeyPress} onKeyRelease={onKeyRelease} />
            </div>

            {/* Action Controls */}
            <div className="absolute bottom-4 right-4 flex items-end gap-2 pointer-events-auto">
                 <MobileControlButton label="S" actionKey="s" onKeyPress={onKeyPress} onKeyRelease={onKeyRelease} />
                 <MobileControlButton label="W" actionKey="w" onKeyPress={onKeyPress} onKeyRelease={onKeyRelease} />
                 <MobileControlButton label="D" actionKey="d" onKeyPress={onKeyPress} onKeyRelease={onKeyRelease} />
                 <MobileControlButton label="A" actionKey="a" onKeyPress={onKeyPress} onKeyRelease={onKeyRelease} className="w-20 h-20"/>
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

type AiUpdateFunction = (
  enemy: EnemyState,
  player: PlayerState,
  deltaTime: number,
  spawnProjectile: (projectile: Omit<ProjectileState, 'id'>) => void
) => EnemyState;

const updatePatrol: AiUpdateFunction = (enemy, _player, _deltaTime, _spawnProjectile) => {
    const updatedEnemy = { ...enemy };
    const def = ENEMY_DEFINITIONS.patrol;

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
    const def = ENEMY_DEFINITIONS.shooter;

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

const ENEMY_AI_UPDATES: Record<EnemyType, AiUpdateFunction> = {
    patrol: updatePatrol,
    shooter: updateShooter,
    charger: updateCharger,
    ninja: updateNinja,
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
      <div
        key={i}
        className={`w-6 h-6 rounded-full border-2 border-red-500 transition-colors duration-200 ${
          i < health ? 'bg-red-600' : 'bg-transparent'
        }`}
      ></div>
    );
  }

  return <div className="flex gap-2">{healthIcons}</div>;
};

const CooldownIndicator: React.FC<{ cooldown: number; maxCooldown: number, label: string }> = ({ cooldown, maxCooldown, label }) => {
    const ready = cooldown <= 0;
    const fillPercentage = ready ? 100 : Math.max(0, 100 - (cooldown / maxCooldown) * 100);

    return (
        <div className={`relative w-8 h-8 rounded-full border-2 flex items-center justify-center overflow-hidden transition-all duration-200 ${ready ? 'border-red-500 bg-red-900/50' : 'border-gray-600 bg-black/50'}`}>
            <div
                className="absolute bottom-0 left-0 w-full bg-red-700/70"
                style={{ height: `${fillPercentage}%`, transition: fillPercentage > 10 ? 'height 0.1s linear' : 'none' }}
            />
            <span className={`font-bold z-10 transition-colors ${ready ? 'text-white' : 'text-gray-400'}`}>
                {label}
            </span>
        </div>
    );
};


// --- MAIN GAME COMPONENT ---

const Game: React.FC<GameProps> = ({ level, onGameOver, onLevelComplete, onGoToMainMenu, onRestartCurrentLevel }) => {
  const currentLevelData = ALL_LEVELS[level - 1] || ALL_LEVELS[0];
  const [isPaused, setIsPaused] = useState(false);
  
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
    spinningBladeCooldown: 0,
    isShielding: false,
    shieldTimer: 0,
    shieldCooldown: 0,
  });

  const [enemies, setEnemies] = useState<EnemyState[]>([]);
  const [projectiles, setProjectiles] = useState<ProjectileState[]>([]);
  const [spinningBlades, setSpinningBlades] = useState<SpinningBladeProjectileState[]>([]);
  const [swingingBlades, setSwingingBlades] = useState<SwingingBladeState[]>([]);
  const screenShakeRef = useRef(0);
  const isScreenShakeEnabled = useRef(false);
  
  const keyboardPressedKeys = useKeyboardInput();
  const [touchPressedKeys, setTouchPressedKeys] = useState<Set<string>>(new Set());
  const pressedKeys = useMemo(() => new Set([...keyboardPressedKeys, ...touchPressedKeys]), [keyboardPressedKeys, touchPressedKeys]);
  const prevPressedKeys = useRef<Set<string>>(new Set());
  
  const cameraRef = useRef({ x: 0, y: 0 });
  const levelWidth = useRef(GAME_WIDTH);


  const [levelObjects] = useState<LevelObject[]>(currentLevelData);
  const [frame, setFrame] = useState(0); // Used to force re-render

  useEffect(() => {
    isScreenShakeEnabled.current = localStorage.getItem('screenShakeEnabled') === 'true';

    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key.toLowerCase() === 'p') {
            setIsPaused(prev => !prev);
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const goal = currentLevelData.find(obj => obj.type === 'goal');
    levelWidth.current = goal ? goal.x + 200 : GAME_WIDTH;

    const initialEnemies: EnemyState[] = currentLevelData
      .filter(obj => obj.type === 'enemy' && obj.enemyType)
      .map(obj => {
        const def = ENEMY_DEFINITIONS[obj.enemyType!];
        const platformBeneath = currentLevelData
          .filter(p => p.type === 'platform')
          .find(p => 
            Math.abs((obj.y + obj.height) - p.y) < 5 &&
            obj.x < p.x + p.width &&
            obj.x + obj.width > p.x
          );

        return {
          id: obj.id,
          x: obj.x,
          y: obj.y,
          width: def.width,
          height: def.height,
          type: obj.enemyType!,
          direction: 'left',
          attackCooldown: 0,
          aiState: 'patrolling',
          patrolBounds: platformBeneath ? { left: platformBeneath.x, right: platformBeneath.x + platformBeneath.width - obj.width } : undefined,
          vx: (obj.enemyType === 'patrol' || obj.enemyType === 'ninja') ? -(def.patrolSpeed || 0) : 0,
          initialX: obj.x,
          meleeAttackTimer: 0,
        };
      });
    setEnemies(initialEnemies);

    const initialBlades: SwingingBladeState[] = currentLevelData
        .filter(obj => obj.type === 'swingingBlade')
        .map(obj => ({ ...obj, angle: obj.initialAngle || 0 } as SwingingBladeState));
    setSwingingBlades(initialBlades);

    setProjectiles([]);
    setSpinningBlades([]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level]);

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
    
    const justPressed = (key: string) => pressedKeys.has(key) && !prevPressedKeys.current.has(key);

    // --- SCREEN SHAKE ---
    if (screenShakeRef.current > 0) {
        screenShakeRef.current -= 1.5; // Decay factor
        if (screenShakeRef.current < 0) screenShakeRef.current = 0;
    }

    const triggerShake = (intensity: number) => {
        if (isScreenShakeEnabled.current) {
            screenShakeRef.current = intensity;
        }
    }

    // --- PLAYER TIMERS ---
    if (player.attackCooldown > 0) player.attackCooldown -= deltaTime;
    if (player.invincibilityTimer > 0) player.invincibilityTimer -= deltaTime;
    if (player.dashCooldown > 0) player.dashCooldown -= deltaTime;
    if (player.teleportCooldown > 0) player.teleportCooldown -= deltaTime;
    if (player.spinningBladeCooldown > 0) player.spinningBladeCooldown -= deltaTime;
    if (player.shieldCooldown > 0) player.shieldCooldown -= deltaTime;

    if (player.dashTimer > 0) {
        player.dashTimer -= deltaTime;
        if (player.dashTimer <= 0) {
            player.isDashing = false;
        }
    }
    if (player.shieldTimer > 0) {
        player.shieldTimer -= deltaTime;
        if (player.shieldTimer <= 0) {
            player.isShielding = false;
        }
    }

    // --- PLAYER INPUT & MOVEMENT ---
    if (justPressed('d') && player.dashCooldown <= 0 && !player.isDashing) {
        player.isDashing = true;
        player.dashTimer = PLAYER.DASH_DURATION;
        player.dashCooldown = PLAYER.DASH_COOLDOWN;
        player.invincibilityTimer = Math.max(player.invincibilityTimer, PLAYER.DASH_DURATION);
        player.vy = 0;
        triggerShake(5); // Small shake on dash
    }

    if (justPressed('a') && player.attackCooldown <= 0) {
        player.isAttacking = true;
        player.attackCooldown = PLAYER.ATTACK_COOLDOWN;
        setTimeout(() => { player.isAttacking = false; }, PLAYER.ATTACK_DURATION);
    }
    
    if (justPressed('w') && player.spinningBladeCooldown <= 0) {
        player.spinningBladeCooldown = PLAYER.SPINNING_BLADE_COOLDOWN;
        setSpinningBlades(prev => [...prev, {
            id: `sbp_${Date.now()}`,
            x: player.x + player.width / 2 - PLAYER.SPINNING_BLADE_WIDTH / 2,
            y: player.y + player.height / 2 - PLAYER.SPINNING_BLADE_HEIGHT / 2,
            width: PLAYER.SPINNING_BLADE_WIDTH,
            height: PLAYER.SPINNING_BLADE_HEIGHT,
            vx: player.direction === 'right' ? PLAYER.SPINNING_BLADE_SPEED : -PLAYER.SPINNING_BLADE_SPEED,
        }]);
    }

    if (justPressed('s') && player.shieldCooldown <= 0) {
        player.isShielding = true;
        player.shieldTimer = PLAYER.SHIELD_DURATION;
        player.shieldCooldown = PLAYER.SHIELD_COOLDOWN;
    }
    
    if (player.isDashing) {
        player.vx = (player.direction === 'right' ? 1 : -1) * PLAYER.DASH_SPEED;
    } else {
        player.vx = 0;
        if (pressedKeys.has('ArrowLeft')) {
          player.vx = -PLAYER.SPEED;
          player.direction = 'left';
        }
        if (pressedKeys.has('ArrowRight')) {
          player.vx = PLAYER.SPEED;
          player.direction = 'right';
        }
        
        if (justPressed('ArrowUp')) {
          if (player.isOnGround) {
            player.vy = -PLAYER.JUMP_FORCE;
            player.isOnGround = false;
            player.doubleJumpUsed = false;
          }
        }
        
        if (justPressed(' ')) { // Space for double jump
             if (!player.isOnGround && !player.doubleJumpUsed) {
                player.vy = -PLAYER.JUMP_FORCE * 0.9; // slightly less force for double jump
                player.doubleJumpUsed = true;
            }
        }

        player.vy += PHYSICS.GRAVITY;
        if (player.vy > PHYSICS.MAX_FALL_SPEED) player.vy = PHYSICS.MAX_FALL_SPEED;
    }

    const nextX = player.x + player.vx;
    const nextY = player.y + player.vy;
    player.isOnGround = false;

    // --- PLAYER COLLISION DETECTION & RESOLUTION ---
    const platforms = levelObjects.filter(obj => obj.type === 'platform');
    const verticalPlayerBounds = { ...player, y: nextY, x: player.x + 2, width: player.width - 4 };
    let verticalCollision = false;
    for (const platform of platforms) {
      if (isColliding(verticalPlayerBounds, platform)) {
        if (player.vy > 0) {
          player.y = platform.y - player.height;
          player.isOnGround = true;
          player.doubleJumpUsed = false;
        } else {
          player.y = platform.y + platform.height;
        }
        player.vy = 0;
        verticalCollision = true;
        break;
      }
    }
    if (!verticalCollision) player.y = nextY;

    const horizontalPlayerBounds = { ...player, x: nextX, y: player.y + 2, height: player.height - 4 };
    let horizontalCollision = false;
    for (const platform of platforms) {
        if (isColliding(horizontalPlayerBounds, platform)) {
            if (player.vx > 0) { player.x = platform.x - player.width; } 
            else { player.x = platform.x + platform.width; }
            player.vx = 0;
            horizontalCollision = true;
            break;
        }
    }
    if (!horizontalCollision) player.x = nextX;


    if (player.x < 0) player.x = 0;
    if (player.y > GAME_HEIGHT + 200) onGameOver();

    const handleDamage = () => {
        if (player.invincibilityTimer <= 0 && !player.isShielding) {
            player.health -= 1;
            player.invincibilityTimer = PLAYER.INVINCIBILITY_DURATION;
            triggerShake(15);
            if (player.health <= 0) {
                onGameOver();
            }
        }
    }

    levelObjects.filter(obj => obj.type === 'spike').forEach(spike => {
        if (isColliding(player, spike)) handleDamage();
    });

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

    const updatedEnemies = enemies.map(enemy => {
        const updateFunction = ENEMY_AI_UPDATES[enemy.type];
        return updateFunction ? updateFunction(enemy, player, deltaTime, spawnProjectile) : enemy;
    });

    let remainingEnemies = [...updatedEnemies];
    remainingEnemies.forEach(enemy => {
        if(player.isAttacking && isColliding(attackBox, enemy)) {
            remainingEnemies = remainingEnemies.filter(e => e.id !== enemy.id);
            triggerShake(8);
        } else if (isColliding(player, enemy)) {
            handleDamage();
        }
    });
    
    let remainingSpinningBlades = spinningBlades.map(blade => ({...blade, x: blade.x + blade.vx})).filter(blade => blade.x > 0 && blade.x < levelWidth.current);
    remainingSpinningBlades = remainingSpinningBlades.filter(blade => {
        const enemyHit = remainingEnemies.find(enemy => isColliding(blade, enemy));
        if (enemyHit) {
            remainingEnemies = remainingEnemies.filter(e => e.id !== enemyHit.id);
            triggerShake(8);
            return false; // Blade is destroyed on hit
        }
        return true;
    });
    setSpinningBlades(remainingSpinningBlades);
    setEnemies(remainingEnemies);

    let stillActiveProjectiles = [...projectiles, ...newProjectiles]
        .map(p => ({...p, x: p.x + p.vx}))
        .filter(p => p.x > 0 && p.x < levelWidth.current);
        
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
    camera.y = 0; // Remove vertical camera movement for better UX

    // Clamp camera
    camera.x = Math.max(0, Math.min(camera.x, levelWidth.current - GAME_WIDTH));

    prevPressedKeys.current = pressedKeys;
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
  const shake = screenShakeRef.current;
  const shakeX = shake > 0 ? (Math.random() - 0.5) * shake : 0;
  const shakeY = shake > 0 ? (Math.random() - 0.5) * shake : 0;

  return (
    <div
      className="relative bg-gray-900 overflow-hidden border-4 border-gray-700 w-full h-full"
      style={{ maxWidth: GAME_WIDTH, maxHeight: GAME_HEIGHT, aspectRatio: `${GAME_WIDTH}/${GAME_HEIGHT}` }}
    >
      {isPaused && <PauseMenu onResume={() => setIsPaused(false)} onRestart={onRestartCurrentLevel} onGoToMainMenu={onGoToMainMenu} />}
      <MobileControls onKeyPress={handleTouchKeyPress} onKeyRelease={handleTouchKeyRelease} />

      <div className="absolute top-4 left-4 flex items-center gap-4 p-2 bg-black/50 rounded-md z-10">
          <HealthBar health={playerRef.current.health} maxHealth={PLAYER.INITIAL_HEALTH} />
          <CooldownIndicator cooldown={playerRef.current.dashCooldown} maxCooldown={PLAYER.DASH_COOLDOWN} label="D" />
          <CooldownIndicator cooldown={playerRef.current.spinningBladeCooldown} maxCooldown={PLAYER.SPINNING_BLADE_COOLDOWN} label="W" />
          <CooldownIndicator cooldown={playerRef.current.shieldCooldown} maxCooldown={PLAYER.SHIELD_COOLDOWN} label="S" />
      </div>

       <div className="absolute top-2 left-1/2 -translate-x-1/2 p-2 bg-black/50 rounded-md z-10 text-xl font-bold text-white blood-text-shadow">
          Level: {level}
      </div>

      <button
        onClick={() => setIsPaused(true)}
        className="absolute top-4 right-4 w-10 h-10 bg-black/50 rounded-md z-10 text-white font-bold text-xl flex items-center justify-center active:bg-black/80"
        aria-label="Pause Game"
      >
        ||
      </button>


      <div 
        className="absolute top-0 left-0"
        style={{ 
            transform: `translate(${-camera.x + shakeX}px, ${-camera.y + shakeY}px)`,
            willChange: 'transform'
        }}
      >
        <Player player={playerRef.current} />
        {levelObjects.map(renderMapObject)}
        {enemies.map(enemy => <Enemy key={enemy.id} enemy={enemy} />)}
        {projectiles.map(p => <Projectile key={p.id} projectile={p} />)}
        {swingingBlades.map(b => <SwingingBlade key={b.id} blade={b} />)}
        {spinningBlades.map(b => <SpinningBlade key={b.id} blade={b} />)}
      </div>
    </div>
  );
};

export default Game;