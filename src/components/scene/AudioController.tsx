import { useEffect, useRef } from 'react';

interface AudioControllerProps {
  activeSection?: string;
  activeStep?: number;
  isMuted: boolean;
}

// Paul Kellet's refined method for pink noise generation
function createPinkNoiseBuffer(ctx: AudioContext): AudioBuffer {
  const bufferSize = ctx.sampleRate * 4; // 4 seconds of noise
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + white * 0.0555179;
    b1 = 0.99332 * b1 + white * 0.0750759;
    b2 = 0.96900 * b2 + white * 0.1538520;
    b3 = 0.86650 * b3 + white * 0.3104856;
    b4 = 0.55000 * b4 + white * 0.5329522;
    b5 = -0.7616 * b5 - white * 0.0168980;
    const pink = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
    b6 = white * 0.115926;
    data[i] = pink * 0.11; // normalize amplitude
  }
  return buffer;
}

export default function AudioController({ activeSection, activeStep, isMuted }: AudioControllerProps) {
  // Map activeStep (numeric index) or activeSection (string name)
  let currentSection = activeSection || 'prologue';
  if (activeStep !== undefined) {
    const stepToSection = [
      'prologue',         // 0
      'prologue',         // 1 (Act I)
      'warming',          // 2 (Act II)
      'sinking',          // 3 (Act III)
      'extreme-weather',  // 4 (Act IV)
      'food-security',    // 5 (Act V)
      'unpaid-debt',      // 6 (Act VI)
      'climate-debt',     // 7 (Act VII)
      'action'            // 8 (CTA)
    ];
    if (activeStep >= 0 && activeStep < stepToSection.length) {
      currentSection = stepToSection[activeStep];
    }
  }

  // Audio Context and Node Refs
  const ctxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  
  // Gains for separate thematic modules
  const wavesGainRef = useRef<GainNode | null>(null);
  const melancholyGainRef = useRef<GainNode | null>(null);

  // Modulator refs for depth adjustment
  const wavesFilterLRef = useRef<BiquadFilterNode | null>(null);
  const wavesFilterRRef = useRef<BiquadFilterNode | null>(null);
  const wavesLFOGainLRef = useRef<GainNode | null>(null);
  const wavesLFOGainRRef = useRef<GainNode | null>(null);

  const activeOscillatorsRef = useRef<(OscillatorNode | AudioBufferSourceNode)[]>([]);
  const chordIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pluckIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const activeSectionRef = useRef(currentSection);
  const isMutedRef = useRef(isMuted);

  // Sync state refs to keep values fresh inside intervals/listeners
  useEffect(() => {
    activeSectionRef.current = currentSection;
    isMutedRef.current = isMuted;
  }, [currentSection, isMuted]);

  // Procedural Web Audio API initialisation
  const initAudio = () => {
    if (ctxRef.current) return;

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) {
        console.warn('Web Audio API not supported in this browser.');
        return;
      }

      const ctx = new AudioContextClass();
      ctxRef.current = ctx;

      const masterGain = ctx.createGain();
      masterGain.connect(ctx.destination);
      masterGain.gain.setValueAtTime(0, ctx.currentTime);
      masterGainRef.current = masterGain;

      // Common noise buffer
      const pinkNoiseBuffer = createPinkNoiseBuffer(ctx);

      // --- 1. Persistent Stereo Waves Module ---
      const wavesGain = ctx.createGain();
      wavesGain.gain.setValueAtTime(0.75, ctx.currentTime); // active baseline
      wavesGain.connect(masterGain);
      wavesGainRef.current = wavesGain;

      // Left wave channel
      const wavesFilterL = ctx.createBiquadFilter();
      wavesFilterL.type = 'lowpass';
      wavesFilterL.frequency.setValueAtTime(320, ctx.currentTime);
      wavesFilterL.Q.setValueAtTime(1.1, ctx.currentTime);
      wavesFilterLRef.current = wavesFilterL;

      if (ctx.createStereoPanner) {
        const pL = ctx.createStereoPanner();
        pL.pan.setValueAtTime(-0.65, ctx.currentTime);
        pL.connect(wavesGain);
        wavesFilterL.connect(pL);
      } else {
        wavesFilterL.connect(wavesGain);
      }

      const wavesNoiseL = ctx.createBufferSource();
      wavesNoiseL.buffer = pinkNoiseBuffer;
      wavesNoiseL.loop = true;
      wavesNoiseL.connect(wavesFilterL);
      wavesNoiseL.start(0);
      activeOscillatorsRef.current.push(wavesNoiseL);

      const wavesLFOL = ctx.createOscillator();
      wavesLFOL.frequency.setValueAtTime(0.08, ctx.currentTime);
      const wavesLFOGainL = ctx.createGain();
      wavesLFOGainL.gain.setValueAtTime(220, ctx.currentTime);
      wavesLFOGainLRef.current = wavesLFOGainL;

      wavesLFOL.connect(wavesLFOGainL);
      wavesLFOGainL.connect(wavesFilterL.frequency);
      wavesLFOL.start(0);
      activeOscillatorsRef.current.push(wavesLFOL);

      // Right wave channel
      const wavesFilterR = ctx.createBiquadFilter();
      wavesFilterR.type = 'lowpass';
      wavesFilterR.frequency.setValueAtTime(320, ctx.currentTime);
      wavesFilterR.Q.setValueAtTime(1.1, ctx.currentTime);
      wavesFilterRRef.current = wavesFilterR;

      if (ctx.createStereoPanner) {
        const pR = ctx.createStereoPanner();
        pR.pan.setValueAtTime(0.65, ctx.currentTime);
        pR.connect(wavesGain);
        wavesFilterR.connect(pR);
      } else {
        wavesFilterR.connect(wavesGain);
      }

      const wavesNoiseR = ctx.createBufferSource();
      wavesNoiseR.buffer = pinkNoiseBuffer;
      wavesNoiseR.loop = true;
      wavesNoiseR.connect(wavesFilterR);
      wavesNoiseR.start(0);
      activeOscillatorsRef.current.push(wavesNoiseR);

      const wavesLFOR = ctx.createOscillator();
      wavesLFOR.frequency.setValueAtTime(0.095, ctx.currentTime);
      const wavesLFOGainR = ctx.createGain();
      wavesLFOGainR.gain.setValueAtTime(220, ctx.currentTime);
      wavesLFOGainRRef.current = wavesLFOGainR;

      wavesLFOR.connect(wavesLFOGainR);
      wavesLFOGainR.connect(wavesFilterR.frequency);
      wavesLFOR.start(0);
      activeOscillatorsRef.current.push(wavesLFOR);

      // --- 2. Calming Meditation Song Module ---
      const melancholyGain = ctx.createGain();
      melancholyGain.gain.setValueAtTime(0.65, ctx.currentTime); // keep constant calming ambient music
      melancholyGain.connect(masterGain);
      melancholyGainRef.current = melancholyGain;

      const melancholyFilter = ctx.createBiquadFilter();
      melancholyFilter.type = 'lowpass';
      melancholyFilter.frequency.setValueAtTime(450, ctx.currentTime); // warm filtering
      melancholyFilter.Q.setValueAtTime(1.0, ctx.currentTime);
      melancholyFilter.connect(melancholyGain);

      // Stereo delay echo for rich spaciousness
      const delayNode = ctx.createDelay(1.0);
      delayNode.delayTime.setValueAtTime(0.6, ctx.currentTime);
      const delayFeedback = ctx.createGain();
      delayFeedback.gain.setValueAtTime(0.42, ctx.currentTime);
      
      melancholyFilter.connect(delayNode);
      delayNode.connect(delayFeedback);
      delayFeedback.connect(delayNode);
      delayNode.connect(melancholyGain);

      const synthVoices: { oscSaw: OscillatorNode; oscTri: OscillatorNode; gain: GainNode }[] = [];
      
      // Serene Lydian major chords (Cmaj9 -> Fmaj7(add9) -> Am9 -> G6/9)
      const chords = [
        [65.41, 196.00, 246.94, 293.66, 329.63, 392.00], // Cmaj9
        [87.31, 220.00, 261.63, 329.63, 392.00, 523.25], // Fmaj7(add9)
        [110.00, 196.00, 261.63, 293.66, 329.63, 440.00], // Am9
        [98.00, 246.94, 293.66, 329.63, 440.00, 493.88]   // G6/9
      ];

      for (let i = 0; i < 6; i++) {
        const oscSaw = ctx.createOscillator();
        const oscTri = ctx.createOscillator();
        const voiceGain = ctx.createGain();

        oscSaw.type = 'sine';
        oscTri.type = 'sine';
        
        if (i === 0) {
          voiceGain.gain.setValueAtTime(0.24, ctx.currentTime);
        } else {
          oscSaw.detune.setValueAtTime(8 + i * 1.5, ctx.currentTime);
          oscTri.detune.setValueAtTime(-5 - i * 1.5, ctx.currentTime);
          voiceGain.gain.setValueAtTime(0.04, ctx.currentTime);
        }

        oscSaw.connect(voiceGain);
        oscTri.connect(voiceGain);
        voiceGain.connect(melancholyFilter);

        oscSaw.start(0);
        oscTri.start(0);
        activeOscillatorsRef.current.push(oscSaw);
        activeOscillatorsRef.current.push(oscTri);

        synthVoices.push({ oscSaw, oscTri, gain: voiceGain });
      }

      let chordIndex = 0;
      const playNextChord = () => {
        if (!ctxRef.current) return;
        const nowTime = ctxRef.current.currentTime;
        const chord = chords[chordIndex];
        synthVoices.forEach((voice, voiceIdx) => {
          voice.oscSaw.frequency.exponentialRampToValueAtTime(chord[voiceIdx], nowTime + 3.5);
          voice.oscTri.frequency.exponentialRampToValueAtTime(chord[voiceIdx], nowTime + 3.5);
        });
        chordIndex = (chordIndex + 1) % chords.length;
      };

      playNextChord();
      chordIntervalRef.current = setInterval(playNextChord, 6000);

      // Shimmering pentatonic wind-chime pluck module
      const pluckGain = ctx.createGain();
      pluckGain.gain.setValueAtTime(0.035, ctx.currentTime); // very soft
      pluckGain.connect(melancholyGain);

      const pluckDelay = ctx.createDelay(1.0);
      pluckDelay.delayTime.setValueAtTime(0.45, ctx.currentTime);
      const pluckDelayFeedback = ctx.createGain();
      pluckDelayFeedback.gain.setValueAtTime(0.5, ctx.currentTime);
      pluckDelay.connect(pluckDelayFeedback);
      pluckDelayFeedback.connect(pluckDelay);
      pluckGain.connect(pluckDelay);
      pluckDelay.connect(melancholyGain);

      const playBioluminescentPluck = () => {
        if (!ctxRef.current || isMutedRef.current) return;
        
        const nowTime = ctxRef.current.currentTime;
        const pentatonicFrequencies = [
          523.25, 587.33, 659.25, 783.99, 880.00,
          1046.50, 1174.66, 1318.51, 1567.98, 1760.00
        ];
        
        const pitch = pentatonicFrequencies[Math.floor(Math.random() * pentatonicFrequencies.length)];
        const osc = ctxRef.current.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(pitch, nowTime);
        
        const filter = ctxRef.current.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(pitch, nowTime);
        filter.Q.setValueAtTime(10, nowTime);
        
        const oscGain = ctxRef.current.createGain();
        oscGain.gain.setValueAtTime(0, nowTime);
        oscGain.gain.linearRampToValueAtTime(0.05, nowTime + 0.02);
        oscGain.gain.exponentialRampToValueAtTime(0.0001, nowTime + 1.6);
        
        osc.connect(filter);
        filter.connect(oscGain);
        oscGain.connect(pluckGain);
        
        osc.start(nowTime);
        osc.stop(nowTime + 1.8);
      };

      const pluckInterval = setInterval(() => {
        if (Math.random() > 0.45) {
          playBioluminescentPluck();
        }
      }, 950);
      pluckIntervalRef.current = pluckInterval;

      // Trigger immediate waves parameter matching
      const isDeep = (currentSection === 'sinking' || currentSection === 'unpaid-debt' || currentSection === 'climate-debt' || currentSection === 'action');
      const baseFreq = isDeep ? 305 : 320;
      const lfoAmp = isDeep ? 230 : 220;

      wavesFilterL.frequency.setValueAtTime(baseFreq, ctx.currentTime);
      wavesFilterR.frequency.setValueAtTime(baseFreq, ctx.currentTime);
      wavesLFOGainL.gain.setValueAtTime(lfoAmp, ctx.currentTime);
      wavesLFOGainR.gain.setValueAtTime(lfoAmp, ctx.currentTime);

    } catch (e) {
      console.error('Error initializing Web Audio API nodes:', e);
    }
  };

  // User interaction listener to handle autoplay policies
  useEffect(() => {
    const handleInteraction = () => {
      if (!isMuted) {
        if (!ctxRef.current) {
          initAudio();
        }
        if (ctxRef.current && ctxRef.current.state === 'suspended') {
          ctxRef.current.resume();
        }
      }
    };

    window.addEventListener('click', handleInteraction);
    window.addEventListener('scroll', handleInteraction, { passive: true });
    window.addEventListener('touchstart', handleInteraction, { passive: true });

    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('scroll', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };
  }, [isMuted]);

  // Handle master mute/unmute
  useEffect(() => {
    if (!isMuted && !ctxRef.current) {
      initAudio();
    }

    if (ctxRef.current) {
      const ctx = ctxRef.current;
      const now = ctx.currentTime;
      if (isMuted) {
        masterGainRef.current?.gain.setTargetAtTime(0, now, 0.35);
      } else {
        if (ctx.state === 'suspended') {
          ctx.resume();
        }
        masterGainRef.current?.gain.setTargetAtTime(0.85, now, 0.35);
      }
    }
  }, [isMuted]);

  // Handle smooth waves modulation based on depth/act
  useEffect(() => {
    if (!ctxRef.current) return;
    const ctx = ctxRef.current;
    const now = ctx.currentTime;

    const isDeep = (currentSection === 'sinking' || currentSection === 'unpaid-debt' || currentSection === 'climate-debt' || currentSection === 'action');
    
    // Modulate waves low-end sweep slightly as we scroll deep
    const baseFreq = isDeep ? 305 : 320;
    const lfoAmp = isDeep ? 230 : 220;

    wavesFilterLRef.current?.frequency.setTargetAtTime(baseFreq, now, 1.2);
    wavesFilterRRef.current?.frequency.setTargetAtTime(baseFreq, now, 1.2);
    wavesLFOGainLRef.current?.gain.setTargetAtTime(lfoAmp, now, 1.2);
    wavesLFOGainRRef.current?.gain.setTargetAtTime(lfoAmp, now, 1.2);
  }, [currentSection]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (chordIntervalRef.current) {
        clearInterval(chordIntervalRef.current);
      }
      if (pluckIntervalRef.current) {
        clearInterval(pluckIntervalRef.current);
      }

      activeOscillatorsRef.current.forEach((osc) => {
        try {
          osc.stop();
        } catch (e) {
          // Ignore errors
        }
      });
      activeOscillatorsRef.current = [];

      if (ctxRef.current) {
        const ctx = ctxRef.current;
        if (ctx.state !== 'closed') {
          ctx.close();
        }
        ctxRef.current = null;
      }
    };
  }, []);

  return null;
}
