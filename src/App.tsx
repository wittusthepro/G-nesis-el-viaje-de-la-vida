/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  Play, 
  Book, 
  Trophy, 
  Settings, 
  Info, 
  Pause, 
  RotateCcw, 
  Home, 
  ChevronRight, 
  ChevronLeft,
  X,
  Volume2,
  VolumeX,
  CheckCircle2,
  AlertCircle,
  Heart,
  Zap,
  Target
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- CONSTANTS & ENUMS ---

enum GameState {
  MENU = 'MENU',
  INTRO = 'INTRO',
  LEVEL_SELECT = 'LEVEL_SELECT',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  QUIZ = 'QUIZ',
  ENCYCLOPEDIA = 'ENCYCLOPEDIA',
  LEVEL_SUMMARY = 'LEVEL_SUMMARY',
  VICTORIA = 'VICTORIA',
  GAME_OVER = 'GAME_OVER',
  CREDITS = 'CREDITS',
  SETTINGS = 'SETTINGS'
}

enum LevelID {
  SPERMATOGENESIS = 1,
  OOGENESIS = 2,
  SPERM_JOURNEY = 3,
  FERTILIZATION = 4,
  EARLY_DEV = 5
}

// --- SCIENTIFIC CONTENT ---

const ENCYCLOPEDIA_DATA = [
  {
    id: 'spermatogenesis',
    title: 'Espermatogénesis',
    category: 'Procesos',
    content: 'La espermatogénesis es el proceso de formación de los espermatozoides. Ocurre en los túbulos seminíferos de los testículos y dura aproximadamente 74 días. Comienza con las espermatogonias (células madre 2n=46) que se dividen por mitosis. Luego, los espermatocitos primarios entran en meiosis I, seguidos por los secundarios en meiosis II, resultando en espermátidas haploides (n=23). Finalmente, la espermiogénesis transforma las espermátidas en espermatozoides maduros con cabeza, pieza intermedia y cola.',
    fact: 'Un hombre sano produce entre 200 y 300 millones de espermatozoides por eyaculación.'
  },
  {
    id: 'oogenesis',
    title: 'Ovogénesis',
    category: 'Procesos',
    content: 'La ovogénesis es el desarrollo del óvulo u ovocito. A diferencia de los hombres, las mujeres nacen con todos sus ovocitos primarios ya formados (detenidos en Profase I). En cada ciclo menstrual, un grupo de folículos comienza a madurar, pero generalmente solo uno (folículo dominante) completa la maduración y libera un ovocito secundario durante la ovulación. Este ovocito está detenido en Metafase II y solo completará la meiosis si es fecundado.',
    fact: 'Solo unos 400-500 óvulos llegarán a ser ovulados en toda la vida reproductiva de una mujer.'
  },
  {
    id: 'fertilization',
    title: 'Fecundación',
    category: 'Procesos',
    content: 'La fecundación es la unión del espermatozoide y el ovocito para formar un cigoto. Involucra varios pasos críticos: 1. Penetración de la corona radiata. 2. Reacción acrosómica (liberación de enzimas). 3. Penetración de la zona pelúcida. 4. Fusión de membranas (proteínas IZUMO1 y JUNO). 5. Reacción cortical (bloqueo de polispermia). 6. Activación del ovocito y formación de pronúcleos.',
    fact: 'La reacción cortical endurece la zona pelúcida en milisegundos para evitar que entre más de un espermatozoide.'
  },
  {
    id: 'anatomy_m',
    title: 'Sistema Masculino',
    category: 'Anatomía',
    content: 'Incluye los testículos (producción de esperma y testosterona), el epidídimo (maduración y almacenamiento), los conductos deferentes, las vesículas seminales y la próstata (producción de líquido seminal), y la uretra/pene para la eyaculación.',
    fact: 'Los testículos se encuentran fuera del cuerpo porque necesitan una temperatura ~2°C menor a la corporal para producir esperma sano.'
  },
  {
    id: 'anatomy_f',
    title: 'Sistema Femenino',
    category: 'Anatomía',
    content: 'Compuesto por los ovarios (producción de óvulos y hormonas), las trompas de Falopio (donde ocurre la fecundación), el útero (donde se implanta el embrión), el cérvix y la vagina.',
    fact: 'El útero es uno de los órganos más fuertes del cuerpo humano y puede expandirse hasta 500 veces su tamaño original durante el embarazo.'
  }
];

const QUIZ_DATA = {
  [LevelID.SPERMATOGENESIS]: [
    {
      q: '¿Cuántos cromosomas tiene un espermatozoide maduro?',
      a: ['46', '23', '12', '92'],
      c: 1,
      e: 'Los espermatozoides son células haploides (n=23) para que al unirse al óvulo (n=23) formen un cigoto diploide (2n=46).'
    },
    {
      q: '¿Dónde se producen los espermatozoides?',
      a: ['Próstata', 'Vesículas seminales', 'Túbulos seminíferos', 'Uretra'],
      c: 2,
      e: 'La producción ocurre en los túbulos seminíferos dentro de los testículos.'
    },
    {
      q: '¿Cómo se llama el proceso de maduración final del espermatozoide?',
      a: ['Mitosis', 'Espermiogénesis', 'Ovulación', 'Fecundación'],
      c: 1,
      e: 'La espermiogénesis es la fase final donde las espermátidas se transforman en espermatozoides con cola.'
    },
    {
      q: '¿Qué organelo forma el acrosoma?',
      a: ['Mitocondria', 'Núcleo', 'Aparato de Golgi', 'Retículo endoplasmático'],
      c: 2,
      e: 'El acrosoma se deriva del aparato de Golgi y contiene enzimas para penetrar el óvulo.'
    },
    {
      q: '¿Qué hormona estimula la espermatogénesis?',
      a: ['Insulina', 'FSH (Foliculoestimulante)', 'Estrógeno', 'Prolactina'],
      c: 1,
      e: 'La FSH actúa sobre las células de Sertoli para promover la producción de esperma.'
    }
  ],
  [LevelID.OOGENESIS]: [
    {
      q: '¿En qué fase se detienen los ovocitos al nacer?',
      a: ['Metafase II', 'Profase I', 'Anafase I', 'Telofase II'],
      c: 1,
      e: 'Los ovocitos primarios están detenidos en el dictioteno de la Profase I desde antes del nacimiento.'
    },
    {
      q: '¿Cuántos óvulos funcionales resultan de una sola meiosis femenina?',
      a: ['4', '2', '1', '8'],
      c: 2,
      e: 'Solo resulta 1 óvulo funcional; las otras 3 células son cuerpos polares que degeneran.'
    },
    {
      q: '¿Qué hormona provoca la ovulación?',
      a: ['LH (Luteinizante)', 'Progesterona', 'Testosterona', 'HCG'],
      c: 0,
      e: 'El pico de LH es el desencadenante crítico para la liberación del óvulo.'
    },
    {
      q: '¿Dónde se detiene el ovocito secundario antes de la fecundación?',
      a: ['Profase I', 'Metafase II', 'Anafase II', 'Profase II'],
      c: 1,
      e: 'El ovocito secundario se detiene en Metafase II y solo termina la meiosis si hay fecundación.'
    }
  ],
  [LevelID.SPERM_JOURNEY]: [
    {
      q: '¿Qué proceso permite al espermatozoide adquirir la capacidad de fecundar?',
      a: ['Eyaculación', 'Capacitación', 'Meiosis', 'Mitosis'],
      c: 1,
      e: 'La capacitación ocurre en el tracto femenino y dura unas 7 horas, permitiendo la reacción acrosómica.'
    },
    {
      q: '¿Cuál es el principal obstáculo ácido para el esperma?',
      a: ['Útero', 'Trompas', 'Vagina', 'Ovario'],
      c: 2,
      e: 'El pH vaginal es ácido (3.5-4.0), lo cual es hostil para el esperma sin el líquido seminal alcalino.'
    },
    {
      q: '¿Dónde ocurre normalmente la fecundación?',
      a: ['Útero', 'Vagina', 'Ampolla de la trompa de Falopio', 'Ovario'],
      c: 2,
      e: 'La ampolla es la región más ancha de la trompa donde suele ocurrir el encuentro.'
    },
    {
      q: '¿Qué ayuda al esperma a subir por el útero?',
      a: ['Gravedad', 'Contracciones uterinas', 'Viento', 'Nada'],
      c: 1,
      e: 'Las contracciones del miometrio ayudan a transportar el esperma hacia las trompas.'
    }
  ],
  [LevelID.FERTILIZATION]: [
    {
      q: '¿Cuál es el receptor primario del espermatozoide en la zona pelúcida?',
      a: ['ZP1', 'ZP2', 'ZP3', 'ZP4'],
      c: 2,
      e: 'La glucoproteína ZP3 actúa como el receptor principal para la unión del espermatozoide.'
    },
    {
      q: '¿Qué evita que entre más de un espermatozoide (polispermia)?',
      a: ['Reacción cortical', 'Reacción acrosómica', 'Capacitación', 'Ovulación'],
      c: 0,
      e: 'La liberación de gránulos corticales inactiva los receptores ZP3 y endurece la zona pelúcida.'
    },
    {
      q: '¿Qué proteína del espermatozoide se une al receptor JUNO del óvulo?',
      a: ['Actina', 'IZUMO1', 'Miosina', 'Tubulina'],
      c: 1,
      e: 'IZUMO1 es esencial para la fusión de las membranas plasmáticas de ambos gametos.'
    },
    {
      q: '¿Qué se forma inmediatamente tras la fusión de pronúcleos?',
      a: ['Mórula', 'Blastocisto', 'Cigoto', 'Feto'],
      c: 2,
      e: 'La unión de los pronúcleos masculino y femenino forma el cigoto, la primera célula del nuevo ser.'
    }
  ],
  [LevelID.EARLY_DEV]: [
    {
      q: '¿Cómo se llama la masa sólida de 16-32 células?',
      a: ['Cigoto', 'Blastocisto', 'Mórula', 'Gástrula'],
      c: 2,
      e: 'La mórula (del latín morum, mora) es el estado embrionario temprano tras la segmentación.'
    },
    {
      q: '¿En qué estado se implanta el embrión en el útero?',
      a: ['Cigoto', 'Mórula', 'Blastocisto', 'Gástrula'],
      c: 2,
      e: 'El blastocisto es el estadio que se adhiere al endometrio aproximadamente al 6to día.'
    },
    {
      q: '¿Qué parte del blastocisto formará la placenta?',
      a: ['Masa celular interna', 'Trofoblasto', 'Blastocele', 'Zona pelúcida'],
      c: 1,
      e: 'El trofoblasto es la capa externa que dará origen a las estructuras de soporte como la placenta.'
    },
    {
      q: '¿Qué hormona detectan los tests de embarazo?',
      a: ['Estrógeno', 'Progesterona', 'hCG (Gonadotropina Coriónica)', 'LH'],
      c: 2,
      e: 'La hCG es producida por el trofoblasto tras la implantación y mantiene el cuerpo lúteo.'
    },
    {
      q: '¿En qué día ocurre aproximadamente la implantación?',
      a: ['Día 1', 'Día 6-7', 'Día 14', 'Día 28'],
      c: 1,
      e: 'La implantación comienza alrededor del sexto o séptimo día después de la fecundación.'
    }
  ]
};

// --- TYPES & INTERFACES ---

interface Point { x: number; y: number; }
interface Size { w: number; h: number; }

class Entity {
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number = 0;
  vy: number = 0;
  hp: number = 100;
  maxHp: number = 100;
  active: boolean = true;
  type: string;

  constructor(x: number, y: number, w: number, h: number, type: string) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.type = type;
  }

  update(dt: number) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
  }

  render(ctx: CanvasRenderingContext2D) {
    // Override in subclasses
  }

  getBounds() {
    return { x: this.x - this.w / 2, y: this.y - this.h / 2, w: this.w, h: this.h };
  }
}

class Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;

  constructor(x: number, y: number, vx: number, vy: number, life: number, color: string, size: number) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.life = life;
    this.maxLife = life;
    this.color = color;
    this.size = size;
  }

  update(dt: number) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.life -= dt;
  }

  render(ctx: CanvasRenderingContext2D) {
    const alpha = Math.max(0, this.life / this.maxLife);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

// --- GAME ENGINE COMPONENT ---

export default function App() {
  // State
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [currentLevel, setCurrentLevel] = useState<LevelID>(LevelID.SPERMATOGENESIS);
  const [score, setScore] = useState(0);
  const [highScores, setHighScores] = useState<Record<number, number>>({});
  const [unlockedLevels, setUnlockedLevels] = useState<number[]>([1]);
  const [achievements, setAchievements] = useState<string[]>([]);
  const [settings, setSettings] = useState({ music: 50, sfx: 70, particles: 'High' });
  const [quizActive, setQuizActive] = useState(false);
  const [quizQuestionIdx, setQuizQuestionIdx] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [showEncyclopedia, setShowEncyclopedia] = useState(false);
  const [encyclopediaEntry, setEncyclopediaEntry] = useState<any>(null);

  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<any>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const lastTimeRef = useRef<number>(0);
  const lastDtRef = useRef<number>(0.016);
  const inputRef = useRef<Record<string, boolean>>({});
  const gameStateRef = useRef<GameState>(GameState.MENU);

  // Sync ref with state
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  // --- AUDIO SYSTEM ---
  const initAudio = () => {
    if (audioCtxRef.current) return;
    try {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.error('AudioContext not supported', e);
    }
  };

  const playSound = (type: 'collect' | 'hit' | 'win' | 'click') => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    const vol = (settings.sfx / 100) * 0.2;

    if (type === 'collect') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.1);
      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === 'hit') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.2);
      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    } else if (type === 'win') {
      osc.type = 'triangle';
      [523.25, 659.25, 783.99, 1046.50].forEach((f, i) => {
        const t = now + i * 0.1;
        osc.frequency.setValueAtTime(f, t);
      });
      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
      osc.start(now);
      osc.stop(now + 0.5);
    } else if (type === 'click') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
    }
  };

  // --- RESIZE HANDLER ---
  useEffect(() => {
    const updateCanvasSize = () => {
      if (canvasRef.current && containerRef.current) {
        canvasRef.current.width = containerRef.current.clientWidth;
        canvasRef.current.height = containerRef.current.clientHeight;
      }
    };

    const observer = new ResizeObserver(updateCanvasSize);
    if (containerRef.current) observer.observe(containerRef.current);
    updateCanvasSize();

    return () => observer.disconnect();
  }, []);

  // --- GAME LOGIC ---
  const initLevel = useCallback((levelId: LevelID) => {
    console.log("Initializing level:", levelId);
    const canvas = canvasRef.current;
    if (!canvas) {
      console.error("Canvas not found during initLevel!");
      return;
    }

    // Level-specific visual configurations
    let bgColor = '#0a0a1a';
    let gridColor = 'rgba(0, 229, 255, 0.05)';
    let worldWidth = 3000;
    
    switch(levelId) {
      case LevelID.SPERMATOGENESIS:
        bgColor = '#0a0a2a'; // Deep blue
        gridColor = 'rgba(0, 100, 255, 0.1)';
        break;
      case LevelID.OOGENESIS:
        bgColor = '#2a0a1a'; // Deep pink/purple
        gridColor = 'rgba(255, 0, 100, 0.1)';
        break;
      case LevelID.SPERM_JOURNEY:
        bgColor = '#2a0505'; // Deep red (uterine)
        gridColor = 'rgba(255, 50, 50, 0.1)';
        worldWidth = 5000; // Longer journey
        break;
      case LevelID.FERTILIZATION:
        bgColor = '#1a1a05'; // Golden/dark (fallopian)
        gridColor = 'rgba(255, 200, 0, 0.1)';
        worldWidth = 4000;
        break;
    }

    const world = {
      width: worldWidth,
      height: canvas.height || 600,
      player: new Entity(150, (canvas.height || 600) / 2, 45, 25, 'player'),
      entities: [] as Entity[],
      particles: [] as Particle[],
      camera: { x: 0, y: 0 },
      atp: 100,
      maxAtp: 100,
      infoCollected: 0,
      totalInfo: levelId === LevelID.FERTILIZATION ? 3 : 5,
      timer: 0,
      isComplete: false,
      isStarted: false,
      bgColor,
      gridColor,
      hasOocyte: levelId === LevelID.FERTILIZATION,
      oocytePos: { x: worldWidth - 400, y: (canvas.height || 600) / 2 }
    };

    // Add items
    for (let i = 0; i < world.totalInfo; i++) {
      const x = 500 + i * (world.width / (world.totalInfo + 1)) + Math.random() * 100;
      const y = 150 + Math.random() * (world.height - 300);
      world.entities.push(new Entity(x, y, 35, 35, 'info'));
    }

    // Add obstacles
    const obstacleCount = levelId === LevelID.SPERM_JOURNEY ? 25 : 15;
    for (let i = 0; i < obstacleCount; i++) {
      const x = 600 + Math.random() * (world.width - 1000);
      const h = 120 + Math.random() * 100;
      const y = Math.random() < 0.5 ? h / 2 : world.height - h / 2;
      const type = levelId === LevelID.SPERM_JOURNEY && Math.random() > 0.6 ? 'enemy' : 'obstacle';
      world.entities.push(new Entity(x, y, 50, h, type));
    }

    engineRef.current = world;
    setScore(0);
  }, []);

  const update = (dt: number) => {
    const world = engineRef.current;
    if (!world || gameStateRef.current !== GameState.PLAYING) return;

    world.timer += dt;

    // Player Input - Using both code and key for maximum compatibility
    const p = world.player;
    const speed = 400; 
    
    const keys = inputRef.current;
    
    // Simplified start logic
    if (!world.isStarted) {
      const hasInput = keys['ArrowUp'] || keys['KeyW'] || keys['ArrowDown'] || keys['KeyS'] || 
                       keys['ArrowLeft'] || keys['KeyA'] || keys['ArrowRight'] || keys['KeyD'] || keys['Space'];
      if (hasInput) {
        world.isStarted = true;
        console.log("Game Started! Input detected.");
      }
    }

    p.vx = 0;
    p.vy = 0;
    
    if (keys['ArrowUp'] || keys['KeyW'] || keys['w'] || keys['W']) p.vy = -speed;
    if (keys['ArrowDown'] || keys['KeyS'] || keys['s'] || keys['S']) p.vy = speed;
    if (keys['ArrowLeft'] || keys['KeyA'] || keys['a'] || keys['A']) p.vx = -speed;
    if (keys['ArrowRight'] || keys['KeyD'] || keys['d'] || keys['D']) p.vx = speed;

    // Sprint
    if (keys['Space'] && world.atp > 5) {
      p.vx *= 1.8;
      p.vy *= 1.8;
      world.atp -= 30 * dt;
    } else {
      world.atp = Math.min(world.maxAtp, world.atp + 10 * dt);
    }

    // Direct position update to be safe
    if (world.isStarted) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      
      // Debug log every 60 frames approx
      if (Math.floor(world.timer * 60) % 60 === 0) {
        console.log(`Player Pos: ${Math.round(p.x)}, ${Math.round(p.y)} | Vel: ${p.vx}, ${p.vy} | dt: ${dt.toFixed(4)}`);
      }
    } else {
      // Idle bobbing
      p.y += Math.sin(world.timer * 2) * 0.5;
    }

    // World boundaries
    p.x = Math.max(p.w / 2, Math.min(world.width - p.w / 2, p.x));
    p.y = Math.max(p.h / 2, Math.min(world.height - p.h / 2, p.y));

    // Camera follow with smoothing
    const canvas = canvasRef.current!;
    const targetCamX = p.x - canvas.width / 3; // Keep player on the left third
    world.camera.x += (targetCamX - world.camera.x) * 0.1;
    world.camera.x = Math.max(0, Math.min(world.width - canvas.width, world.camera.x));
    
    // ... (rest of update logic: entities, collisions, particles)

    // Entities
    world.entities.forEach((e: Entity) => {
      if (!e.active) return;
      e.update(dt);

      // Simple AI for enemies
      if (e.type === 'enemy') {
        const dx = p.x - e.x;
        const dy = p.y - e.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 300) {
          e.vx = (dx / dist) * 80;
          e.vy = (dy / dist) * 80;
        }
      }

      // Collision detection
      const b1 = p.getBounds();
      const b2 = e.getBounds();
      if (b1.x < b2.x + b2.w && b1.x + b1.w > b2.x && b1.y < b2.y + b2.h && b1.y + b1.h > b2.y) {
        if (e.type === 'info') {
          e.active = false;
          world.infoCollected++;
          setScore(s => s + 100);
          playSound('collect');
          // Spawn particles
          for (let i = 0; i < 10; i++) {
            world.particles.push(new Particle(e.x, e.y, (Math.random() - 0.5) * 200, (Math.random() - 0.5) * 200, 0.5, '#00e5ff', 3));
          }
        } else if (e.type === 'obstacle' || e.type === 'enemy') {
          p.hp -= 10 * dt;
          if (Math.random() < 0.1) playSound('hit');
          if (p.hp <= 0) {
            setGameState(GameState.GAME_OVER);
          }
        }
      }
    });

    // Particles
    world.particles = world.particles.filter((part: Particle) => {
      part.update(dt);
      return part.life > 0;
    });

    // Win condition
    const winThreshold = world.hasOocyte ? world.oocytePos.x - 100 : world.width - 100;
    if (world.infoCollected >= world.totalInfo && p.x > winThreshold) {
      if (world.hasOocyte) {
        // Special fertilization effect
        for (let i = 0; i < 15; i++) {
          world.particles.push(new Particle(p.x, p.y, (Math.random() - 0.5) * 400, (Math.random() - 0.5) * 400, 1.5, '#fff', 6));
        }
      }
      world.isComplete = true;
      setGameState(GameState.LEVEL_SUMMARY);
      playSound('win');
      
      // Unlock next level
      const nextLevel = currentLevel + 1;
      if (nextLevel <= 5 && !unlockedLevels.includes(nextLevel)) {
        setUnlockedLevels(prev => [...prev, nextLevel]);
      }
    }
  };

  const render = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const world = engineRef.current;
    if (!world) return;

    // Clear
    ctx.fillStyle = world.bgColor || '#0a0a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(-world.camera.x, -world.camera.y);

    // Background Grid for movement reference
    ctx.strokeStyle = world.gridColor || 'rgba(0, 229, 255, 0.05)';
    ctx.lineWidth = 1;
    const gridSize = 100;
    for (let x = 0; x < world.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, world.height);
      ctx.stroke();
    }
    for (let y = 0; y < world.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(world.width, y);
      ctx.stroke();
    }

    // Background Parallax
    ctx.fillStyle = 'rgba(26, 10, 62, 0.5)';
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.arc((i * 500 + world.camera.x * 0.5) % world.width, 300, 100, 0, Math.PI * 2);
      ctx.fill();
    }

    // Entities
    world.entities.forEach((e: Entity) => {
      if (!e.active) return;
      
      if (e.type === 'info') {
        ctx.fillStyle = '#ffd700';
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#ffd700';
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.w / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      } else if (e.type === 'obstacle') {
        ctx.fillStyle = '#ff1744';
        ctx.fillRect(e.x - e.w / 2, e.y - e.h / 2, e.w, e.h);
      } else if (e.type === 'enemy') {
        ctx.fillStyle = '#ff8a80';
        ctx.beginPath();
        // Ameboid shape
        const time = Date.now() / 200;
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2;
          const r = e.w / 2 + Math.sin(time + i) * 5;
          const px = e.x + Math.cos(angle) * r;
          const py = e.y + Math.sin(angle) * r;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
      }
    });

    // Player
    const p = world.player;
    
    // Debug Info
    if (world.isStarted) {
      ctx.fillStyle = 'rgba(0, 255, 255, 0.8)';
      ctx.font = 'bold 12px monospace';
      ctx.fillText(`POS: ${Math.round(p.x)}, ${Math.round(p.y)}`, 20, 30);
      ctx.fillText(`FPS: ${Math.round(1/lastDtRef.current)}`, 20, 50);
      ctx.fillText(`STATE: ${gameStateRef.current}`, 20, 70);
      ctx.fillText(`VEL: ${Math.round(p.vx)}, ${Math.round(p.vy)}`, 20, 90);
    } else {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.font = 'bold 16px monospace';
      ctx.textAlign = 'center';
      ctx.fillText("PULSA WASD O FLECHAS PARA COMENZAR", canvas.width / 2, canvas.height / 2 + 100);
      ctx.textAlign = 'left';
    }

    ctx.save();
    ctx.translate(p.x, p.y);
    const angle = Math.atan2(p.vy, p.vx || 1);
    ctx.rotate(angle);

    // Sperm head
    ctx.fillStyle = '#e0f0ff';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#00e5ff';
    ctx.beginPath();
    ctx.ellipse(0, 0, p.w / 2, p.h / 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Sperm tail
    ctx.strokeStyle = '#e0f0ff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-p.w / 2, 0);
    const time = Date.now() / 100;
    for (let i = 0; i < 40; i++) {
      const tx = -p.w / 2 - i;
      const ty = Math.sin(time + i * 0.2) * (i * 0.5);
      ctx.lineTo(tx, ty);
    }
    ctx.stroke();
    ctx.restore();

    // Goal indicator or Oocyte
    if (world.hasOocyte) {
      const op = world.oocytePos;
      // Glow
      const grad = ctx.createRadialGradient(op.x, op.y, 50, op.x, op.y, 250);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
      grad.addColorStop(0.2, 'rgba(255, 200, 0, 0.4)');
      grad.addColorStop(1, 'rgba(255, 100, 0, 0)');
      
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(op.x, op.y, 250, 0, Math.PI * 2);
      ctx.fill();

      // Oocyte body
      ctx.fillStyle = '#fff9e6';
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.arc(op.x, op.y, 150, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Zona Pelucida
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 20;
      ctx.beginPath();
      ctx.arc(op.x, op.y, 170, 0, Math.PI * 2);
      ctx.stroke();

      // Nucleus
      ctx.fillStyle = 'rgba(255, 200, 0, 0.2)';
      ctx.beginPath();
      ctx.arc(op.x - 20, op.y - 20, 60, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = 'rgba(0, 229, 118, 0.3)';
      ctx.fillRect(world.width - 100, 0, 100, world.height);
    }

    ctx.restore();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { 
      inputRef.current[e.code] = true; 
      inputRef.current[e.key] = true; // Also store key for compatibility
      if (e.code === 'KeyP' || e.code === 'Escape') togglePause(); 
    };
    const handleKeyUp = (e: KeyboardEvent) => { 
      inputRef.current[e.code] = false; 
      inputRef.current[e.key] = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const loop = (timestamp: number) => {
      try {
        if (!lastTimeRef.current) {
          lastTimeRef.current = timestamp;
          requestAnimationFrame(loop);
          return;
        }
        const dt = Math.min((timestamp - lastTimeRef.current) / 1000, 0.1);
        lastTimeRef.current = timestamp;
        lastDtRef.current = dt;

        if (gameStateRef.current === GameState.PLAYING) {
          update(dt);
          render();
        }
      } catch (err) {
        console.error("Error in game loop:", err);
      }
      requestAnimationFrame(loop);
    };

    const animId = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(animId);
    };
  }, [gameState, currentLevel]);

  // --- UI HANDLERS ---

  const startGame = (levelId: LevelID = LevelID.SPERMATOGENESIS) => {
    initAudio();
    lastTimeRef.current = 0; // Reset timer to avoid huge dt
    setCurrentLevel(levelId);
    initLevel(levelId);
    setGameState(GameState.PLAYING);
    playSound('click');
    
    // Focus canvas after a short delay to ensure it's rendered
    setTimeout(() => {
      canvasRef.current?.focus();
    }, 100);
  };

  const togglePause = () => {
    setGameState(prev => prev === GameState.PLAYING ? GameState.PAUSED : GameState.PLAYING);
    playSound('click');
  };

  const handleQuizSubmit = (correct: boolean) => {
    if (correct) {
      setQuizScore(s => s + 1);
      setScore(s => s + 500);
    }
    
    const nextIdx = quizQuestionIdx + 1;
    const levelQuestions = QUIZ_DATA[currentLevel] || [];
    
    if (nextIdx < levelQuestions.length) {
      setQuizQuestionIdx(nextIdx);
    } else {
      setQuizActive(false);
      setGameState(GameState.LEVEL_SUMMARY);
    }
  };

  // --- RENDER HELPERS ---

  const renderMenu = () => (
    <div className="flex flex-col items-center justify-center h-full space-y-8 bg-gradient-to-b from-[#0a0a2e] to-[#1a0a3e] p-8 text-white">
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center"
      >
        <h1 className="text-6xl font-bold tracking-tighter mb-2 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500">
          GÉNESIS
        </h1>
        <p className="text-xl italic text-cyan-200 opacity-80">El Viaje de la Vida</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        <div className="grid grid-cols-1 gap-4">
          <MenuButton icon={<Play />} label="NUEVA PARTIDA" onClick={() => setGameState(GameState.LEVEL_SELECT)} />
          <MenuButton icon={<Book />} label="ENCICLOPEDIA" onClick={() => setGameState(GameState.ENCYCLOPEDIA)} />
          <MenuButton icon={<Settings />} label="AJUSTES" onClick={() => setGameState(GameState.SETTINGS)} />
          <MenuButton icon={<Info />} label="CRÉDITOS" onClick={() => setGameState(GameState.CREDITS)} />
        </div>

        <div className="bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-md">
          <h3 className="text-xl font-bold mb-4 flex items-center space-x-2 text-cyan-400">
            <Target size={20} />
            <span>CÓMO JUGAR</span>
          </h3>
          <div className="space-y-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="opacity-60">Moverse</span>
              <span className="bg-white/20 px-2 py-1 rounded font-mono text-xs">WASD / FLECHAS</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="opacity-60">Sprint (ATP)</span>
              <span className="bg-white/20 px-2 py-1 rounded font-mono text-xs">ESPACIO</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="opacity-60">Pausar</span>
              <span className="bg-white/20 px-2 py-1 rounded font-mono text-xs">ESC / P</span>
            </div>
            <div className="pt-4 border-t border-white/10">
              <p className="text-xs italic opacity-80 leading-relaxed">
                Recoge las esferas doradas de información para avanzar y llegar a la zona de meta (derecha).
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 right-4 text-xs opacity-30">v1.0.1 | © 2026 Biología Digital</div>
    </div>
  );

  const renderLevelSelect = () => (
    <div className="flex flex-col items-center justify-center h-full bg-[#0a0a2e] p-8 text-white">
      <h2 className="text-3xl font-bold mb-8">SELECCIONA NIVEL</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
        {[1, 2, 3, 4, 5].map(lvl => {
          const isUnlocked = unlockedLevels.includes(lvl);
          return (
            <motion.div
              key={lvl}
              whileHover={isUnlocked ? { scale: 1.05 } : {}}
              className={`relative p-6 rounded-2xl border-2 transition-all cursor-pointer ${
                isUnlocked ? 'border-cyan-500 bg-cyan-900/20' : 'border-gray-700 bg-gray-900/50 grayscale'
              }`}
              onClick={() => isUnlocked && startGame(lvl as LevelID)}
            >
              <div className="text-4xl font-black mb-2 opacity-20">0{lvl}</div>
              <h3 className="text-xl font-bold mb-1">
                {lvl === 1 && "El Despertar"}
                {lvl === 2 && "El Jardín Interior"}
                {lvl === 3 && "La Gran Carrera"}
                {lvl === 4 && "La Fortaleza"}
                {lvl === 5 && "Nueva Vida"}
              </h3>
              <p className="text-xs text-cyan-300 opacity-70">
                {lvl === 1 && "Espermatogénesis"}
                {lvl === 2 && "Ovogénesis"}
                {lvl === 3 && "El Viaje"}
                {lvl === 4 && "Fecundación"}
                {lvl === 5 && "Desarrollo"}
              </p>
              {!isUnlocked && <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-2xl">🔒</div>}
            </motion.div>
          );
        })}
      </div>
      <button 
        className="mt-12 flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
        onClick={() => setGameState(GameState.MENU)}
      >
        <ChevronLeft size={20} />
        <span>VOLVER AL MENÚ</span>
      </button>
    </div>
  );

  const renderHUD = () => {
    const world = engineRef.current;
    if (!world) return null;
    return (
      <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between text-white font-mono">
        <div className="flex justify-between items-start">
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="flex space-x-1">
                {[1, 2, 3].map(i => (
                  <Heart key={i} size={24} fill={i <= 3 ? "#ff1744" : "none"} color="#ff1744" />
                ))}
              </div>
              <div className="w-48 h-4 bg-gray-800 rounded-full overflow-hidden border border-white/20">
                <div 
                  className="h-full bg-gradient-to-r from-red-500 to-green-500 transition-all" 
                  style={{ width: `${world.player.hp}%` }}
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Zap size={20} color="#00e5ff" />
              <div className="w-48 h-2 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-cyan-400 transition-all" 
                  style={{ width: `${world.atp}%` }}
                />
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-3xl font-bold text-cyan-400">{score.toLocaleString()}</div>
            <div className="text-xs opacity-50 uppercase tracking-widest">PUNTUACIÓN TOTAL</div>
          </div>
        </div>

        <div className="flex justify-between items-end">
          <div className="bg-black/40 p-4 rounded-xl border border-white/10 backdrop-blur-sm max-w-xs">
            <div className="flex items-center space-x-2 mb-2">
              <Info size={16} className="text-cyan-400" />
              <span className="text-xs font-bold uppercase">Dato Científico</span>
            </div>
            <p className="text-xs leading-relaxed opacity-80">
              {currentLevel === 1 && "Las espermatogonias son células diploides que se dividen para mantener la población de células madre."}
              {currentLevel === 3 && "El pH de la vagina es ácido (3.8-4.5), lo que sirve como barrera protectora contra infecciones."}
              {!currentLevel && "Cargando datos..."}
            </p>
          </div>

          <div className="flex flex-col items-center space-y-4 pointer-events-auto">
            {!world.isStarted && (
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-cyan-500/20 border border-cyan-500 p-4 rounded-2xl backdrop-blur-md text-center mb-4"
              >
                <p className="text-cyan-400 font-bold mb-1">¿LISTO PARA EL VIAJE?</p>
                <p className="text-[10px] opacity-80">Pulsa cualquier tecla de movimiento para empezar</p>
              </motion.div>
            )}
            <div className="text-[10px] opacity-40 uppercase tracking-tighter mb-1">WASD para mover | ESPACIO sprint</div>
            <div className="flex items-center space-x-2 bg-black/60 px-4 py-2 rounded-full border border-cyan-500/30">
              <Target size={16} className="text-cyan-400" />
              <span className="text-sm font-bold">{world.infoCollected} / {world.totalInfo}</span>
            </div>
            <button 
              className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all backdrop-blur-md"
              onClick={togglePause}
            >
              <Pause size={24} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderLevelSummary = () => {
    const world = engineRef.current;
    return (
      <div className="flex items-center justify-center h-full bg-black/80 backdrop-blur-xl p-8 text-white">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-[#1a0a3e] p-10 rounded-3xl border-2 border-cyan-500/50 max-w-2xl w-full text-center"
        >
          <h2 className="text-4xl font-black mb-2 text-cyan-400">¡NIVEL COMPLETADO!</h2>
          <div className="text-6xl font-bold mb-8">⭐ A</div>
          
          <div className="grid grid-cols-2 gap-6 mb-10 text-left">
            <div className="bg-white/5 p-4 rounded-xl">
              <div className="text-xs opacity-50 uppercase">Puntuación</div>
              <div className="text-2xl font-bold">{score}</div>
            </div>
            <div className="bg-white/5 p-4 rounded-xl">
              <div className="text-xs opacity-50 uppercase">Tiempo</div>
              <div className="text-2xl font-bold">{Math.floor(world?.timer || 0)}s</div>
            </div>
          </div>

          <div className="space-y-4">
            <button 
              className="w-full py-4 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl transition-all flex items-center justify-center space-x-2"
              onClick={() => {
                setQuizActive(true);
                setQuizQuestionIdx(0);
                setQuizScore(0);
                setGameState(GameState.QUIZ);
              }}
            >
              <span>CONTINUAR AL QUIZ</span>
              <ChevronRight size={20} />
            </button>
            <button 
              className="w-full py-4 bg-white/10 hover:bg-white/20 font-bold rounded-xl transition-all"
              onClick={() => setGameState(GameState.LEVEL_SELECT)}
            >
              VOLVER A NIVELES
            </button>
          </div>
        </motion.div>
      </div>
    );
  };

  const renderQuiz = () => {
    const levelQuestions = QUIZ_DATA[currentLevel] || [];
    const q = levelQuestions[quizQuestionIdx];
    if (!q) return null;

    return (
      <div className="flex items-center justify-center h-full bg-[#0a0a2e] p-8 text-white">
        <motion.div 
          key={quizQuestionIdx}
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="max-w-xl w-full"
        >
          <div className="flex justify-between items-center mb-8">
            <span className="text-cyan-400 font-bold">PREGUNTA {quizQuestionIdx + 1} / {levelQuestions.length}</span>
            <span className="text-xs opacity-50">NIVEL {currentLevel}</span>
          </div>
          
          <h3 className="text-2xl font-bold mb-8 leading-tight">{q.q}</h3>
          
          <div className="space-y-3">
            {q.a.map((opt, i) => (
              <button
                key={i}
                className="w-full p-5 text-left bg-white/5 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-500 rounded-2xl transition-all group"
                onClick={() => handleQuizSubmit(i === q.c)}
              >
                <div className="flex items-center justify-between">
                  <span>{opt}</span>
                  <ChevronRight size={18} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    );
  };

  const renderEncyclopedia = () => (
    <div className="flex flex-col h-full bg-[#0a0a2e] text-white overflow-hidden">
      <div className="p-8 border-b border-white/10 flex justify-between items-center">
        <h2 className="text-3xl font-bold flex items-center space-x-3">
          <Book className="text-cyan-400" />
          <span>ENCICLOPEDIA DE LA VIDA</span>
        </h2>
        <button onClick={() => setGameState(GameState.MENU)} className="p-2 hover:bg-white/10 rounded-full">
          <X />
        </button>
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        <div className="w-1/3 border-r border-white/10 overflow-y-auto p-4 space-y-2">
          {ENCYCLOPEDIA_DATA.map(entry => (
            <button
              key={entry.id}
              className={`w-full p-4 text-left rounded-xl transition-all ${
                encyclopediaEntry?.id === entry.id ? 'bg-cyan-500 text-black' : 'hover:bg-white/5'
              }`}
              onClick={() => setEncyclopediaEntry(entry)}
            >
              <div className="text-xs opacity-50 uppercase mb-1">{entry.category}</div>
              <div className="font-bold">{entry.title}</div>
            </button>
          ))}
        </div>
        
        <div className="flex-1 p-12 overflow-y-auto">
          {encyclopediaEntry ? (
            <motion.div 
              key={encyclopediaEntry.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl"
            >
              <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-xs font-bold uppercase tracking-widest">
                {encyclopediaEntry.category}
              </span>
              <h3 className="text-5xl font-black mt-4 mb-8">{encyclopediaEntry.title}</h3>
              <p className="text-xl leading-relaxed opacity-80 mb-10">
                {encyclopediaEntry.content}
              </p>
              <div className="bg-white/5 p-6 rounded-2xl border-l-4 border-cyan-500">
                <div className="text-cyan-400 font-bold mb-2 flex items-center space-x-2">
                  <AlertCircle size={18} />
                  <span>Dato Curioso</span>
                </div>
                <p className="italic opacity-90">{encyclopediaEntry.fact}</p>
              </div>
            </motion.div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center opacity-20">
              <Book size={64} className="mb-4" />
              <p>Selecciona un tema para aprender</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div ref={containerRef} className="relative w-full h-screen bg-black overflow-hidden select-none">
      {/* Game Canvas */}
      <canvas 
        ref={canvasRef}
        tabIndex={0}
        width={window.innerWidth}
        height={window.innerHeight}
        className={`w-full h-full outline-none ${gameState === GameState.PLAYING ? 'block' : 'hidden'}`}
      />

      {/* UI Overlays */}
      <AnimatePresence mode="wait">
        {gameState === GameState.MENU && (
          <motion.div key="menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0">
            {renderMenu()}
          </motion.div>
        )}
        {gameState === GameState.LEVEL_SELECT && (
          <motion.div key="levels" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0">
            {renderLevelSelect()}
          </motion.div>
        )}
        {gameState === GameState.PLAYING && (
          <motion.div key="hud" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0">
            {renderHUD()}
          </motion.div>
        )}
        {gameState === GameState.PAUSED && (
          <motion.div key="pause" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-[#1a0a3e] p-8 rounded-3xl border border-white/10 w-64 space-y-4">
              <h2 className="text-2xl font-bold text-center mb-6">PAUSA</h2>
              <MenuButton icon={<Play />} label="REANUDAR" onClick={togglePause} />
              <MenuButton icon={<RotateCcw />} label="REINICIAR" onClick={() => startGame(currentLevel)} />
              <MenuButton icon={<Home />} label="SALIR" onClick={() => setGameState(GameState.MENU)} />
            </div>
          </motion.div>
        )}
        {gameState === GameState.LEVEL_SUMMARY && (
          <motion.div key="summary" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-50">
            {renderLevelSummary()}
          </motion.div>
        )}
        {gameState === GameState.QUIZ && (
          <motion.div key="quiz" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-50">
            {renderQuiz()}
          </motion.div>
        )}
        {gameState === GameState.ENCYCLOPEDIA && (
          <motion.div key="encyclopedia" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-50">
            {renderEncyclopedia()}
          </motion.div>
        )}
        {gameState === GameState.SETTINGS && (
          <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-50 flex items-center justify-center bg-[#0a0a2e]">
            <div className="max-w-md w-full p-8 space-y-8">
              <h2 className="text-3xl font-bold text-center">AJUSTES</h2>
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm opacity-70">
                    <span>Música</span>
                    <span>{settings.music}%</span>
                  </div>
                  <input 
                    type="range" 
                    className="w-full accent-cyan-500" 
                    value={settings.music} 
                    onChange={e => setSettings(s => ({ ...s, music: parseInt(e.target.value) }))} 
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm opacity-70">
                    <span>Efectos</span>
                    <span>{settings.sfx}%</span>
                  </div>
                  <input 
                    type="range" 
                    className="w-full accent-cyan-500" 
                    value={settings.sfx} 
                    onChange={e => setSettings(s => ({ ...s, sfx: parseInt(e.target.value) }))} 
                  />
                </div>
              </div>
              <button 
                className="w-full py-4 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
                onClick={() => setGameState(GameState.MENU)}
              >
                GUARDAR Y VOLVER
              </button>
            </div>
          </motion.div>
        )}
        {gameState === GameState.GAME_OVER && (
          <motion.div key="gameover" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-red-950/90 backdrop-blur-md text-white">
            <h2 className="text-7xl font-black mb-4">FIN DEL VIAJE</h2>
            <p className="text-xl opacity-60 mb-12">La célula no pudo completar su misión biológica.</p>
            <div className="flex space-x-4">
              <button 
                className="px-8 py-4 bg-white text-black font-bold rounded-xl hover:scale-105 transition-all"
                onClick={() => startGame(currentLevel)}
              >
                REINTENTAR
              </button>
              <button 
                className="px-8 py-4 bg-white/10 font-bold rounded-xl hover:bg-white/20 transition-all"
                onClick={() => setGameState(GameState.MENU)}
              >
                MENÚ PRINCIPAL
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- SUBCOMPONENTS ---

function MenuButton({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="flex items-center space-x-4 p-4 bg-white/5 hover:bg-cyan-500 hover:text-black border border-white/10 rounded-xl transition-all group"
    >
      <div className="opacity-50 group-hover:opacity-100 transition-opacity">{icon}</div>
      <span className="font-bold tracking-widest text-sm">{label}</span>
    </button>
  );
}
