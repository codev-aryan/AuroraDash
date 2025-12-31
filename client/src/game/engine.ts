// Core game logic separate from React rendering
export interface Point {
  x: number;
  y: number;
}

export interface GameState {
  score: number;
  speed: number;
  distance: number;
  isGameOver: boolean;
  isPlaying: boolean;
  time: number;
  dayNightCycle: number; // 0 to 1
}

export class GameEngine {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  width: number = 0;
  height: number = 0;
  
  // Game State
  state: GameState = {
    score: 0,
    speed: 0,
    distance: 0,
    isGameOver: false,
    isPlaying: false,
    time: 0,
    dayNightCycle: 0
  };

  // Physics constants
  readonly GRAVITY = 0.6;
  readonly FRICTION = 0.99;
  readonly BOOST = 0.2;
  readonly MAX_SPEED = 12; 
  readonly JUMP_FORCE = -11; // Slightly increased from -10 for better push
  
  // Entities
  player: { x: number; y: number; dy: number; rotation: number; grounded: boolean } = {
    x: 200, y: 0, dy: 0, rotation: 0, grounded: false
  };
  
  terrainPoints: Point[] = [];
  obstacles: { x: number; type: 'rock' | 'tree' }[] = [];
  particles: { x: number; y: number; vx: number; vy: number; life: number; color: string }[] = [];
  bgStars: { x: number; y: number; size: number; alpha: number }[] = [];

  // Inputs
  keys: { space: boolean } = { space: false };
  inputBuffer: number = 0;
  readonly INPUT_BUFFER_TIME = 10; // Frames to buffer a jump input
  
  // Callbacks
  onGameOver?: (score: number) => void;
  onScoreUpdate?: (score: number) => void;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.resize();
    this.initStars();
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    
    // Regenerate terrain if empty
    if (this.terrainPoints.length === 0) {
      this.generateInitialTerrain();
    }
  }

  initStars() {
    this.bgStars = [];
    for (let i = 0; i < 100; i++) {
      this.bgStars.push({
        x: Math.random() * this.width,
        y: Math.random() * (this.height * 0.6),
        size: Math.random() * 2,
        alpha: Math.random()
      });
    }
  }

  generateInitialTerrain() {
    this.terrainPoints = [];
    let x = 0;
    let y = this.height * 0.75; // Lowered from 0.6 to show more sky
    
    while (x < this.width + 1200) {
      this.terrainPoints.push({ x, y });
      x += 60; 
      y += (Math.random() - 0.5) * 60; // Reduced variation slightly
      // Clamp height - lowered range
      if (y < this.height * 0.5) y = this.height * 0.5;
      if (y > this.height * 0.9) y = this.height * 0.9;
    }
    
    // Initial player position
    this.player.y = this.getTerrainHeightAt(this.player.x) - 15;
  }

  start() {
    this.state = {
      score: 0,
      speed: 5,
      distance: 0,
      isGameOver: false,
      isPlaying: true,
      time: 0,
      dayNightCycle: 0
    };
    this.player = { x: 200, y: 0, dy: 0, rotation: 0, grounded: false };
    this.obstacles = [];
    this.particles = [];
    this.generateInitialTerrain();
  }

  jump() {
    // Only allow jump if grounded or buffer is active
    if (this.player.grounded) {
      this.player.dy = this.JUMP_FORCE; // Uniform force
      this.player.grounded = false;
      this.inputBuffer = 0;
      this.createParticles(this.player.x, this.player.y + 10, 10, '#fff');
    } else {
      // Buffer the jump if not grounded
      this.inputBuffer = this.INPUT_BUFFER_TIME;
    }
  }

  update() {
    if (!this.state.isPlaying || this.state.isGameOver) return;

    if (this.inputBuffer > 0) this.inputBuffer--;

    this.state.time++;
    this.state.dayNightCycle = (Math.sin(this.state.time * 0.001) + 1) / 2; // Cycle 0-1
    
    // Physics
    this.player.dy += this.GRAVITY;
    this.player.y += this.player.dy;
    
    // Terrain collision
    const segmentWidth = 60;
    const segmentIndex = Math.floor((this.player.x + this.state.distance) / segmentWidth);
    const segmentProgress = ((this.player.x + this.state.distance) % segmentWidth) / segmentWidth;
    
    // Find matching terrain points more reliably
    const p1 = this.terrainPoints.find(p => p.x >= (this.player.x + this.state.distance) - segmentWidth) || { x: 0, y: this.height };
    const p2 = this.terrainPoints.find(p => p.x > p1.x) || p1;
    
    const terrainHeight = p1.y + (p2.y - p1.y) * segmentProgress;
    const slope = (p2.y - p1.y) / segmentWidth;
    
    const SLEIGH_HEIGHT = 15;
    const COLLISION_MARGIN = 25; // Significant margin for downhill jumping
    if (this.player.y >= terrainHeight - SLEIGH_HEIGHT - COLLISION_MARGIN) {
      if (this.player.y > terrainHeight - SLEIGH_HEIGHT) {
        this.player.y = terrainHeight - SLEIGH_HEIGHT;
      }
      this.player.dy = 0;
      this.player.grounded = true;
      this.player.rotation = Math.atan2(p2.y - p1.y, segmentWidth);
      
      // If player tried to jump while in margin, trigger it now
      if (this.keys.space || this.inputBuffer > 0) {
        this.jump();
      }
      
      // Speed based on slope - reduced variation
      this.state.speed += slope * 0.3;
      if (this.state.speed < 4) this.state.speed = 4;
      if (this.state.speed > this.MAX_SPEED) this.state.speed = this.MAX_SPEED;
    } else {
      this.player.grounded = false;
      this.player.rotation += 0.02; // Rotate while in air
    }
    
    // Clamp player within screen height to prevent falling off bottom
    if (this.player.y > this.height - 50) {
      this.player.y = this.height - 50;
      this.gameOver();
    }
    
    // Move world
    this.state.distance += this.state.speed;
    this.state.score = Math.floor(this.state.distance / 10);
    this.onScoreUpdate?.(this.state.score);

    // Generate new terrain
    const lastPoint = this.terrainPoints[this.terrainPoints.length - 1];
    if (lastPoint.x - this.state.distance < this.width + 400) {
      const x = lastPoint.x + 60;
      let y = lastPoint.y + (Math.random() - 0.5) * 90; // Natural heights
      
      // Keep within bounds - lowered
      if (y < this.height * 0.5) y = this.height * 0.5;
      if (y > this.height * 0.9) y = this.height * 0.9;
      
      this.terrainPoints.push({ x, y });
      
      // Chance to spawn obstacle
      // Spawning earlier: check distance > 300 (approx 3-4 seconds)
      // Added minimum spacing: 400 pixels between obstacles
      const lastObs = this.obstacles[this.obstacles.length - 1];
      const spacing = lastObs ? x - lastObs.x : 1000;
      
      if (Math.random() < 0.15 && this.state.distance > 300 && spacing > 400) {
        this.obstacles.push({ 
          x: x, 
          type: Math.random() > 0.5 ? 'rock' : 'tree' 
        });
      }
    }
    
    // Clean up old terrain
    if (this.terrainPoints[0].x - this.state.distance < -100) {
      this.terrainPoints.shift();
    }
    
    // Update Obstacles & Check Collision
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      const screenX = obs.x - this.state.distance;
      
      // Remove off-screen
      if (screenX < -100) {
        this.obstacles.splice(i, 1);
        continue;
      }
      
      // Simple collision box
      if (
        Math.abs(screenX - this.player.x) < 30 &&
        Math.abs(this.player.y - (this.getTerrainHeightAt(obs.x) - 10)) < 30
      ) {
        this.gameOver();
      }
    }
    
    // Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.02;
      if (p.life <= 0) this.particles.splice(i, 1);
    }
    
    // Constant snow trail
    if (this.player.grounded && this.state.speed > 8) {
      this.createParticles(this.player.x - 20, this.player.y + 10, 1, 'rgba(255,255,255,0.5)');
    }
  }

  getTerrainHeightAt(x: number) {
    const relativeX = x; // Terrain array stores absolute X
    // Find segment
    const segmentIndex = this.terrainPoints.findIndex(p => p.x >= relativeX) - 1;
    if (segmentIndex < 0) return this.height / 2;
    
    const p1 = this.terrainPoints[segmentIndex];
    const p2 = this.terrainPoints[segmentIndex + 1];
    if (!p2) return p1.y;
    
    const progress = (relativeX - p1.x) / (p2.x - p1.x);
    return p1.y + (p2.y - p1.y) * progress;
  }

  gameOver() {
    this.state.isGameOver = true;
    this.state.isPlaying = false;
    this.onGameOver?.(this.state.score);
    // Screen shake effect
    this.canvas.style.transform = 'translate(5px, 5px)';
    setTimeout(() => this.canvas.style.transform = 'none', 50);
  }

  createParticles(x: number, y: number, count: number, color: string) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 5,
        vy: (Math.random() - 0.5) * 5,
        life: 1.0,
        color
      });
    }
  }

  draw() {
    // Clear
    this.ctx.clearRect(0, 0, this.width, this.height);
    
    // Sky Gradient (Day/Night cycle)
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
    // Interpolate colors based on dayNightCycle
    // Night: #0f172a, Sunset: #4c1d95, Day: #0ea5e9 (Simplified logic)
    const t = this.state.dayNightCycle;
    
    // Deep purple/blue night
    gradient.addColorStop(0, `rgba(15, 23, 42, 1)`); 
    gradient.addColorStop(1, `rgba(88, 28, 135, ${0.5 + t * 0.5})`);
    
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    // Draw Stars (parallax)
    this.ctx.fillStyle = `rgba(255, 255, 255, ${0.8 - t * 0.8})`; // Fade out during 'day'
    this.bgStars.forEach(star => {
      this.ctx.beginPath();
      const px = (star.x - this.state.distance * 0.05) % this.width;
      const x = px < 0 ? px + this.width : px;
      this.ctx.arc(x, star.y, star.size, 0, Math.PI * 2);
      this.ctx.fill();
    });

    // Aurora (Procedural)
    // Even more prominent aurora
    const auroraAlpha = 0.85; 
    this.drawAurora(auroraAlpha);

    // Terrain
    this.ctx.beginPath();
    if (this.terrainPoints.length > 0) {
      const first = this.terrainPoints[0];
      this.ctx.moveTo(first.x - this.state.distance, this.height);
      this.ctx.lineTo(first.x - this.state.distance, first.y);
      
      for (let i = 0; i < this.terrainPoints.length - 1; i++) {
        const p1 = this.terrainPoints[i];
        const p2 = this.terrainPoints[i + 1];
        const xc = (p1.x + p2.x) / 2;
        const yc = (p1.y + p2.y) / 2;
        this.ctx.quadraticCurveTo(p1.x - this.state.distance, p1.y, xc - this.state.distance, yc);
      }
      
      const last = this.terrainPoints[this.terrainPoints.length - 1];
      this.ctx.lineTo(last.x - this.state.distance, this.height);
    }
    this.ctx.fillStyle = '#f8fafc'; // Snow white
    this.ctx.fill();
    
    // Terrain Shadow/Depth
    this.ctx.strokeStyle = '#e2e8f0';
    this.ctx.lineWidth = 5;
    this.ctx.stroke();

    // Obstacles
    this.obstacles.forEach(obs => {
      const x = obs.x - this.state.distance;
      const y = this.getTerrainHeightAt(obs.x);
      
      if (obs.type === 'rock') {
        this.ctx.fillStyle = '#64748b';
        this.ctx.beginPath();
        // More "stone" like shape (trapezoid/irregular)
        this.ctx.moveTo(x - 20, y);
        this.ctx.lineTo(x - 15, y - 18);
        this.ctx.lineTo(x + 15, y - 22);
        this.ctx.lineTo(x + 22, y);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Stone details (cracks/shadows)
        this.ctx.strokeStyle = 'rgba(0,0,0,0.2)';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
      } else {
        // Tree (Tiered circular style like the image)
        // Trunk - moved slightly up to be visible in snow
        this.ctx.fillStyle = '#451a03'; 
        this.ctx.fillRect(x - 3, y - 15, 6, 15);

        // Circular tiers
        this.ctx.fillStyle = '#064e3b';
        
        // Bottom tier
        this.ctx.beginPath();
        this.ctx.arc(x, y - 18, 12, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Middle tier
        this.ctx.beginPath();
        this.ctx.arc(x, y - 28, 9, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Top tier
        this.ctx.beginPath();
        this.ctx.arc(x, y - 36, 6, 0, Math.PI * 2);
        this.ctx.fill();
      }
    });

    // Player (Santa Sleigh)
    this.ctx.save();
    this.ctx.translate(this.player.x, this.player.y);
    this.ctx.rotate(this.player.rotation);
    
    // Sleigh base (Thin brown plank)
    this.ctx.fillStyle = '#78350f'; 
    this.ctx.beginPath();
    this.ctx.roundRect(-20, 0, 40, 4, 2);
    this.ctx.fill();
    
    // Santa Body (Tilted forward slightly)
    this.ctx.fillStyle = '#ef4444';
    this.ctx.beginPath();
    this.ctx.ellipse(-2, -8, 10, 12, 0.2, 0, Math.PI * 2);
    this.ctx.fill();

    // Belt
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(-10, -8, 18, 3);

    // Beard (Proper fluffy beard)
    this.ctx.fillStyle = '#fff';
    this.ctx.beginPath();
    this.ctx.arc(8, -10, 6, 0, Math.PI * 2);
    this.ctx.arc(6, -6, 5, 0, Math.PI * 2);
    this.ctx.arc(10, -6, 4, 0, Math.PI * 2);
    this.ctx.fill();

    // Face
    this.ctx.fillStyle = '#fecaca';
    this.ctx.beginPath();
    this.ctx.arc(8, -14, 5, 0, Math.PI * 2);
    this.ctx.fill();

    // Eyes
    this.ctx.fillStyle = '#000';
    this.ctx.beginPath();
    this.ctx.arc(10, -15, 1, 0, Math.PI * 2);
    this.ctx.fill();

    // Proper Hat
    this.ctx.fillStyle = '#ef4444';
    this.ctx.beginPath();
    this.ctx.moveTo(4, -18);
    this.ctx.lineTo(12, -18);
    this.ctx.quadraticCurveTo(8, -28, 0, -26);
    this.ctx.fill();
    this.ctx.fillStyle = '#fff';
    this.ctx.beginPath();
    this.ctx.arc(0, -26, 3, 0, Math.PI * 2);
    this.ctx.fill();
    
    this.ctx.restore();
    
    // Particles
    this.particles.forEach(p => {
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = p.life;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
      this.ctx.fill();
    });
    this.ctx.globalAlpha = 1;

    // Foreground Snow (Increased density)
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    const tTime = Date.now() / 1000;
    for(let i=0; i<150; i++) { // Increased from 50 to 150
      const sx = (i * 123.45 + tTime * 50) % this.width;
      const sy = (i * 987.65 + tTime * 80) % this.height;
      this.ctx.beginPath();
      this.ctx.arc(sx, sy, 2, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  drawAurora(alpha: number) {
    this.ctx.save();
    this.ctx.globalAlpha = alpha;
    
    const time = Date.now() * 0.001;
    
    // Multi-layered horizontal bands with soft gradients - Made more vibrant
    const bands = [
      { y: 60, color: '#22c55e', speed: 0.3, height: 120 }, // Green
      { y: 120, color: '#a855f7', speed: 0.2, height: 150 }, // Purple
      { y: 180, color: '#38bdf8', speed: 0.4, height: 100 }  // Cyan
    ];

    bands.forEach((band, i) => {
      const gradient = this.ctx.createLinearGradient(0, band.y - band.height/2, 0, band.y + band.height/2);
      gradient.addColorStop(0, 'rgba(0,0,0,0)');
      gradient.addColorStop(0.5, band.color + '88'); // 0x88 alpha for more prominence
      gradient.addColorStop(1, 'rgba(0,0,0,0)');

      this.ctx.fillStyle = gradient;
      this.ctx.beginPath();
      
      const waveFreq = 0.0015;
      const waveAmp = 50; // Increased wave amplitude
      
      this.ctx.moveTo(-100, band.y);
      for (let x = -100; x <= this.width + 100; x += 40) {
        const y = band.y + Math.sin(x * waveFreq + time * band.speed + i) * waveAmp;
        this.ctx.lineTo(x, y);
      }
      
      this.ctx.lineTo(this.width + 100, band.y + band.height);
      this.ctx.lineTo(-100, band.y + band.height);
      this.ctx.fill();
    });
    
    this.ctx.restore();
  }
}
