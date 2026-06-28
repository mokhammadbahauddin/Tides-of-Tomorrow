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

// Generate a buffer with sparse crackling impulses
function createCrackleBuffer(ctx: AudioContext): AudioBuffer {
  const bufferSize = ctx.sampleRate * 5; // 5 seconds of crackle
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  
  for (let i = 0; i < data.length; i++) {
    data[i] = 0;
  }
  
  let p = 0;
  while (p < data.length - 10) {
    const stepMs = 15 + Math.random() * 260;
    const stepSamples = Math.floor((stepMs / 1000) * ctx.sampleRate);
    p += stepSamples;
    if (p >= data.length - 10) break;
    
    const amp = 0.04 + Math.random() * 0.12;
    const duration = 2 + Math.floor(Math.random() * 4);
    for (let d = 0; d < duration; d++) {
      data[p + d] = (Math.random() * 2 - 1) * amp * Math.pow(0.5, d);
    }
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
  const heatGainRef = useRef<GainNode | null>(null);
  const stormGainRef = useRef<GainNode | null>(null);
  const rumbleGainRef = useRef<GainNode | null>(null);
  const droughtGainRef = useRef<GainNode | null>(null);
  const melancholyGainRef = useRef<GainNode | null>(null);

  // Modulator refs for depth adjustment
  const wavesFilterLRef = useRef<BiquadFilterNode | null>(null);
  const wavesFilterRRef = useRef<BiquadFilterNode | null>(null);
  const wavesLFOGainLRef = useRef<GainNode | null>(null);
  const wavesLFOGainRRef = useRef<GainNode | null>(null);

  const activeOscillatorsRef = useRef<(OscillatorNode | AudioBufferSourceNode)[]>([]);
  const chordIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pluckIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const rumbleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentChordNotesRef = useRef<number[]>([130.81, 196.00, 261.63, 311.13]);

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

      // Common noise buffers
      const pinkNoiseBuffer = createPinkNoiseBuffer(ctx);
      const crackleBuffer = createCrackleBuffer(ctx);

      // --- 1. Persistent Stereo Waves Module ---
      const wavesGain = ctx.createGain();
      wavesGain.gain.setValueAtTime(0.7, ctx.currentTime); // active baseline
      wavesGain.connect(masterGain);
      wavesGainRef.current = wavesGain;

      // Left wave channel
      const wavesFilterL = ctx.createBiquadFilter();
      wavesFilterL.type = 'lowpass';
      wavesFilterL.frequency.setValueAtTime(330, ctx.currentTime);
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
      wavesLFOGainL.gain.setValueAtTime(215, ctx.currentTime);
      wavesLFOGainLRef.current = wavesLFOGainL;

      wavesLFOL.connect(wavesLFOGainL);
      wavesLFOGainL.connect(wavesFilterL.frequency);
      wavesLFOL.start(0);
      activeOscillatorsRef.current.push(wavesLFOL);

      // Right wave channel
      const wavesFilterR = ctx.createBiquadFilter();
      wavesFilterR.type = 'lowpass';
      wavesFilterR.frequency.setValueAtTime(330, ctx.currentTime);
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
      wavesLFOGainR.gain.setValueAtTime(215, ctx.currentTime);
      wavesLFOGainRRef.current = wavesLFOGainR;

      wavesLFOR.connect(wavesLFOGainR);
      wavesLFOGainR.connect(wavesFilterR.frequency);
      wavesLFOR.start(0);
      activeOscillatorsRef.current.push(wavesLFOR);


      // --- 2. Heat Stress Haze Module (Act II) ---
      const heatGain = ctx.createGain();
      heatGain.gain.setValueAtTime(0, ctx.currentTime);
      heatGain.connect(masterGain);
      heatGainRef.current = heatGain;

      const frequencies = [1480, 1488, 2050, 2062];
      const lfoFreqs = [0.07, 0.11, 0.04, 0.13];
      for (let i = 0; i < frequencies.length; i++) {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(frequencies[i], ctx.currentTime);

        const oscGain = ctx.createGain();
        oscGain.gain.setValueAtTime(0.007, ctx.currentTime);

        osc.connect(oscGain);
        oscGain.connect(heatGain);
        osc.start(0);
        activeOscillatorsRef.current.push(osc);

        const lfo = ctx.createOscillator();
        lfo.frequency.setValueAtTime(lfoFreqs[i], ctx.currentTime);
        const lfoGain = ctx.createGain();
        lfoGain.gain.setValueAtTime(0.006, ctx.currentTime);

        lfo.connect(lfoGain);
        lfoGain.connect(oscGain.gain);
        lfo.start(0);
        activeOscillatorsRef.current.push(lfo);
      }


      // --- 3. Storm Wind & Rumble Module (Act IV) ---
      const stormGain = ctx.createGain();
      stormGain.gain.setValueAtTime(0, ctx.currentTime);
      stormGain.connect(masterGain);
      stormGainRef.current = stormGain;

      const windFilter = ctx.createBiquadFilter();
      windFilter.type = 'bandpass';
      windFilter.frequency.setValueAtTime(280, ctx.currentTime);
      windFilter.Q.setValueAtTime(2.2, ctx.currentTime);
      windFilter.connect(stormGain);

      const windNoise = ctx.createBufferSource();
      windNoise.buffer = pinkNoiseBuffer;
      windNoise.loop = true;
      const windGainNode = ctx.createGain();
      windGainNode.gain.setValueAtTime(0.12, ctx.currentTime);
      windNoise.connect(windGainNode);
      windGainNode.connect(windFilter);
      windNoise.start(0);
      activeOscillatorsRef.current.push(windNoise);

      const windLFO = ctx.createOscillator();
      windLFO.frequency.setValueAtTime(0.05, ctx.currentTime);
      const windLFOGain = ctx.createGain();
      windLFOGain.gain.setValueAtTime(130, ctx.currentTime);
      windLFO.connect(windLFOGain);
      windLFOGain.connect(windFilter.frequency);
      windLFO.start(0);
      activeOscillatorsRef.current.push(windLFO);

      const rumbleOsc = ctx.createOscillator();
      rumbleOsc.type = 'triangle';
      rumbleOsc.frequency.setValueAtTime(36, ctx.currentTime);

      const rumbleFilter = ctx.createBiquadFilter();
      rumbleFilter.type = 'lowpass';
      rumbleFilter.frequency.setValueAtTime(55, ctx.currentTime);

      const rumbleGain = ctx.createGain();
      rumbleGain.gain.setValueAtTime(0, ctx.currentTime);
      rumbleGainRef.current = rumbleGain;

      rumbleOsc.connect(rumbleFilter);
      rumbleFilter.connect(rumbleGain);
      rumbleGain.connect(stormGain);
      rumbleOsc.start(0);
      activeOscillatorsRef.current.push(rumbleOsc);

      const rumbleLFO = ctx.createOscillator();
      rumbleLFO.frequency.setValueAtTime(8.8, ctx.currentTime);
      const rumbleLFOGain = ctx.createGain();
      rumbleLFOGain.gain.setValueAtTime(0.18, ctx.currentTime);
      rumbleLFO.connect(rumbleLFOGain);
      rumbleLFOGain.connect(rumbleOsc.frequency);
      rumbleLFO.start(0);
      activeOscillatorsRef.current.push(rumbleLFO);

      const scheduleNextRumble = () => {
        const delay = 6000 + Math.random() * 10000;
        rumbleTimeoutRef.current = setTimeout(() => {
          if (ctxRef.current && activeSectionRef.current === 'extreme-weather' && !isMutedRef.current) {
            const nowTime = ctxRef.current.currentTime;
            const rG = rumbleGainRef.current;
            if (rG) {
              rG.gain.cancelScheduledValues(nowTime);
              rG.gain.setValueAtTime(0, nowTime);
              const dur = 3.5 + Math.random() * 4.5;
              const peak = 0.2 + Math.random() * 0.3;
              rG.gain.linearRampToValueAtTime(peak, nowTime + 0.6);
              rG.gain.exponentialRampToValueAtTime(0.001, nowTime + dur);
            }
          }
          scheduleNextRumble();
        }, delay);
      };
      scheduleNextRumble();


      // --- 4. Drought Wind & Crackle Module (Act V) ---
      const droughtGain = ctx.createGain();
      droughtGain.gain.setValueAtTime(0, ctx.currentTime);
      droughtGain.connect(masterGain);
      droughtGainRef.current = droughtGain;

      const crackleSource = ctx.createBufferSource();
      crackleSource.buffer = crackleBuffer;
      crackleSource.loop = true;
      const crackleFilter = ctx.createBiquadFilter();
      crackleFilter.type = 'highpass';
      crackleFilter.frequency.setValueAtTime(3600, ctx.currentTime);

      crackleSource.connect(crackleFilter);
      crackleFilter.connect(droughtGain);
      crackleSource.start(0);
      activeOscillatorsRef.current.push(crackleSource);

      const dryWindFilter = ctx.createBiquadFilter();
      dryWindFilter.type = 'bandpass';
      dryWindFilter.frequency.setValueAtTime(1300, ctx.currentTime);
      dryWindFilter.Q.setValueAtTime(1.2, ctx.currentTime);
      dryWindFilter.connect(droughtGain);

      const dryWindNoise = ctx.createBufferSource();
      dryWindNoise.buffer = pinkNoiseBuffer;
      dryWindNoise.loop = true;
      const dryWindGain = ctx.createGain();
      dryWindGain.gain.setValueAtTime(0.025, ctx.currentTime);

      dryWindNoise.connect(dryWindGain);
      dryWindGain.connect(dryWindFilter);
      dryWindNoise.start(0);
      activeOscillatorsRef.current.push(dryWindNoise);


      // --- 5. Calming Meditation Song Module (Act I / Act III / Act VII / CTA) ---
      const melancholyGain = ctx.createGain();
      melancholyGain.gain.setValueAtTime(0, ctx.currentTime);
      melancholyGain.connect(masterGain);
      melancholyGainRef.current = melancholyGain;

      const melancholyFilter = ctx.createBiquadFilter();
      melancholyFilter.type = 'lowpass';
      melancholyFilter.frequency.setValueAtTime(400, ctx.currentTime); // warm filtering
      melancholyFilter.Q.setValueAtTime(1.0, ctx.currentTime);
      melancholyFilter.connect(melancholyGain);

      // Stereo delay echo
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

        if (i === 0) {
          oscSaw.type = 'sine';
          oscTri.type = 'sine';
          voiceGain.gain.setValueAtTime(0.24, ctx.currentTime);
        } else {
          oscSaw.type = 'sine';
          oscTri.type = 'triangle';
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
        currentChordNotesRef.current = chord;
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
        const s = activeSectionRef.current;
        const isCalmSection = (s === 'prologue' || s === 'sinking' || s === 'unpaid-debt' || s === 'climate-debt' || s === 'action');
        if (!isCalmSection) return;
        
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
      }, 850);
      pluckIntervalRef.current = pluckInterval;

      // Trigger immediate cross-fade to current section
      const isDeep = (currentSection === 'sinking' || currentSection === 'unpaid-debt' || currentSection === 'climate-debt' || currentSection === 'action');
      const baseFreq = isDeep ? 315 : 330;
      const lfoAmp = isDeep ? 230 : 215;

      wavesFilterL.frequency.setValueAtTime(baseFreq, ctx.currentTime);
      wavesFilterR.frequency.setValueAtTime(baseFreq, ctx.currentTime);
      wavesLFOGainL.gain.setValueAtTime(lfoAmp, ctx.currentTime);
      wavesLFOGainR.gain.setValueAtTime(lfoAmp, ctx.currentTime);

      const targetCalmSong = (currentSection === 'prologue' || currentSection === 'sinking' || currentSection === 'unpaid-debt' || currentSection === 'climate-debt' || currentSection === 'action') ? 0.65 : 0;
      const targetHeat = (currentSection === 'warming') ? 0.8 : 0;
      const targetStorm = (currentSection === 'extreme-weather') ? 0.85 : 0;
      const targetDrought = (currentSection === 'food-security') ? 0.65 : 0;

      melancholyGain.gain.setValueAtTime(targetCalmSong, ctx.currentTime);
      heatGain.gain.setValueAtTime(targetHeat, ctx.currentTime);
      stormGain.gain.setValueAtTime(targetStorm, ctx.currentTime);
      droughtGain.gain.setValueAtTime(targetDrought, ctx.currentTime);

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
        masterGainRef.current?.gain.setTargetAtTime(0.8, now, 0.35);
      }
    }
  }, [isMuted]);

  // Handle smooth cross-fades when the active section changes
  useEffect(() => {
    if (!ctxRef.current) return;
    const ctx = ctxRef.current;
    const now = ctx.currentTime;

    const isDeep = (currentSection === 'sinking' || currentSection === 'unpaid-debt' || currentSection === 'climate-debt' || currentSection === 'action');
    
    // Modulate waves low-end sweep
    const baseFreq = isDeep ? 315 : 330;
    const lfoAmp = isDeep ? 230 : 215;

    wavesFilterLRef.current?.frequency.setTargetAtTime(baseFreq, now, 0.8);
    wavesFilterRRef.current?.frequency.setTargetAtTime(baseFreq, now, 0.8);
    wavesLFOGainLRef.current?.gain.setTargetAtTime(lfoAmp, now, 0.8);
    wavesLFOGainRRef.current?.gain.setTargetAtTime(lfoAmp, now, 0.8);

    // Cross-fade thematic layers
    const targetCalmSong = (currentSection === 'prologue' || currentSection === 'sinking' || currentSection === 'unpaid-debt' || currentSection === 'climate-debt' || currentSection === 'action') ? 0.65 : 0;
    const targetHeat = (currentSection === 'warming') ? 0.8 : 0;
    const targetStorm = (currentSection === 'extreme-weather') ? 0.85 : 0;
    const targetDrought = (currentSection === 'food-security') ? 0.65 : 0;

    melancholyGainRef.current?.gain.setTargetAtTime(targetCalmSong, now, 0.7);
    heatGainRef.current?.gain.setTargetAtTime(targetHeat, now, 0.7);
    stormGainRef.current?.gain.setTargetAtTime(targetStorm, now, 0.7);
    droughtGainRef.current?.gain.setTargetAtTime(targetDrought, now, 0.7);
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
      if (rumbleTimeoutRef.current) {
        clearTimeout(rumbleTimeoutRef.current);
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
