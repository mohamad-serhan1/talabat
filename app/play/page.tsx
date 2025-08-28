// app/play/page.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from 'react';

interface Position {
  x: number;
  y: number;
}

interface Enemy {
  id: number;
  position: Position;
  size: number;
}

interface Bullet {
  id: number;
  position: Position;
}

export default function SpaceShooter() {
  // Game state
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [playerPosition, setPlayerPosition] = useState({ x: 280, y: 450 });
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [bullets, setBullets] = useState<Bullet[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  
  // Refs for game elements
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>(0);
  const lastEnemySpawnTime = useRef(0);
  const enemyIdCounter = useRef(0);
  const bulletIdCounter = useRef(0);
  const keysPressed = useRef<Set<string>>(new Set());
  const lastCollisionTime = useRef(0);
  const lastShotTime = useRef(0);
  const isShooting = useRef(false);
  const isMoving = useRef(false);
  const moveTouchId = useRef<number | null>(null);
  const shootTouchId = useRef<number | null>(null);
  
  // Use refs for state that needs to be accessed in the game loop
  const enemiesRef = useRef<Enemy[]>([]);
  const bulletsRef = useRef<Bullet[]>([]);
  const playerPositionRef = useRef<Position>({ x: 280, y: 450 });
  
  // Game constants
  const PLAYER_SIZE = 40;
  const ENEMY_SIZE = 30;
  const BULLET_SIZE = 6;
  const PLAYER_SPEED = 8;
  const ENEMY_SPEED = 2;
  const BULLET_SPEED = 10;
  const ENEMY_SPAWN_INTERVAL = 1000; // ms
  const SHOOT_COOLDOWN = 200; // ms
  const collisionCooldown = 1000; // 1 second cooldown between collisions

  // Keep refs in sync with state
  useEffect(() => {
    enemiesRef.current = enemies;
  }, [enemies]);

  useEffect(() => {
    bulletsRef.current = bullets;
  }, [bullets]);

  useEffect(() => {
    playerPositionRef.current = playerPosition;
  }, [playerPosition]);

  // Check if device is mobile
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);

  // Handle key events for smooth movement
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault(); // Prevent spacebar from scrolling the page
      }
      keysPressed.current.add(e.key);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.key);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Initialize game
  useEffect(() => {
    if (gameStarted && !gameOver) {
      // Start game loop
      animationFrameRef.current = requestAnimationFrame(gameLoop);
      
      return () => {
        cancelAnimationFrame(animationFrameRef.current);
      };
    }
  }, [gameStarted, gameOver]);

  const gameLoop = useCallback((timestamp: number) => {
    if (gameOver) return;
    
    // Handle player movement based on pressed keys
    handlePlayerMovement(timestamp);
    
    // Spawn enemies
    if (timestamp - lastEnemySpawnTime.current > ENEMY_SPAWN_INTERVAL) {
      spawnEnemy();
      lastEnemySpawnTime.current = timestamp;
    }
    
    // Move enemies
    setEnemies(prev => 
      prev.map(enemy => ({
        ...enemy,
        position: { ...enemy.position, y: enemy.position.y + ENEMY_SPEED }
      })).filter(enemy => enemy.position.y < 500)
    );
    
    // Move bullets
    setBullets(prev => 
      prev.map(bullet => ({
        ...bullet,
        position: { ...bullet.position, y: bullet.position.y - BULLET_SPEED }
      })).filter(bullet => bullet.position.y > 0)
    );
    
    // Check collisions
    checkCollisions(timestamp);
    
    // Continue game loop
    animationFrameRef.current = requestAnimationFrame(gameLoop);
  }, [gameOver]);

  const handlePlayerMovement = useCallback((timestamp: number) => {
    if (!gameContainerRef.current) return;
    
    const maxX = gameContainerRef.current.offsetWidth - PLAYER_SIZE;
    
    setPlayerPosition(prev => {
      let newX = prev.x;
      
      if (keysPressed.current.has('ArrowLeft') || keysPressed.current.has('a')) {
        newX = Math.max(0, newX - PLAYER_SPEED);
      }
      
      if (keysPressed.current.has('ArrowRight') || keysPressed.current.has('d')) {
        newX = Math.min(maxX, newX + PLAYER_SPEED);
      }
      
      // Shoot if space is pressed or auto-shooting on mobile
      if (keysPressed.current.has(' ') || keysPressed.current.has('Spacebar') || isShooting.current) {
        if (timestamp - lastShotTime.current > SHOOT_COOLDOWN) {
          shoot(newX);
          lastShotTime.current = timestamp;
        }
      }
      
      return { ...prev, x: newX };
    });
  }, []);

  const spawnEnemy = useCallback(() => {
    if (!gameContainerRef.current) return;
    
    const containerWidth = gameContainerRef.current.offsetWidth;
    const randomX = Math.floor(Math.random() * (containerWidth - ENEMY_SIZE));
    
    setEnemies(prev => [
      ...prev,
      {
        id: enemyIdCounter.current++,
        position: { x: randomX, y: -ENEMY_SIZE }, // Start above the screen
        size: ENEMY_SIZE
      }
    ]);
  }, []);

  const shoot = useCallback((playerX: number) => {
    setBullets(prev => [
      ...prev,
      {
        id: bulletIdCounter.current++,
        position: { 
          x: playerX + PLAYER_SIZE / 2 - BULLET_SIZE / 2, 
          y: playerPositionRef.current.y 
        }
      }
    ]);
  }, []);

  const checkCollisions = useCallback((timestamp: number) => {
    // Use refs to get the latest state
    const currentBullets = bulletsRef.current;
    const currentEnemies = enemiesRef.current;
    const currentPlayerPosition = playerPositionRef.current;
    
    // Check bullet-enemy collisions
    const newBullets = [...currentBullets];
    const newEnemies = [...currentEnemies];
    let scoreIncrease = 0;
    let bulletsToRemove: number[] = [];
    let enemiesToRemove: number[] = [];
    
    for (let i = 0; i < currentBullets.length; i++) {
      const bullet = currentBullets[i];
      const bulletRect = {
        x: bullet.position.x,
        y: bullet.position.y,
        width: BULLET_SIZE,
        height: BULLET_SIZE * 2
      };
      
      for (let j = 0; j < currentEnemies.length; j++) {
        const enemy = currentEnemies[j];
        const enemyRect = {
          x: enemy.position.x,
          y: enemy.position.y,
          width: enemy.size,
          height: enemy.size
        };
        
        if (
          bulletRect.x < enemyRect.x + enemyRect.width &&
          bulletRect.x + bulletRect.width > enemyRect.x &&
          bulletRect.y < enemyRect.y + enemyRect.height &&
          bulletRect.y + bulletRect.height > enemyRect.y
        ) {
          // Collision detected
          bulletsToRemove.push(i);
          enemiesToRemove.push(j);
          scoreIncrease += 10;
          break;
        }
      }
    }
    
    // Remove bullets and enemies that collided
    if (bulletsToRemove.length > 0) {
      setBullets(prev => prev.filter((_, index) => !bulletsToRemove.includes(index)));
    }
    
    if (enemiesToRemove.length > 0) {
      setEnemies(prev => prev.filter((_, index) => !enemiesToRemove.includes(index)));
      setScore(prev => prev + scoreIncrease);
    }
    
    // Check player-enemy collisions with cooldown
    if (timestamp - lastCollisionTime.current > collisionCooldown) {
      const playerRect = {
        x: currentPlayerPosition.x,
        y: currentPlayerPosition.y,
        width: PLAYER_SIZE,
        height: PLAYER_SIZE
      };
      
      for (let j = 0; j < currentEnemies.length; j++) {
        const enemy = currentEnemies[j];
        const enemyRect = {
          x: enemy.position.x,
          y: enemy.position.y,
          width: enemy.size,
          height: enemy.size
        };
        
        if (
          playerRect.x < enemyRect.x + enemyRect.width &&
          playerRect.x + playerRect.width > enemyRect.x &&
          playerRect.y < enemyRect.y + enemyRect.height &&
          playerRect.y + playerRect.height > enemyRect.y
        ) {
          // Collision detected
          lastCollisionTime.current = timestamp;
          
          setLives(prev => {
            if (prev <= 1) {
              setGameOver(true);
              return 0;
            }
            return prev - 1;
          });
          
          // Remove the enemy that collided with the player
          setEnemies(prev => prev.filter(e => e.id !== enemy.id));
          break;
        }
      }
    }
  }, []);

  // Improved touch event handlers for mobile controls
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!gameContainerRef.current) return;
    
    const rect = gameContainerRef.current.getBoundingClientRect();
    const touches = e.touches;
    
    for (let i = 0; i < touches.length; i++) {
      const touch = touches[i];
      const touchX = touch.clientX - rect.left;
      const touchY = touch.clientY - rect.top;
      
      // Check if touch is in the bottom area (movement zone)
      if (touchY > rect.height * 0.6 && moveTouchId.current === null) {
        moveTouchId.current = touch.identifier;
        isMoving.current = true;
        
        // Move player to touch position
        setPlayerPosition(prev => ({
          ...prev,
          x: Math.max(0, Math.min(rect.width - PLAYER_SIZE, touchX - PLAYER_SIZE / 2))
        }));
      } 
      // Check if touch is in the top area (shooting zone)
      else if (touchY <= rect.height * 0.6 && shootTouchId.current === null) {
        shootTouchId.current = touch.identifier;
        isShooting.current = true;
      }
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!gameContainerRef.current || moveTouchId.current === null) return;
    
    const rect = gameContainerRef.current.getBoundingClientRect();
    const touches = e.touches;
    
    for (let i = 0; i < touches.length; i++) {
      const touch = touches[i];
      
      if (touch.identifier === moveTouchId.current) {
        const touchX = touch.clientX - rect.left;
        
        setPlayerPosition(prev => ({
          ...prev,
          x: Math.max(0, Math.min(rect.width - PLAYER_SIZE, touchX - PLAYER_SIZE / 2))
        }));
        break;
      }
    }
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const changedTouches = e.changedTouches;
    
    for (let i = 0; i < changedTouches.length; i++) {
      const touch = changedTouches[i];
      
      if (touch.identifier === moveTouchId.current) {
        moveTouchId.current = null;
        isMoving.current = false;
      }
      
      if (touch.identifier === shootTouchId.current) {
        shootTouchId.current = null;
        isShooting.current = false;
      }
    }
  }, []);

  const startGame = () => {
    setScore(0);
    setLives(3);
    setGameOver(false);
    setEnemies([]);
    setBullets([]);
    setPlayerPosition({ x: 280, y: 450 });
    setGameStarted(true);
    enemyIdCounter.current = 0;
    bulletIdCounter.current = 0;
    lastEnemySpawnTime.current = 0;
    lastCollisionTime.current = 0;
    lastShotTime.current = 0;
    keysPressed.current.clear();
    isShooting.current = false;
    isMoving.current = false;
    moveTouchId.current = null;
    shootTouchId.current = null;
    enemiesRef.current = [];
    bulletsRef.current = [];
    playerPositionRef.current = { x: 280, y: 450 };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-gray-900 text-white flex flex-col items-center justify-center p-4">
      <div className="text-center mb-4">
        <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400">
RORO RORO this game for you
 ابوس روحك        </h1>
        <div className="flex justify-between w-full max-w-lg mx-auto">
          <div className="text-xl">Score: {score}</div>
          <div className="text-xl">Lives: {lives}</div>
        </div>
      </div>
      
      <div 
        ref={gameContainerRef}
        className="relative w-full max-w-lg min-h-screen bg-gradient-to-b from-blue-900 to-purple-900 border-2 border-cyan-400 rounded-lg overflow-hidden shadow-lg shadow-cyan-500/20"
        style={{ maxWidth: '600px', touchAction: 'none' }}
        tabIndex={0}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {!gameStarted ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70 z-10">
            <h2 className="text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400">
              SPACE SHOOTER
            </h2>
            <button 
              onClick={startGame}
              className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full text-xl font-bold hover:from-cyan-600 hover:to-purple-600 transition-all transform hover:scale-105 shadow-lg shadow-cyan-400/30"
            >
              START GAME
            </button>
            <div className="mt-8 text-center max-w-md">
              <p className="mb-2">{isMobile ? 'Touch bottom to move, top to shoot' : 'Use ← → arrows to move'}</p>
              <p className="mb-2">{isMobile ? '' : 'Hold SPACEBAR to shoot continuously'}</p>
              <p>Destroy enemies and avoid collisions</p>
            </div>
          </div>
        ) : gameOver ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70 z-10">
            <h2 className="text-3xl font-bold mb-4 text-red-400">GAME OVER</h2>
            <p className="text-xl mb-6">Final Score: {score}</p>
            <button 
              onClick={startGame}
              className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full text-xl font-bold hover:from-cyan-600 hover:to-purple-600 transition-all transform hover:scale-105"
            >
              PLAY AGAIN
            </button>
          </div>
        ) : null}
        
        {/* Mobile control hints */}
        {gameStarted && isMobile && (
          <>
            <div className="absolute bottom-0 left-0 right-0 h-2/5 bg-black bg-opacity-10 border-t border-cyan-400 border-dashed flex items-center justify-center">
              <span className="text-sm opacity-70">Move here</span>
            </div>
            <div className="absolute top-0 left-0 right-0 h-3/5 bg-black bg-opacity-10 border-b border-cyan-400 border-dashed flex items-end justify-center pb-4">
              <span className="text-sm opacity-70">Shoot here</span>
            </div>
          </>
        )}
        
        {/* Player */}
        <div 
          className="absolute z-10"
          style={{
            left: playerPosition.x,
            top: playerPosition.y,
            width: PLAYER_SIZE,
            height: PLAYER_SIZE,
            background: 'linear-gradient(45deg, #00dbde, #fc00ff)',
            clipPath: 'polygon(50% 0%, 100% 100%, 50% 70%, 0% 100%)'
          }}
        />
        
        {/* Enemies */}
        {enemies.map(enemy => (
          <div
            key={enemy.id}
            className="absolute"
            style={{
              left: enemy.position.x,
              top: enemy.position.y,
              width: enemy.size,
              height: enemy.size,
              background: 'linear-gradient(45deg, #ff416c, #ff4b2b)',
              clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
              borderRadius: '50%'
            }}
          />
        ))}
        
        {/* Bullets */}
        {bullets.map(bullet => (
          <div
            key={bullet.id}
            className="absolute"
            style={{
              left: bullet.position.x,
              top: bullet.position.y,
              width: BULLET_SIZE,
              height: BULLET_SIZE * 2,
              background: 'linear-gradient(to top, #f8ff00, #ff9900)',
              borderRadius: '2px'
            }}
          />
        ))}
      </div>
      
      <div className="mt-6 text-center text-sm opacity-70">
        <p>
          {isMobile 
            ? 'Touch bottom area to move, top area to shoot' 
            : 'Use arrow keys to move and spacebar to shoot'
          }
        </p>
      </div>

      {/* Mobile control buttons for additional options */}
      {isMobile && gameStarted && !gameOver && (
        <div className="mt-4 flex space-x-4">
          <button 
            className="px-6 py-3 bg-cyan-600 rounded-lg opacity-80 text-lg font-bold"
            onTouchStart={() => keysPressed.current.add('ArrowLeft')}
            onTouchEnd={() => keysPressed.current.delete('ArrowLeft')}
          >
            ←
          </button>
          <button 
            className="px-6 py-3 bg-purple-600 rounded-lg opacity-80 text-lg font-bold"
            onTouchStart={() => isShooting.current = true}
            onTouchEnd={() => isShooting.current = false}
          >
            SHOOT
          </button>
          <button 
            className="px-6 py-3 bg-cyan-600 rounded-lg opacity-80 text-lg font-bold"
            onTouchStart={() => keysPressed.current.add('ArrowRight')}
            onTouchEnd={() => keysPressed.current.delete('ArrowRight')}
          >
            →
          </button>
        </div>
      )}
    </div>
  );
}