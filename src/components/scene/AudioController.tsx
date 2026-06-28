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
  
  // Set all to silence first
  for (let i = 0; i < data.length; i++) {
    data[i] = 0;
  }
  
  // Add sparse impulses
  let p = 0;
  while (p < data.length - 10) {
    // Random step between impulses: 10ms to 250ms
    const stepMs = 10 + Math.random() * 240;
    const stepSamples = Math.floor((stepMs / 1000) * ctx.sampleRate);
    p += stepSamples;
    if (p >= data.length - 10) break;
    
    // Generate a tiny crackle impulse with decay
    const amp = 0.05 + Math.random() * 0.15;
    const duration = 2 + Math.floor(Math.random() * 5); // 2 to 6 samples
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

  // Audio nodes and references
  const ctxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  
  const wavesGainRef = useRef<GainNode | null>(null);
  const heatGainRef = useRef<GainNode | null>(null);
  const stormGainRef = useRef<GainNode | null>(null);
  const rumbleGainRef = useRef<GainNode | null>(null);
  const droughtGainRef = useRef<GainNode | null>(null);
  const melancholyGainRef = useRef<GainNode | null>(null);

  const activeOscillatorsRef = useRef<(OscillatorNode | AudioBufferSourceNode)[]>([]);
  const chordIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pluckIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const rumbleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentChordNotesRef = useRef<number[]>([130.81, 196.00, 261.63, 311.13]);

  const activeSectionRef = useRef(currentSection);
  const isMutedRef = useRef(isMuted);

  // Sync state refs to keep values fresh inside intervals and timeouts
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

      // --- 1. Ocean Waves Module (Prologue / Act III) ---
      const wavesGain = ctx.createGain();
      wavesGain.gain.setValueAtTime(0, ctx.currentTime);
      wavesGain.connect(masterGain);
      wavesGainRef.current = wavesGain;

      const wavesFilter = ctx.createBiquadFilter();
      wavesFilter.type = 'lowpass';
      wavesFilter.frequency.setValueAtTime(450, ctx.currentTime);
      wavesFilter.Q.setValueAtTime(1.0, ctx.currentTime);
      wavesFilter.connect(wavesGain);

      const wavesNoise = ctx.createBufferSource();
      wavesNoise.buffer = pinkNoiseBuffer;
      wavesNoise.loop = true;
      wavesNoise.connect(wavesFilter);
      wavesNoise.start(0);
      activeOscillatorsRef.current.push(wavesNoise);

      // 0.1Hz LFO sweeping the waves filter cutoff
      const wavesLFO = ctx.createOscillator();
      wavesLFO.frequency.setValueAtTime(0.1, ctx.currentTime);
      const wavesLFOGain = ctx.createGain();
      wavesLFOGain.gain.setValueAtTime(250, ctx.currentTime); // frequency modulation range +/- 250Hz

      wavesLFO.connect(wavesLFOGain);
      wavesLFOGain.connect(wavesFilter.frequency);
      wavesLFO.start(0);
      activeOscillatorsRef.current.push(wavesLFO);


      // --- 2. Heat Stress Module (Act II) ---
      const heatGain = ctx.createGain();
      heatGain.gain.setValueAtTime(0, ctx.currentTime);
      heatGain.connect(masterGain);
      heatGainRef.current = heatGain;

      // Subtle ambient high-pitched sine cluster
      const frequencies = [1500, 1508, 2100, 2112];
      const lfoFreqs = [0.08, 0.12, 0.05, 0.15];
      for (let i = 0; i < frequencies.length; i++) {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(frequencies[i], ctx.currentTime);

        const oscGain = ctx.createGain();
        oscGain.gain.setValueAtTime(0.008, ctx.currentTime);

        osc.connect(oscGain);
        oscGain.connect(heatGain);
        osc.start(0);
        activeOscillatorsRef.current.push(osc);

        // Individual slow LFOs to create shimmering, moving tension
        const lfo = ctx.createOscillator();
        lfo.frequency.setValueAtTime(lfoFreqs[i], ctx.currentTime);
        const lfoGain = ctx.createGain();
        lfoGain.gain.setValueAtTime(0.008, ctx.currentTime);

        lfo.connect(lfoGain);
        lfoGain.connect(oscGain.gain);
        lfo.start(0);
        activeOscillatorsRef.current.push(lfo);
      }


      // --- 3. Storm Rumble Module (Act IV) ---
      const stormGain = ctx.createGain();
      stormGain.gain.setValueAtTime(0, ctx.currentTime);
      stormGain.connect(masterGain);
      stormGainRef.current = stormGain;

      // Pink noise wind filter
      const windFilter = ctx.createBiquadFilter();
      windFilter.type = 'bandpass';
      windFilter.frequency.setValueAtTime(300, ctx.currentTime);
      windFilter.Q.setValueAtTime(2.5, ctx.currentTime);
      windFilter.connect(stormGain);

      const windNoise = ctx.createBufferSource();
      windNoise.buffer = pinkNoiseBuffer;
      windNoise.loop = true;
      const windGain = ctx.createGain();
      windGain.gain.setValueAtTime(0.15, ctx.currentTime);
      windNoise.connect(windGain);
      windGain.connect(windFilter);
      windNoise.start(0);
      activeOscillatorsRef.current.push(windNoise);

      // Wind modulation LFO
      const windLFO = ctx.createOscillator();
      windLFO.frequency.setValueAtTime(0.06, ctx.currentTime);
      const windLFOGain = ctx.createGain();
      windLFOGain.gain.setValueAtTime(140, ctx.currentTime);
      windLFO.connect(windLFOGain);
      windLFOGain.connect(windFilter.frequency);
      windLFO.start(0);
      activeOscillatorsRef.current.push(windLFO);

      // Low frequency rumbles oscillator
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

      // Rumble flutter frequency vibrato
      const rumbleLFO = ctx.createOscillator();
      rumbleLFO.frequency.setValueAtTime(8.8, ctx.currentTime);
      const rumbleLFOGain = ctx.createGain();
      rumbleLFOGain.gain.setValueAtTime(0.18, ctx.currentTime);
      rumbleLFO.connect(rumbleLFOGain);
      rumbleLFOGain.connect(rumbleOsc.frequency);
      rumbleLFO.start(0);
      activeOscillatorsRef.current.push(rumbleLFO);

      // Procedural scheduling of thunder rumbles
      const scheduleNextRumble = () => {
        const delay = 5000 + Math.random() * 9000; // 5 to 14 seconds
        rumbleTimeoutRef.current = setTimeout(() => {
          if (ctxRef.current && activeSectionRef.current === 'extreme-weather' && !isMutedRef.current) {
            const nowTime = ctxRef.current.currentTime;
            const rG = rumbleGainRef.current;
            if (rG) {
              rG.gain.cancelScheduledValues(nowTime);
              rG.gain.setValueAtTime(0, nowTime);
              const dur = 3.5 + Math.random() * 5.0; // rumble duration
              const peak = 0.25 + Math.random() * 0.35;
              rG.gain.linearRampToValueAtTime(peak, nowTime + 0.6);
              rG.gain.exponentialRampToValueAtTime(0.001, nowTime + dur);
            }
          }
          scheduleNextRumble();
        }, delay);
      };
      scheduleNextRumble();


      // --- 4. Drought Wind Module (Act V) ---
      const droughtGain = ctx.createGain();
      droughtGain.gain.setValueAtTime(0, ctx.currentTime);
      droughtGain.connect(masterGain);
      droughtGainRef.current = droughtGain;

      // Dry crackling sparse impulses
      const crackleSource = ctx.createBufferSource();
      crackleSource.buffer = crackleBuffer;
      crackleSource.loop = true;
      const crackleFilter = ctx.createBiquadFilter();
      crackleFilter.type = 'highpass';
      crackleFilter.frequency.setValueAtTime(3500, ctx.currentTime);

      crackleSource.connect(crackleFilter);
      crackleFilter.connect(droughtGain);
      crackleSource.start(0);
      activeOscillatorsRef.current.push(crackleSource);

      // Low volume dry wind backdrop
      const dryWindFilter = ctx.createBiquadFilter();
      dryWindFilter.type = 'bandpass';
      dryWindFilter.frequency.setValueAtTime(1300, ctx.currentTime);
      dryWindFilter.Q.setValueAtTime(1.2, ctx.currentTime);
      dryWindFilter.connect(droughtGain);

      const dryWindNoise = ctx.createBufferSource();
      dryWindNoise.buffer = pinkNoiseBuffer;
      dryWindNoise.loop = true;
      const dryWindGain = ctx.createGain();
      dryWindGain.gain.setValueAtTime(0.03, ctx.currentTime);

      dryWindNoise.connect(dryWindGain);
      dryWindGain.connect(dryWindFilter);
      dryWindNoise.start(0);
      activeOscillatorsRef.current.push(dryWindNoise);


      // --- 5. Melancholic Synthesis Module (Act VII / CTA) ---
      const melancholyGain = ctx.createGain();
      melancholyGain.gain.setValueAtTime(0, ctx.currentTime);
      melancholyGain.connect(masterGain);
      melancholyGainRef.current = melancholyGain;

      const melancholyFilter = ctx.createBiquadFilter();
      melancholyFilter.type = 'lowpass';
      melancholyFilter.frequency.setValueAtTime(650, ctx.currentTime); // warm filtering
      melancholyFilter.Q.setValueAtTime(1.0, ctx.currentTime);
      melancholyFilter.connect(melancholyGain);

      // Stereo delay echo for rich spacey pads
      const delayNode = ctx.createDelay(1.0);
      delayNode.delayTime.setValueAtTime(0.6, ctx.currentTime); // 600ms echo
      const delayFeedback = ctx.createGain();
      delayFeedback.gain.setValueAtTime(0.42, ctx.currentTime); // feedback amount
      
      melancholyFilter.connect(delayNode);
      delayNode.connect(delayFeedback);
      delayFeedback.connect(delayNode);
      delayNode.connect(melancholyGain);

      const synthVoices: { oscSaw: OscillatorNode; oscTri: OscillatorNode; gain: GainNode }[] = [];
      
      // Lush cinematic chords (6 voices: deep sub-bass + rich 9th/11th extension notes)
      const chords = [
        [65.41, 196.00, 233.08, 293.66, 311.13, 392.00], // Cm9 (C2, G3, Bb3, D4, Eb4, G4)
        [51.91, 196.00, 261.63, 311.13, 392.00, 523.25], // Abmaj9 (Ab1, G3, C4, Eb4, G4, C5)
        [77.78, 196.00, 233.08, 349.23, 392.00, 466.16], // Ebadd9 (Eb2, G3, Bb3, F4, G4, Bb4)
        [49.00, 174.61, 233.08, 293.66, 349.23, 440.00]  // Gm11 (G1, F3, Bb3, D4, F4, A4)
      ];

      for (let i = 0; i < 6; i++) {
        const oscSaw = ctx.createOscillator();
        const oscTri = ctx.createOscillator();
        const voiceGain = ctx.createGain();

        if (i === 0) {
          // Clean low-end foundation (pure sub-bass)
          oscSaw.type = 'sine';
          oscTri.type = 'triangle';
          voiceGain.gain.setValueAtTime(0.24, ctx.currentTime);
        } else {
          // Thick chorused upper voices
          oscSaw.type = 'sawtooth';
          oscTri.type = 'triangle';
          oscSaw.detune.setValueAtTime(10 + i * 2, ctx.currentTime);
          oscTri.detune.setValueAtTime(-6 - i * 2, ctx.currentTime);
          voiceGain.gain.setValueAtTime(0.045, ctx.currentTime);
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
        currentChordNotesRef.current = chord; // sync active frequencies
        synthVoices.forEach((voice, voiceIdx) => {
          voice.oscSaw.frequency.exponentialRampToValueAtTime(chord[voiceIdx], nowTime + 3.5);
          voice.oscTri.frequency.exponentialRampToValueAtTime(chord[voiceIdx], nowTime + 3.5);
        });
        chordIndex = (chordIndex + 1) % chords.length;
      };

      // Play Cm first
      playNextChord();
      chordIntervalRef.current = setInterval(playNextChord, 6000);

      // Shimmering bioluminescent pluck arpeggiator module
      const pluckGain = ctx.createGain();
      pluckGain.gain.setValueAtTime(0.06, ctx.currentTime); // soft volume
      pluckGain.connect(melancholyGain);

      const pluckDelay = ctx.createDelay(1.0);
      pluckDelay.delayTime.setValueAtTime(0.38, ctx.currentTime);
      const pluckDelayFeedback = ctx.createGain();
      pluckDelayFeedback.gain.setValueAtTime(0.55, ctx.currentTime);
      pluckDelay.connect(pluckDelayFeedback);
      pluckDelayFeedback.connect(pluckDelay);
      pluckGain.connect(pluckDelay);
      pluckDelay.connect(melancholyGain);

      const playBioluminescentPluck = () => {
        if (!ctxRef.current || isMutedRef.current) return;
        if (activeSectionRef.current !== 'unpaid-debt' && activeSectionRef.current !== 'climate-debt' && activeSectionRef.current !== 'action') return;
        
        const nowTime = ctxRef.current.currentTime;
        const notes = currentChordNotesRef.current;
        if (!notes || notes.length < 3) return;
        
        // Pick a random high note from the active chord scale (voices 2 to 5), transposed up 2 octaves
        const baseNote = notes[Math.floor(2 + Math.random() * (notes.length - 2))];
        const pitch = baseNote * 4;
        
        const osc = ctxRef.current.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(pitch, nowTime);
        
        const filter = ctxRef.current.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(pitch, nowTime);
        filter.Q.setValueAtTime(6, nowTime);
        
        const oscGain = ctxRef.current.createGain();
        oscGain.gain.setValueAtTime(0, nowTime);
        oscGain.gain.linearRampToValueAtTime(0.08, nowTime + 0.012); // clean pluck envelope
        oscGain.gain.exponentialRampToValueAtTime(0.0001, nowTime + 0.95);
        
        osc.connect(filter);
        filter.connect(oscGain);
        oscGain.connect(pluckGain);
        
        osc.start(nowTime);
        osc.stop(nowTime + 1.1);
      };

      const pluckInterval = setInterval(() => {
        if (Math.random() > 0.45) {
          playBioluminescentPluck();
        }
      }, 850);
      pluckIntervalRef.current = pluckInterval;

      // Trigger immediate cross-fade to current section
      const nowTime = ctx.currentTime;
      wavesGain.gain.setValueAtTime((currentSection === 'prologue' || currentSection === 'sinking') ? 0.75 : 0, nowTime);
      heatGain.gain.setValueAtTime((currentSection === 'warming') ? 0.8 : 0, nowTime);
      stormGain.gain.setValueAtTime((currentSection === 'extreme-weather') ? 0.85 : 0, nowTime);
      droughtGain.gain.setValueAtTime((currentSection === 'food-security') ? 0.65 : 0, nowTime);
      melancholyGain.gain.setValueAtTime((currentSection === 'unpaid-debt' || currentSection === 'climate-debt' || currentSection === 'action') ? 0.55 : 0, nowTime);

    } catch (e) {
      console.error('Error initializing Web Audio API nodes:', e);
    }
  };

  // Keep user interaction listener to handle autoplay blockages
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

    const targetWaves = (currentSection === 'prologue' || currentSection === 'sinking') ? 0.75 : 0;
    const targetHeat = (currentSection === 'warming') ? 0.8 : 0;
    const targetStorm = (currentSection === 'extreme-weather') ? 0.85 : 0;
    const targetDrought = (currentSection === 'food-security') ? 0.65 : 0;
    const targetMelancholy = (currentSection === 'unpaid-debt' || currentSection === 'climate-debt' || currentSection === 'action') ? 0.55 : 0;

    wavesGainRef.current?.gain.setTargetAtTime(targetWaves, now, 0.6);
    heatGainRef.current?.gain.setTargetAtTime(targetHeat, now, 0.6);
    stormGainRef.current?.gain.setTargetAtTime(targetStorm, now, 0.6);
    droughtGainRef.current?.gain.setTargetAtTime(targetDrought, now, 0.6);
    melancholyGainRef.current?.gain.setTargetAtTime(targetMelancholy, now, 0.6);
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
          // Ignore errors from already stopped nodes
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
