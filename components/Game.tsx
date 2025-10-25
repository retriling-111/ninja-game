import React, { useRef, useState, useEffect } from 'react';
import { useGameLoop } from '../hooks/useGameLoop';
import { useKeyboardInput } from '../hooks/useKeyboardInput';
import type { PlayerState, LevelObject, GameObject, EnemyState, ProjectileState, EnemyType, SwingingBladeState } from '../types';
import { GAME_WIDTH, GAME_HEIGHT, PLAYER, PHYSICS, ALL_LEVELS, ENEMY, ENEMY_DEFINITIONS } from '../constants';
import Player from './Player';
import Platform from './Platform';
import Spike from './Spike';
import Enemy from './Enemy';
import Goal from './Goal';
import Projectile from './Projectile';


// --- NEW IN-FILE COMPONENTS ---

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
        <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-20">
            <h2 className="text-5xl font-bold text-red-600 blood-text-shadow mb-8">Paused</h2>
            <div className="flex flex-col gap-4">
                <button onClick={onResume} className="px-8 py-3 bg-red-800 hover:bg-red-700 border-2 border-red-600 text-white font-bold text-xl transition-all duration-300 rounded-sm">Resume</button>
                <button onClick={onRestart} className="px-8 py-3 bg-gray-700 hover:bg-gray-600 border-2 border-gray-500 text-white font-bold text-xl transition-all duration-300 rounded-sm">Restart Level</button>
                <button onClick={onGoToMainMenu} className="px-8 py-3 bg-gray-700 hover:bg-gray-600 border-2 border-gray-500 text-white font-bold text-xl transition-all duration-300 rounded-sm">Main Menu</button>
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
        if (isColliding(updatedEnemy, player) || distanceToPlayer > def.range + 50 || updatedEnemy.x < 0 || updatedEnemy.x > GAME_WIDTH) {
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

const DashIndicator: React.FC<{ cooldown: number; maxCooldown: number }> = ({ cooldown, maxCooldown }) => {
    const ready = cooldown <= 0;
    const fillPercentage = ready ? 100 : Math.max(0, 100 - (cooldown / maxCooldown) * 100);

    return (
        <div className={`relative w-8 h-8 rounded-full border-2 flex items-center justify-center overflow-hidden transition-all duration-200 ${ready ? 'border-red-500 bg-red-900/50' : 'border-gray-600 bg-black/50'}`}>
            <div
                className="absolute bottom-0 left-0 w-full bg-red-700/70"
                style={{ height: `${fillPercentage}%`, transition: fillPercentage > 10 ? 'height 0.1s linear' : 'none' }}
            />
            <span className={`font-bold z-10 transition-colors ${ready ? 'text-white' : 'text-gray-400'}`}>
                D
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
    shadowCloneCooldown: 0,
  });

  const [enemies, setEnemies] = useState<EnemyState[]>([]);
  const [projectiles, setProjectiles] = useState<ProjectileState[]>([]);
  const [swingingBlades, setSwingingBlades] = useState<SwingingBladeState[]>([]);
  const screenShakeRef = useRef(0);
  const prevPressedKeys = useRef<Set<string>>(new Set());


  const [levelObjects] = useState<LevelObject[]>(currentLevelData);
  const pressedKeys = useKeyboardInput();
  const [frame, setFrame] = useState(0); // Used to force re-render

  useEffect(() => {
    // This effect should only run once to add the event listener for pausing.
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key.toLowerCase() === 'p') {
            setIsPaused(prev => !prev);
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level]);

  useGameLoop((deltaTime) => {
    if (isPaused) return;

    const player = playerRef.current;
    
    const justPressed = (key: string) => pressedKeys.has(key) && !prevPressedKeys.current.has(key);

    // --- SCREEN SHAKE ---
    if (screenShakeRef.current > 0) {
        screenShakeRef.current -= 1.5; // Decay factor
        if (screenShakeRef.current < 0) screenShakeRef.current = 0;
    }

    // --- PLAYER TIMERS ---
    if (player.attackCooldown > 0) player.attackCooldown -= deltaTime;
    if (player.invincibilityTimer > 0) player.invincibilityTimer -= deltaTime;
    if (player.dashCooldown > 0) player.dashCooldown -= deltaTime;
    if (player.teleportCooldown > 0) player.teleportCooldown -= deltaTime;
    if (player.shadowCloneCooldown > 0) player.shadowCloneCooldown -= deltaTime;

    if (player.dashTimer > 0) {
        player.dashTimer -= deltaTime;
        if (player.dashTimer <= 0) {
            player.isDashing = false;
        }
    }

    // --- PLAYER INPUT & MOVEMENT ---
    if (justPressed('d') && player.dashCooldown <= 0 && !player.isDashing) {
        player.isDashing = true;
        player.dashTimer = PLAYER.DASH_DURATION;
        player.dashCooldown = PLAYER.DASH_COOLDOWN;
        player.invincibilityTimer = Math.max(player.invincibilityTimer, PLAYER.DASH_DURATION);
        player.vy = 0;
        screenShakeRef.current = 5; // Small shake on dash
    }

    if (justPressed('a') && player.attackCooldown <= 0) {
        player.isAttacking = true;
        player.attackCooldown = PLAYER.ATTACK_COOLDOWN;
        setTimeout(() => { player.isAttacking = false; }, PLAYER.ATTACK_DURATION);
    }
    
    if (justPressed('w') && player.teleportCooldown <= 0) {
        player.teleportCooldown = PLAYER.TELEPORT_COOLDOWN;
        console.log("Teleport!"); // Placeholder for teleport logic
    }
    
    if (justPressed('s') && player.shadowCloneCooldown <= 0) {
        player.shadowCloneCooldown = PLAYER.SHADOW_CLONE_COOLDOWN;
        console.log("Shadow Clone!"); // Placeholder for shadow clone logic
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


        // Apply gravity
        player.vy += PHYSICS.GRAVITY;
        if (player.vy > PHYSICS.MAX_FALL_SPEED) {
            player.vy = PHYSICS.MAX_FALL_SPEED;
        }
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


    // Boundary checks
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > GAME_WIDTH) player.x = GAME_WIDTH - player.width;
    if (player.y > GAME_HEIGHT) onGameOver();

    const handleDamage = () => {
        if (player.invincibilityTimer <= 0) {
            player.health -= 1;
            player.invincibilityTimer = PLAYER.INVINCIBILITY_DURATION;
            screenShakeRef.current = 15; // Strong shake on taking damage
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
        newProjectiles.push({
            id: `proj_${Date.now()}_${Math.random()}`,
            ...pData,
        });
    };

    const updatedEnemies = enemies.map(enemy => {
        const updateFunction = ENEMY_AI_UPDATES[enemy.type];
        if (updateFunction) {
            return updateFunction(enemy, player, deltaTime, spawnProjectile);
        }
        return enemy;
    });

    let remainingEnemies = [...updatedEnemies];
    updatedEnemies.forEach(enemy => {
        if(player.isAttacking && isColliding(attackBox, enemy)) {
            remainingEnemies = remainingEnemies.filter(e => e.id !== enemy.id);
            screenShakeRef.current = 8; // Medium shake on enemy defeat
        } else if (isColliding(player, enemy)) {
            handleDamage();
        }
    });
    setEnemies(remainingEnemies);

    let stillActiveProjectiles: ProjectileState[] = [];
    for (const p of [...projectiles, ...newProjectiles]) {
        const nextProjectileState = {...p, x: p.x + p.vx};
        if (nextProjectileState.x < 0 || nextProjectileState.x > GAME_WIDTH) continue;
        if (isColliding(player, nextProjectileState)) {
            handleDamage();
            continue;
        }
        stillActiveProjectiles.push(nextProjectileState);
    }
    setProjectiles(stillActiveProjectiles);
    
    const time = Date.now();
    const updatedBlades = swingingBlades.map(blade => {
        const maxAngle = (Math.PI / 3);
        const newAngle = maxAngle * Math.sin(time / (blade.period! * 1000 / 2) * Math.PI + blade.initialAngle!);
        const bladeCenterX = blade.pivotX! + blade.chainLength! * Math.sin(newAngle);
        const bladeCenterY = blade.pivotY! + blade.chainLength! * Math.cos(newAngle);
        const updatedBlade = { ...blade, angle: newAngle, x: bladeCenterX, y: bladeCenterY };
        
        // Collision box for blade tip, simplified
        const bladeHitbox = { id: blade.id, x: updatedBlade.x - blade.width/2, y: updatedBlade.y - blade.height/2, width: blade.width, height: blade.height };

        if (isColliding(player, bladeHitbox)) {
            handleDamage();
        }

        return updatedBlade;
    });
    setSwingingBlades(updatedBlades);

    levelObjects.filter(obj => obj.type === 'goal').forEach(goal => {
        if (isColliding(player, goal)) onLevelComplete();
    });
    
    prevPressedKeys.current = new Set(pressedKeys);
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

  const shake = screenShakeRef.current;
  const shakeX = shake > 0 ? (Math.random() - 0.5) * shake : 0;
  const shakeY = shake > 0 ? (Math.random() - 0.5) * shake : 0;

  return (
    <div
      className="relative bg-gray-900 overflow-hidden border-4 border-gray-700"
      style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
    >
      {isPaused && <PauseMenu onResume={() => setIsPaused(false)} onRestart={onRestartCurrentLevel} onGoToMainMenu={onGoToMainMenu} />}

      <div className="absolute top-4 left-4 flex items-center gap-4 p-2 bg-black/50 rounded-md z-10">
          <HealthBar health={playerRef.current.health} maxHealth={PLAYER.INITIAL_HEALTH} />
          <DashIndicator cooldown={playerRef.current.dashCooldown} maxCooldown={PLAYER.DASH_COOLDOWN} />
      </div>

      <div 
        className="absolute top-0 left-0 w-full h-full"
        style={{ transform: `translate(${shakeX}px, ${shakeY}px)` }}
      >
        <Player player={playerRef.current} />
        {levelObjects.map(renderMapObject)}
        {enemies.map(enemy => <Enemy key={enemy.id} enemy={enemy} />)}
        {projectiles.map(p => <Projectile key={p.id} projectile={p} />)}
        {swingingBlades.map(b => <SwingingBlade key={b.id} blade={b} />)}
      </div>
    </div>
  );
};

export default Game;