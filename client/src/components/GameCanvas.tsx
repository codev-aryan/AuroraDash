import { useEffect, useRef, useState } from 'react';
import { GameEngine } from '@/game/engine';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useSubmitScore, useScores } from '@/hooks/use-scores';
import { Volume2, VolumeX, Trophy, Play, RotateCcw } from 'lucide-react';

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const requestRef = useRef<number>();
  
  const [gameState, setGameState] = useState<'start' | 'playing' | 'gameover'>('start');
  const [score, setScore] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [playerName, setPlayerName] = useState('');
  
  const { mutate: submitScore, isPending: isSubmitting } = useSubmitScore();
  const { data: highScores } = useScores();

  // Initialize Engine
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const engine = new GameEngine(canvasRef.current);
    engineRef.current = engine;
    
    engine.onScoreUpdate = (s) => setScore(s);
    engine.onGameOver = (finalScore) => {
      setScore(finalScore);
      setGameState('gameover');
    };

    const animate = () => {
      engine.update();
      engine.draw();
      requestRef.current = requestAnimationFrame(animate);
    };
    
    requestRef.current = requestAnimationFrame(animate);
    
    const handleResize = () => engine.resize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Input Handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        if (gameState === 'start' || gameState === 'gameover') {
          // Optional: Press space to start
        } else if (gameState === 'playing') {
          engineRef.current?.jump();
        }
      }
    };
    
    const handleMouseDown = () => {
      if (gameState === 'playing') engineRef.current?.jump();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousedown', handleMouseDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, [gameState]);

  const startGame = () => {
    engineRef.current?.start();
    setGameState('playing');
    setScore(0);
  };

  const handleScoreSubmit = () => {
    if (!playerName.trim()) return;
    submitScore({ playerName, score });
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gray-900">
      <canvas 
        ref={canvasRef} 
        className="block w-full h-full touch-none"
      />
      
      {/* HUD - Score & Mute */}
      <div className="absolute top-6 right-6 flex items-center gap-4 z-10">
        <div className="bg-black/30 backdrop-blur-md px-6 py-2 rounded-full border border-white/10 shadow-xl">
          <span className="text-2xl font-display text-white tracking-widest">{score} m</span>
        </div>
        <button 
          onClick={() => setIsMuted(!isMuted)}
          className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white"
        >
          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
      </div>

      <AnimatePresence>
        {gameState === 'start' && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-20"
          >
            <div className="text-center space-y-8 p-8 max-w-md w-full">
              <h1 className="text-6xl md:text-8xl font-display text-transparent bg-clip-text bg-gradient-to-br from-white via-primary to-purple-400 drop-shadow-lg filter">
                Santa's<br/>Adventure
              </h1>
              
              <div className="bg-card/50 border border-white/10 p-6 rounded-2xl backdrop-blur-md shadow-2xl">
                <p className="text-lg text-white/80 mb-6 font-body">
                  Tap or Spacebar to jump over obstacles.<br/>
                  Slide down slopes for speed!
                </p>
                <Button 
                  onClick={startGame}
                  className="w-full text-xl py-8 rounded-xl bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-600 border-none shadow-lg shadow-primary/20 hover:scale-105 transition-all duration-300 font-bold"
                >
                  <Play className="mr-2 w-6 h-6" fill="currentColor" /> Start Journey
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {gameState === 'gameover' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-md z-30"
          >
            <div className="bg-card border border-white/10 p-8 rounded-3xl shadow-2xl max-w-lg w-full m-4">
              <div className="text-center mb-8">
                <h2 className="text-5xl font-display text-white mb-2">Game Over</h2>
                <div className="text-7xl font-bold text-primary my-4">{score}</div>
                <p className="text-white/60">meters traveled</p>
              </div>

              <div className="space-y-4 mb-8">
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-center text-lg"
                  maxLength={15}
                />
                <Button 
                  onClick={handleScoreSubmit}
                  disabled={isSubmitting || !playerName}
                  className="w-full py-6 text-lg font-bold bg-white/10 hover:bg-white/20 text-white"
                >
                  {isSubmitting ? "Saving..." : "Save Score"}
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button 
                  onClick={startGame}
                  className="col-span-2 py-6 text-lg font-bold bg-gradient-to-r from-primary to-purple-500 hover:scale-[1.02] transition-transform text-primary-foreground"
                >
                  <RotateCcw className="mr-2" /> Play Again
                </Button>
              </div>

              {/* High Scores Mini List */}
              <div className="mt-8 pt-8 border-t border-white/10">
                <div className="flex items-center gap-2 mb-4 text-white/80">
                  <Trophy className="w-4 h-4 text-yellow-400" />
                  <span className="font-bold text-sm uppercase tracking-wider">Top Adventurers</span>
                </div>
                <div className="space-y-2">
                  {highScores?.slice(0, 3).map((s, i) => (
                    <div key={i} className="flex justify-between text-sm text-white/60">
                      <span>{i+1}. {s.playerName}</span>
                      <span className="font-mono text-primary">{s.score}m</span>
                    </div>
                  ))}
                  {(!highScores || highScores.length === 0) && (
                    <p className="text-xs text-white/30 italic">No scores yet. Be the first!</p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
