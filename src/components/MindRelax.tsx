import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Music, Play, Pause, Volume2, Wind, Sliders, Activity, Sparkles, RefreshCw, Layers, Compass, HelpCircle } from 'lucide-react';

interface AudioTrack {
  id: string;
  title: string;
  composer: string;
  notes: { f: number; d: number }[]; // Frequency list & duration scale
  desc: string;
  scaleType: string;
}

const PRESET_TRACKS: AudioTrack[] = [
  {
    id: 'bach',
    title: 'Prelude in C Major',
    composer: 'J.S. Bach (Ambient Synthesis)',
    desc: 'Mathematical arpeggiated flow. Promotes logical study clarity & fast neural rhythm coding.',
    scaleType: 'C Major Diatonic',
    notes: [
      { f: 261.63, d: 0.25 }, { f: 329.63, d: 0.25 }, { f: 392.00, d: 0.25 }, { f: 523.25, d: 0.25 }, { f: 659.25, d: 0.25 }, { f: 523.25, d: 0.25 }, { f: 659.25, d: 0.25 },
      { f: 261.63, d: 0.25 }, { f: 329.63, d: 0.25 }, { f: 392.00, d: 0.25 }, { f: 523.25, d: 0.25 }, { f: 659.25, d: 0.25 }, { f: 523.25, d: 0.25 }, { f: 659.25, d: 0.25 },
      { f: 261.63, d: 0.25 }, { f: 349.23, d: 0.25 }, { f: 440.00, d: 0.25 }, { f: 554.37, d: 0.25 }, { f: 698.46, d: 0.25 }, { f: 554.37, d: 0.25 }, { f: 698.46, d: 0.25 },
      { f: 261.63, d: 0.25 }, { f: 349.23, d: 0.25 }, { f: 440.00, d: 0.25 }, { f: 554.37, d: 0.25 }, { f: 698.46, d: 0.25 }, { f: 554.37, d: 0.25 }, { f: 698.46, d: 0.25 },
      { f: 246.94, d: 0.25 }, { f: 293.66, d: 0.25 }, { f: 392.00, d: 0.25 }, { f: 493.88, d: 0.25 }, { f: 587.33, d: 0.25 }, { f: 493.88, d: 0.25 }, { f: 587.33, d: 0.25 },
      { f: 246.94, d: 0.25 }, { f: 293.66, d: 0.25 }, { f: 392.00, d: 0.25 }, { f: 493.88, d: 0.25 }, { f: 587.33, d: 0.25 }, { f: 493.88, d: 0.25 }, { f: 587.33, d: 0.25 },
    ]
  },
  {
    id: 'moonlight',
    title: 'Moonlight Sonata',
    composer: 'L. van Beethoven (Nocturnal Pad)',
    desc: 'Deep meditative minor chords. Lowers cognitive stress and provides deep focused stillness.',
    scaleType: 'C# Minor Triplets',
    notes: [
      { f: 220.00, d: 0.4 }, { f: 293.66, d: 0.4 }, { f: 349.23, d: 0.4 },
      { f: 220.00, d: 0.4 }, { f: 293.66, d: 0.4 }, { f: 349.23, d: 0.4 },
      { f: 207.65, d: 0.4 }, { f: 277.18, d: 0.4 }, { f: 329.63, d: 0.4 },
      { f: 207.65, d: 0.4 }, { f: 277.18, d: 0.4 }, { f: 329.63, d: 0.4 },
      { f: 196.00, d: 0.4 }, { f: 246.94, d: 0.4 }, { f: 311.13, d: 0.4 },
      { f: 196.00, d: 0.4 }, { f: 246.94, d: 0.4 }, { f: 311.13, d: 0.4 },
    ]
  },
  {
    id: 'tizita',
    title: 'Highlands Tizita Meditation',
    composer: 'Ethiopian Ambient Folk Pentatonic',
    desc: 'Curated traditional pentatonic scale loops. Uplifting, highly nostalgic, and intensely focusing.',
    scaleType: 'Tizita Pentatonic Scale',
    notes: [
      { f: 261.63, d: 0.5 }, { f: 293.66, d: 0.5 }, { f: 329.63, d: 1.0 },
      { f: 392.00, d: 0.5 }, { f: 440.00, d: 0.5 }, { f: 523.25, d: 1.0 },
      { f: 440.00, d: 0.5 }, { f: 392.00, d: 0.5 }, { f: 329.63, d: 1.0 },
      { f: 293.66, d: 0.5 }, { f: 261.63, d: 0.5 }, { f: 196.00, d: 1.2 },
    ]
  },
  {
    id: 'chopin',
    title: 'Nocturne Room',
    composer: 'Frédéric Chopin (Lo-Fi Resonance)',
    desc: 'Lush, expressive spatial chord layers. Perfect to read and write without lyrical distraction.',
    scaleType: 'Flat Major Expressive',
    notes: [
      { f: 311.13, d: 0.6 }, { f: 466.16, d: 0.6 }, { f: 587.33, d: 0.6 }, { f: 622.25, d: 1.2 },
      { f: 293.66, d: 0.6 }, { f: 440.00, d: 0.6 }, { f: 554.37, d: 0.6 }, { f: 587.33, d: 1.2 },
      { f: 261.63, d: 0.6 }, { f: 392.00, d: 0.6 }, { f: 493.88, d: 0.6 }, { f: 523.25, d: 1.2 },
    ]
  }
];

export default function MindRelax() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<AudioTrack>(PRESET_TRACKS[0]);
  const [tempo, setTempo] = useState<number>(100); // Percentage duration speed scale

  // Sublayer sliders
  const [ambientVolume, setAmbientVolume] = useState<number>(0.2); // 528hz Fork
  const [rainVolume, setRainVolume] = useState<number>(0.15);
  const [fireVolume, setFireVolume] = useState<number>(0.1);
  const [windVolume, setWindVolume] = useState<number>(0.05);

  const [activeNoteLabel, setActiveNoteLabel] = useState<string>('Ready to Synthesize');
  const [activeFrequency, setActiveFrequency] = useState<number>(0);
  const [synthesizedLinesPlayed, setSynthesizedLinesPlayed] = useState<number>(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Web Audio handles
  const audioCtxRef = useRef<AudioContext | null>(null);
  const mainGainRef = useRef<GainNode | null>(null);
  const schedulerTimerId = useRef<number | null>(null);
  const currentNoteIndex = useRef<number>(0);

  // Noise oscillators for effects
  const generatorNodesRef = useRef<{
    fork?: OscillatorNode;
    forkGain?: GainNode;
    rain?: AudioWorkletNode | ScriptProcessorNode;
    rainGain?: GainNode;
    fire?: ScriptProcessorNode;
    fireGain?: GainNode;
    wind?: BiquadFilterNode;
    windOsc?: OscillatorNode;
    windGain?: GainNode;
  }>({});

  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    // Canvas animation loop mapping frequencies and times
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.width = canvas.parentElement?.clientWidth || 400;
    let height = canvas.height = 110;

    const resizeObserver = new ResizeObserver(() => {
      if (canvas && canvas.parentElement) {
        width = canvas.width = canvas.parentElement.clientWidth || 400;
        ctx.lineCap = 'round';
      }
    });
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    const bufferLength = analyserRef.current ? analyserRef.current.frequencyBinCount : 256;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);
      ctx.clearRect(0, 0, width, height);

      if (analyserRef.current) {
        analyserRef.current.getByteTimeDomainData(dataArray);
      }

      ctx.lineWidth = 2.5;
      // High contrast beautiful purple gradients based on the interactive accent
      const gradient = ctx.createLinearGradient(0, 0, width, 0);
      gradient.addColorStop(0, '#7C3AED');
      gradient.addColorStop(0.5, '#A855F7');
      gradient.addColorStop(1, '#EC4899');
      ctx.strokeStyle = gradient;

      ctx.beginPath();
      const sliceWidth = width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        // Let scale bounce depending on active track playing status
        const bounceScale = isPlaying ? 1 : 0.05;
        const y = (v * (height / 2)) * bounceScale + (height / 2) * (1 - bounceScale);

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.lineTo(width, height / 2);
      ctx.stroke();

      // Subtle dynamic particle bursts on high energy
      if (isPlaying && Math.random() > 0.85) {
        ctx.fillStyle = 'rgba(168, 85, 247, 0.4)';
        ctx.beginPath();
        ctx.arc(Math.random() * width, Math.random() * height, Math.random() * 3 + 1, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    draw();

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      resizeObserver.disconnect();
    };
  }, [isPlaying]);

  // Handle setting updates on sliders in real-time
  useEffect(() => {
    const nodes = generatorNodesRef.current;
    if (nodes.forkGain) nodes.forkGain.gain.value = ambientVolume;
    if (nodes.rainGain) nodes.rainGain.gain.value = rainVolume * 0.4;
    if (nodes.fireGain) nodes.fireGain.gain.value = fireVolume * 0.2;
    if (nodes.windGain) nodes.windGain.gain.value = windVolume * 0.5;
  }, [ambientVolume, rainVolume, fireVolume, windVolume]);

  const getAudioContext = (): AudioContext => {
    if (!audioCtxRef.current) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioCtxClass();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  const initSynthesizers = () => {
    try {
      const ctx = getAudioContext();
      
      // Top Level routing
      mainGainRef.current = ctx.createGain();
      mainGainRef.current.gain.value = 0.8; // Lower slightly for headroom

      analyserRef.current = ctx.createAnalyser();
      analyserRef.current.fftSize = 512;

      mainGainRef.current.connect(analyserRef.current);
      analyserRef.current.connect(ctx.destination);

      const nodes = generatorNodesRef.current;

      // Create pristine spatial stereo feedback delay loop (The Cathedral Effect)
      const delayNode = ctx.createDelay(2.0);
      delayNode.delayTime.setValueAtTime(0.55, ctx.currentTime); // 550ms spacious echo pulse

      const delayFeedback = ctx.createGain();
      delayFeedback.gain.setValueAtTime(0.42, ctx.currentTime); // 42% feedback tail

      const delayFilter = ctx.createBiquadFilter();
      delayFilter.type = 'lowpass';
      delayFilter.frequency.setValueAtTime(450, ctx.currentTime); // successive repeats are filtered into dark warmth

      // Wire up delay route
      delayNode.connect(delayFilter);
      delayFilter.connect(delayFeedback);
      delayFeedback.connect(delayNode);
      delayNode.connect(mainGainRef.current);

      (nodes as any).delayNode = delayNode;
      (nodes as any).delayFeedback = delayFeedback;

      // 1. Cozy Solfeggio 528Hz continuous peaceful resonance generator (Filtered Sine wave)
      const forkOsc = ctx.createOscillator();
      forkOsc.type = 'sine';
      forkOsc.frequency.setValueAtTime(528.0, ctx.currentTime);
      
      const forkGain = ctx.createGain();
      forkGain.gain.setValueAtTime(ambientVolume * 0.5, ctx.currentTime); // soft smooth backdrop
      
      const forkFilter = ctx.createBiquadFilter();
      forkFilter.type = 'lowpass';
      forkFilter.frequency.setValueAtTime(400, ctx.currentTime); // remove sharp harmonics

      forkOsc.connect(forkFilter);
      forkFilter.connect(forkGain);
      forkGain.connect(mainGainRef.current);
      forkOsc.start();
      
      nodes.fork = forkOsc;
      nodes.forkGain = forkGain;

      // 2. Synthesized Rain (Noise script loop with warm cozy lowpass filter to prevent disturbance)
      const bufferSize = 256 * 1024; // larger loop for high-fidelity randomness
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const outputBuffer = noiseBuffer.getChannelData(0);
      
      // Generate Pinkish Noise filtering for authentic rain drop aesthetics
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        outputBuffer[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        outputBuffer[i] *= 0.04; // safe natural balance, prevent high frequencies
        b6 = white * 0.115926;
      }

      const rainNode = ctx.createBufferSource();
      rainNode.buffer = noiseBuffer;
      rainNode.loop = true;
      
      const rainGain = ctx.createGain();
      rainGain.gain.setValueAtTime(rainVolume * 0.3, ctx.currentTime);
      
      // Warm lowpass filter to make rainfall sound like cozy distant window drops
      const rainFilter = ctx.createBiquadFilter();
      rainFilter.type = 'lowpass';
      rainFilter.frequency.setValueAtTime(320, ctx.currentTime);

      rainNode.connect(rainFilter);
      rainFilter.connect(rainGain);
      rainGain.connect(mainGainRef.current);
      rainNode.start();
      
      (nodes as any).rainSource = rainNode;
      nodes.rainGain = rainGain;

      // 3. Cozy Library Fire Crackle. We synthesize fireplace crackles at ultra low volume to avoid disturbance static feel
      const synthFire = ctx.createScriptProcessor(4096, 0, 1);
      synthFire.onaudioprocess = (e) => {
        const out = e.outputBuffer.getChannelData(0);
        for (let i = 0; i < out.length; i++) {
          const white = Math.random() * 2 - 1;
          // Very warm low rumble
          let val = white * 0.003;
          
          // Tiny organic wood snaps with soft transient curves rather than step clickers
          if (Math.random() > 0.9997) {
            val += (Math.random() > 0.5 ? 0.05 : -0.05);
          }
          out[i] = val;
        }
      };
      
      const fireFilter = ctx.createBiquadFilter();
      fireFilter.type = 'lowpass';
      fireFilter.frequency.setValueAtTime(250, ctx.currentTime); // filter out sharp cracking hiss

      const fireGain = ctx.createGain();
      fireGain.gain.setValueAtTime(fireVolume * 0.12, ctx.currentTime);
      
      synthFire.connect(fireFilter);
      fireFilter.connect(fireGain);
      fireGain.connect(mainGainRef.current);
      
      nodes.fire = synthFire;
      nodes.fireGain = fireGain;

      // 4. Modulated Soft Highlands Wind drift filter sweeps
      const windOscSource = ctx.createOscillator();
      windOscSource.type = 'sine';
      windOscSource.frequency.setValueAtTime(0.04, ctx.currentTime); // slower organic flow sweep
      
      const windFilter = ctx.createBiquadFilter();
      windFilter.type = 'bandpass';
      windFilter.Q.setValueAtTime(1.2, ctx.currentTime);
      windFilter.frequency.setValueAtTime(350, ctx.currentTime); // lower cutoff wind
      
      const windNoise = ctx.createBufferSource();
      windNoise.buffer = noiseBuffer;
      windNoise.loop = true;
      
      const windOscGain = ctx.createGain();
      windOscGain.gain.setValueAtTime(110, ctx.currentTime); // gentle modulation sweep bounds

      windOscSource.connect(windOscGain);
      windOscGain.connect(windFilter.frequency);
      
      windNoise.connect(windFilter);
      
      const windGain = ctx.createGain();
      windGain.gain.setValueAtTime(windVolume * 0.35, ctx.currentTime);
      windFilter.connect(windGain);
      windGain.connect(mainGainRef.current);
      
      windOscSource.start();
      windNoise.start();
      
      (nodes as any).windNoiseSource = windNoise;
      nodes.windOsc = windOscSource;
      nodes.windGain = windGain;

    } catch (e) {
      console.warn("Failed web audio layout:", e);
    }
  };

  const playSynthesizerNote = (freq: number, duration: number) => {
    try {
      const ctx = getAudioContext();
      const nodes = generatorNodesRef.current;
      if (!ctx || !mainGainRef.current) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const subOsc = ctx.createOscillator();
      const noteGain = ctx.createGain();

      // Deep, extremely warm physical-modeling simulator filters
      const lowpassFilter = ctx.createBiquadFilter();
      lowpassFilter.type = 'lowpass';
      // Start slightly warm and sweep down to a very dark, soothing round tone
      lowpassFilter.frequency.setValueAtTime(500, now);
      lowpassFilter.frequency.exponentialRampToValueAtTime(110, now + duration * 1.2);

      // Primary oscillator: Soft warm Sine wave instead of the sharp triangle
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      // Sub-oscillator: Soft sine octave beneath to ground the note
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(freq / 2, now);

      // Pristine volume envelope to mimic real bells/pianos - no transient start clicking
      noteGain.gain.setValueAtTime(0, now);
      noteGain.gain.linearRampToValueAtTime(0.08, now + 0.25); // slow, expressive bell hammer attack
      noteGain.gain.exponentialRampToValueAtTime(0.001, now + duration * 1.5);

      // Hook up instruments
      osc.connect(lowpassFilter);
      subOsc.connect(lowpassFilter);
      lowpassFilter.connect(noteGain);

      // Dry mix output
      noteGain.connect(mainGainRef.current);

      // Wet Delay mix output: Send a beautiful portion directly into the spacious Echo Feedback loops
      if ((nodes as any).delayNode) {
        const delaySendNode = ctx.createGain();
        delaySendNode.gain.setValueAtTime(0.38, now); // soft spatial bleed
        noteGain.connect(delaySendNode);
        delaySendNode.connect((nodes as any).delayNode);
      }

      osc.start(now);
      subOsc.start(now);

      osc.stop(now + duration * 2.0);
      subOsc.stop(now + duration * 2.0);

      // Label frequency output
      setActiveFrequency(Math.round(freq * 10) / 10);
      const noteName = mapFrequencyToClassicalNote(freq);
      setActiveNoteLabel(noteName);
      setSynthesizedLinesPlayed(prev => prev + 1);

    } catch (e) {
      console.warn("Synthesizer note block:", e);
    }
  };

  const startSequenceScheduler = () => {
    const ctx = getAudioContext();
    currentNoteIndex.current = 0;

    const playNext = () => {
      if (!isPlaying || !selectedTrack) return;
      const track = selectedTrack;
      const note = track.notes[currentNoteIndex.current];

      if (note) {
        // Adjust note speed depending on user tempo choice
        const durationScale = (100 / tempo);
        const adjustedDuration = note.d * durationScale;
        playSynthesizerNote(note.f, adjustedDuration * 1.5);

        // Schedule next chord trigger
        schedulerTimerId.current = window.setTimeout(() => {
          currentNoteIndex.current = (currentNoteIndex.current + 1) % track.notes.length;
          playNext();
        }, adjustedDuration * 1000);
      }
    };

    playNext();
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      // Pause
      setIsPlaying(false);
      setActiveNoteLabel('Synthesizer Paused');
      setActiveFrequency(0);
      if (schedulerTimerId.current) {
        clearTimeout(schedulerTimerId.current);
        schedulerTimerId.current = null;
      }
      stopAllHardwareNodes();
    } else {
      // Play
      setIsPlaying(true);
      const ctx = getAudioContext();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      initSynthesizers();
      setTimeout(() => {
        startSequenceScheduler();
      }, 100);
    }
  };

  // Change active track
  const handleSelectTrack = (track: AudioTrack) => {
    setSelectedTrack(track);
    currentNoteIndex.current = 0;
    setActiveNoteLabel('Loading Program Settings...');
    setActiveFrequency(0);

    if (isPlaying) {
      if (schedulerTimerId.current) {
        clearTimeout(schedulerTimerId.current);
        schedulerTimerId.current = null;
      }
      setTimeout(() => {
        startSequenceScheduler();
      }, 150);
    }
  };

  const stopAllHardwareNodes = () => {
    const nodes = generatorNodesRef.current;
    try {
      if (nodes.fork) { nodes.fork.stop(); }
      if ((nodes as any).rainSource) { (nodes as any).rainSource.stop(); }
      if (nodes.fire) { nodes.fire.disconnect(); }
      if (nodes.windOsc) { nodes.windOsc.stop(); }
      if ((nodes as any).windNoiseSource) { (nodes as any).windNoiseSource.stop(); }
    } catch (e) {}
    generatorNodesRef.current = {};
  };

  useEffect(() => {
    return () => {
      if (schedulerTimerId.current) {
        clearTimeout(schedulerTimerId.current);
      }
      stopAllHardwareNodes();
    };
  }, []);

  // Utility to convert raw frequency code to aesthetic note representations
  const mapFrequencyToClassicalNote = (f: number): string => {
    if (f === 261.63) return 'C4 (Middle Piano C)';
    if (f === 329.63) return 'E4 (Warm Major Third)';
    if (f === 392.00) return 'G4 (Perfect Fifth)';
    if (f === 523.25) return 'C5 (High Soprano C)';
    if (f === 659.25) return 'E5 (Luminous Top E)';
    if (f === 349.23) return 'F4 (Sub-dominant F)';
    if (f === 440.00) return 'A4 (Chamber Concert A)';
    if (f === 554.37) return 'C#5 (Tender Semitone)';
    if (f === 698.46) return 'F5 (Passionate Top F)';
    if (f === 246.94) return 'B3 (Resolving Major Seventh)';
    if (f === 293.66) return 'D4 (Progressive Second)';
    if (f === 493.88) return 'B4 (Expressive Bright B)';
    if (f === 587.33) return 'D5 (Ethereal Scale Step)';
    if (f === 220.00) return 'A3 (Nocturnal Ground)';
    if (f === 207.65) return 'G#3 (Mysterious Sonata Leading Tone)';
    if (f === 277.18) return 'C#4 (C# Triplet Foundation)';
    if (f === 196.00) return 'G3 (Bass Resonance Ground)';
    if (f === 311.13) return 'D#4 (Dynamic Flat Tone)';
    if (f === 466.16) return 'A#4 (Ambient Flat Key)';
    if (f === 622.25) return 'D#5 (Sublime Cascading Step)';
    return `Tone (${f} Hz)`;
  };

  return (
    <div className="space-y-6">
      {/* Upper header segment */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-surface-elevated border border-divider-subtle shadow-xl relative overflow-hidden select-none">
        {/* Dynamic classical audio wave particles background */}
        <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#A855F7_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="space-y-1 z-10 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-accent-interactive/10 border border-accent-interactive/25 text-accent-interactive px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
              PRO HI-FI COMPANION
            </span>
            <span className="bg-emerald-950/20 border border-emerald-500/20 text-emerald-400 text-[10px] py-0.5 px-2.5 rounded-full font-mono uppercase font-black">
              Web Audio Synth
            </span>
          </div>
          <h2 className="font-serif text-2xl font-extrabold text-title-dominant flex items-center gap-2 tracking-tight">
            <Music className="w-6 h-6 text-accent-interactive" /> EthioLearn SoundSpace™
          </h2>
          <p className="text-xs text-subtext-explain leading-relaxed">
            Procedural, high-fidelity classic masterpieces and custom physics soundscapes modeled to synchronize brainwaves, block distractions, and spark your memory loop.
          </p>
        </div>

        {/* Live Active Frequency Tracker Badge */}
        <div className="p-4 bg-main-bg border border-divider-subtle rounded-xl flex items-center gap-3.5 z-10 shrink-0 shadow-inner">
          <div className={`w-3.5 h-3.5 rounded-full ${isPlaying ? 'bg-accent-interactive shadow-[0_0_12px_#A855F7] animate-pulse' : 'bg-zinc-700'}`} />
          <div className="space-y-0.5 font-mono">
            <span className="text-[9px] uppercase font-black text-subtext-explain block tracking-widest pl-0.5">Live Synced Note</span>
            <span className="text-xs text-title-dominant font-bold block truncate max-w-[170px]">{activeNoteLabel}</span>
            <span className="text-[10px] text-accent-interactive font-black">{activeFrequency > 0 ? `${activeFrequency}Hz Resonance` : 'No signal active'}</span>
          </div>
        </div>
      </div>

      {/* Main double column grid dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Playback Control + Live Canvas Wave Visualizer (7 columns) */}
        <div className="lg:col-span-7 bg-surface-elevated border border-divider-subtle rounded-2xl p-6 space-y-6 shadow-xl relative min-w-0 flex flex-col justify-between">
          
          <div className="space-y-4">
            {/* Minimalist interactive audio deck */}
            <div className="bg-main-bg p-5 rounded-2xl border border-divider-subtle relative overflow-hidden flex flex-col md:flex-row items-center gap-5 justify-between">
              
              <div className="space-y-1.5 min-w-0 flex-1">
                <span className="text-[10px] font-black text-accent-interactive block uppercase tracking-widest font-mono">NOW RECONSTRUCTING</span>
                <h3 className="font-serif font-extrabold text-title-dominant text-lg truncate">{selectedTrack.title}</h3>
                <p className="text-xs text-subtext-explain font-medium italic">{selectedTrack.composer}</p>
                
                <p className="text-[11px] text-subtext-explain font-sans leading-relaxed pt-1.5 border-t border-divider-subtle/50 mt-1 max-w-sm">
                  {selectedTrack.desc}
                </p>
              </div>

              {/* Master Play Button with double layers pulse */}
              <button
                onClick={handleTogglePlay}
                className="relative w-20 h-20 rounded-full flex items-center justify-center cursor-pointer transition-all active:scale-95 group shrink-0"
              >
                {/* Visual ripple ring on hover & active */}
                <span className={`absolute inset-0 rounded-full border border-accent-interactive/20 transition-all ${isPlaying ? 'animate-ping opacity-25 scale-110' : 'group-hover:scale-105 bg-accent-interactive/5'}`} />
                <span className="absolute inset-2 bg-gradient-to-tr from-[#7C3AED] to-[#EC4899] rounded-full shadow-lg shadow-accent-interactive/20 flex items-center justify-center text-white" />
                
                <div className="relative z-10 flex items-center justify-center">
                  {isPlaying ? (
                    <Pause className="w-8 h-8 text-white fill-white" />
                  ) : (
                    <Play className="w-8 h-8 text-white fill-white translate-x-0.5" />
                  )}
                </div>
              </button>

            </div>

            {/* Neon Visualizer Card */}
            <div className="p-4 bg-main-bg rounded-xl border border-divider-subtle space-y-2 relative overflow-hidden shadow-inner">
              <div className="flex justify-between items-center select-none">
                <span className="text-[10px] uppercase font-black text-accent-interactive tracking-wider flex items-center gap-1.5 font-mono">
                  <Activity className="w-3.5 h-3.5" /> Digital Oscilloscope Sweep
                </span>
                <span className="text-[10px] text-subtext-explain font-mono">
                  PRO SIGNAL ANALYSIS: ACTIVE
                </span>
              </div>
              
              {/* Canvas viewport */}
              <div className="bg-[#000000]/30 rounded-lg p-2 flex items-center justify-center border border-divider-subtle/40 relative h-32 overflow-hidden">
                {!isPlaying && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 bg-black/5 z-10 select-none">
                    <span className="text-[11px] text-accent-interactive font-black uppercase tracking-widest flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 animate-spin" /> Click Play above to activate Synthesizer Node
                    </span>
                    <span className="text-[10px] text-subtext-explain mt-0.5">Real-time stereo spectrum analyzer renders upon sound generation</span>
                  </div>
                )}
                <canvas ref={canvasRef} className="w-full h-full block cursor-crosshair" />
              </div>
            </div>
          </div>

          {/* Quick tempo modifiers */}
          <div className="pt-4 border-t border-divider-subtle/60 grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div className="space-y-1 select-none">
              <label className="text-[10px] text-subtext-explain uppercase font-black tracking-widest font-mono flex items-center gap-1">
                <Sliders className="w-3.5 h-3.5" /> Program Speed / Tempo
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="50"
                  max="160"
                  value={tempo}
                  onChange={(e) => setTempo(Number(e.target.value))}
                  className="flex-1 accent-accent-interactive cursor-pointer h-1.5 bg-main-bg rounded-lg"
                />
                <span className="font-mono text-xs text-title-dominant font-black w-11 text-right shrink-0">{tempo}%</span>
              </div>
              <p className="text-[10px] text-subtext-explain leading-snug">
                Slowing note intervals provides Alpha Brainwave reinforcement. Speedy notes promote Beta focus.
              </p>
            </div>

            <div className="bg-main-bg p-3 rounded-xl border border-divider-subtle flex items-center justify-between text-xs font-mono select-none">
              <div className="space-y-0.5">
                <span className="text-[9px] text-subtext-explain block uppercase font-bold">Resonances scheduled</span>
                <span className="font-extrabold text-title-dominant">{synthesizedLinesPlayed} notes played</span>
              </div>
              <button 
                onClick={() => {
                  setSynthesizedLinesPlayed(0);
                  setActiveNoteLabel('Counter Reset');
                }}
                className="p-1.5 text-xs hover:bg-surface-elevated border border-divider-subtle hover:border-accent-interactive/30 rounded text-accent-interactive cursor-pointer transition-colors"
                title="Reset counter"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>

        {/* Ambient Overlay Layers & Curated Selection List (5 columns) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Curated Bach/sonata track lists */}
          <div className="bg-surface-elevated border border-divider-subtle p-5 rounded-2xl space-y-4 shadow-xl">
            <h3 className="font-serif font-extrabold text-title-dominant text-sm flex items-center gap-1.5">
              <Compass className="w-4.5 h-4.5 text-accent-interactive" /> Select Meditative Blueprint
            </h3>
            
            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {PRESET_TRACKS.map((t) => {
                const isActive = selectedTrack.id === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => handleSelectTrack(t)}
                    className={`w-full p-3 rounded-xl border transition-all text-left flex items-start gap-3 cursor-pointer ${
                      isActive 
                        ? 'bg-main-bg border-accent-interactive/50 text-[#7C3AED] dark:text-[#A855F7] shadow-md shadow-accent-interactive/5' 
                        : 'bg-main-bg border-divider-subtle hover:border-accent-interactive/30 text-title-dominant'
                    }`}
                  >
                    <div className={`p-2 rounded-lg shrink-0 ${isActive ? 'bg-accent-interactive text-white shadow' : 'bg-surface-elevated text-subtext-explain'}`}>
                      <Music className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="font-extrabold text-xs text-title-dominant block truncate">{t.title}</span>
                        <span className="text-[9px] font-mono shrink-0 uppercase tracking-widest text-accent-interactive">{t.scaleType.split(' ')[0]}</span>
                      </div>
                      <span className="text-[11px] text-subtext-explain block truncate">{t.composer}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Environmental Physics background sliders */}
          <div className="bg-surface-elevated border border-divider-subtle p-5 rounded-2xl space-y-4 shadow-xl">
            <div className="space-y-0.5 select-none">
              <h3 className="font-serif font-extrabold text-title-dominant text-sm flex items-center gap-1.5">
                <Layers className="w-4.5 h-4.5 text-accent-interactive" /> Layer Ambient Noise Elements
              </h3>
              <p className="text-[11px] text-subtext-explain leading-normal">
                Synthesize customized noise generators using multi-vocal sound architectures.
              </p>
            </div>

            <div className="space-y-3.5 pt-1.5 select-none font-mono">
              {/* Solfeggio slider */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[10px] text-title-dominant">
                  <span className="font-bold flex items-center gap-1 leading-none uppercase"><Sparkles className="w-3.5 h-3.5 text-amber-500" /> Solfeggio 528Hz continuous fork</span>
                  <span className="text-subtext-explain font-black">{Math.round(ambientVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="0.5"
                  step="0.01"
                  value={ambientVolume}
                  onChange={(e) => setAmbientVolume(Number(e.target.value))}
                  className="w-full accent-accent-interactive cursor-pointer h-1.5 bg-main-bg rounded-lg"
                />
              </div>

              {/* Rain noise slider */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[10px] text-title-dominant">
                  <span className="font-bold flex items-center gap-1 leading-none uppercase"><Volume2 className="w-3.5 h-3.5 text-[#3b82f6]" /> Cozy Rain on campus</span>
                  <span className="text-subtext-explain font-black">{Math.round(rainVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="0.5"
                  step="0.01"
                  value={rainVolume}
                  onChange={(e) => setRainVolume(Number(e.target.value))}
                  className="w-full accent-accent-interactive cursor-pointer h-1.5 bg-main-bg rounded-lg"
                />
              </div>

              {/* Fire wood clicks slider */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[10px] text-title-dominant">
                  <span className="font-bold flex items-center gap-1 leading-none uppercase"><Volume2 className="w-3.5 h-3.5 text-orange-500" /> Library wood fire snaps</span>
                  <span className="text-subtext-explain font-black">{Math.round(fireVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="0.5"
                  step="0.01"
                  value={fireVolume}
                  onChange={(e) => setFireVolume(Number(e.target.value))}
                  className="w-full accent-accent-interactive cursor-pointer h-1.5 bg-main-bg rounded-lg"
                />
              </div>

              {/* Wind sweeps slider */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[10px] text-title-dominant">
                  <span className="font-bold flex items-center gap-1 leading-none uppercase"><Wind className="w-3.5 h-3.5 text-emerald-500" /> Ethiopian highlands gale</span>
                  <span className="text-subtext-explain font-black">{Math.round(windVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="0.5"
                  step="0.01"
                  value={windVolume}
                  onChange={(e) => setWindVolume(Number(e.target.value))}
                  className="w-full accent-accent-interactive cursor-pointer h-1.5 bg-main-bg rounded-lg"
                />
              </div>
            </div>

            <div className="p-3 bg-main-bg border border-divider-subtle text-[10px] rounded-xl flex items-start gap-2 leading-relaxed text-subtext-explain">
              <HelpCircle className="w-4 h-4 shrink-0 text-accent-interactive" />
              <span>
                To maximize cognitive mastery, use overhead stereo headphones. The procedural synthesizer will bounce panning channels perfectly.
              </span>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
