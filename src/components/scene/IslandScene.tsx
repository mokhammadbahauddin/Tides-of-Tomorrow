import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

// --- GLSL Shaders ---
const waterVertexShader = `
  varying vec2 vUv;
  varying float vElevation;
  varying vec3 vWorldPosition;
  uniform float uTime;
  uniform float uWaveHeight;
  uniform float uStormIntensity;
  uniform float uSubmerged;

  // Simplex noise
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = inversesqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  void main() {
    vUv = uv;
    vec3 newPosition = position;
    float elevation = sin(position.x * 2.0 + uTime) * 0.1;
    elevation += sin(position.y * 1.5 + uTime * 0.8) * 0.1;
    elevation += snoise(vec3(position.xy * 0.5, uTime * 0.1)) * uWaveHeight;
    elevation += uStormIntensity * snoise(vec3(position.xy * 2.0, uTime * 0.5)) * 0.3;
    vElevation = elevation;
    newPosition.z += elevation;
    
    vec4 worldPos = modelMatrix * vec4(newPosition, 1.0);
    vWorldPosition = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

const waterFragmentShader = `
  varying vec2 vUv;
  varying float vElevation;
  varying vec3 vWorldPosition;
  uniform vec3 uColorDeep;
  uniform vec3 uColorSurface;
  uniform float uStormIntensity;
  uniform float uSubmerged;
  uniform vec3 uSunPosition;

  void main() {
    float mixStrength = (vElevation + 0.1) * 0.5;
    vec3 waterColor = mix(uColorDeep, uColorSurface, mixStrength);
    
    // Specular highlight for premium glossy water look
    vec3 viewDir = normalize(cameraPosition - vWorldPosition);
    vec3 lightDir = normalize(uSunPosition - vWorldPosition);
    vec3 fakeNormal = normalize(vec3(-vElevation * 3.0, 1.0, -vElevation * 3.0));
    vec3 halfVector = normalize(lightDir + viewDir);
    float specular = pow(max(dot(fakeNormal, halfVector), 0.0), 80.0);
    
    waterColor += vec3(0.5, 0.9, 1.0) * specular * 0.8 * (1.0 - uStormIntensity);

    float whiteCap = smoothstep(0.6, 1.0, vElevation + uStormIntensity * 0.3);
    waterColor = mix(waterColor, vec3(0.9, 0.95, 1.0), whiteCap * 0.5);
    waterColor = mix(waterColor, uColorDeep * 0.3, uSubmerged * 0.8);
    
    gl_FragColor = vec4(waterColor, 0.9);
  }
`;

const skyVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const skyFragmentShader = `
  uniform vec3 c1;
  uniform vec3 c2;
  uniform vec3 c3;
  uniform vec3 c4;
  uniform float uTime;
  varying vec2 vUv;

  float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
  }

  void main() {
    vec2 uv = vUv;
    float noise1 = random(uv * 1.0 + uTime * 0.005);
    float floatNoise = noise1;
    float gradient = uv.y + (floatNoise * 0.05);
    vec3 color = mix(c1, c2, gradient);
    color = mix(color, c3, gradient);
    color = mix(color, c4, smoothstep(0.3, 0.8, uv.y));
    gl_FragColor = vec4(color, 1.0);
  }
`;

const coralVertexShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying float vHeight;
  uniform float uTime;

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
    vHeight = uv.y;
    vec3 newPosition = position;
    // Gentle underwater sway
    newPosition.x += sin(uTime * 1.5 + position.y * 5.0) * 0.03 * uv.y;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`;

const coralFragmentShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying float vHeight;
  uniform vec3 uColorAlive;
  uniform vec3 uColorDying;
  uniform vec3 uColorDead;
  uniform float uTipThreshold;
  uniform float uDieThreshold;
  uniform vec3 uSunPosition;
  uniform float uTime;

  void main() {
    vec3 viewDir = normalize(-vPosition);
    vec3 lightDir = normalize(uSunPosition);
    float lighting = max(dot(vNormal, lightDir), 0.0);
    float heightFactor = smoothstep(0.0, 1.0, vHeight);
    
    vec3 finalColor = mix(uColorAlive, uColorDying, smoothstep(uTipThreshold, uTipThreshold - 0.2, heightFactor));
    finalColor = mix(finalColor, uColorDead, smoothstep(uDieThreshold, uDieThreshold - 0.3, heightFactor));
    
    // Subsurface scattering fake
    finalColor *= (0.6 + 0.4 * lighting);
    float fresnel = pow(1.0 - max(dot(viewDir, vNormal), 0.0), 2.0);
    finalColor += uColorAlive * fresnel * 0.4 * (1.0 - smoothstep(uDieThreshold - 0.3, uDieThreshold, heightFactor));
    
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

interface IslandSceneProps {
  scrollProgress: React.MutableRefObject<number>;
}

const IslandScene = React.memo(function IslandScene({ scrollProgress }: IslandSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneState = useRef<any>({
    renderer: null, scene: null, camera: null, waterMaterial: null, skyMaterial: null,
    islandGroup: null, coralMaterials: [], sun: null, directionalLight: null, lagoonLight: null,
    particles: null, animationId: 0, startTime: performance.now(), actStates: [0, 0, 0, 0, 0],
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const s = sceneState.current;

    const isMobile = window.innerWidth < 768;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(1);
      container.appendChild(renderer.domElement);
      s.renderer = renderer;
    } catch (err) {
      console.warn("WebGL blocked by environment. IslandScene aborted.");
      return;
    }

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a1622, 0.02);
    s.scene = scene;

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 500);
    camera.position.set(0, 6, 14);
    s.camera = camera;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffeedd, 1.5);
    directionalLight.position.set(15, 20, 10);
    scene.add(directionalLight);
    s.directionalLight = directionalLight;

    const hemiLight = new THREE.HemisphereLight(0x2DB5C7, 0x0A1622, 0.5);
    scene.add(hemiLight);

    // Water
    const waterGeometry = new THREE.PlaneGeometry(250, 250, isMobile ? 64 : 128, isMobile ? 64 : 128);
    const waterMaterial = new THREE.ShaderMaterial({
      vertexShader: waterVertexShader,
      fragmentShader: waterFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uWaveHeight: { value: 0.15 },
        uColorDeep: { value: new THREE.Color(0.02, 0.08, 0.15) },
        uColorSurface: { value: new THREE.Color(0.05, 0.25, 0.4) },
        uStormIntensity: { value: 0.0 },
        uSubmerged: { value: 0.0 },
        uSunPosition: { value: directionalLight.position },
      },
      transparent: true,
      side: THREE.DoubleSide,
    });
    const water = new THREE.Mesh(waterGeometry, waterMaterial);
    water.rotation.x = -Math.PI / 2;
    water.position.y = -0.3;
    scene.add(water);
    s.waterMaterial = waterMaterial;

    // Sky dome
    const skyGeometry = new THREE.SphereGeometry(200, 32, 32);
    const skyMaterial = new THREE.ShaderMaterial({
      vertexShader: skyVertexShader,
      fragmentShader: skyFragmentShader,
      uniforms: {
        c1: { value: new THREE.Color(0.04, 0.09, 0.13) },
        c2: { value: new THREE.Color(0.18, 0.1, 0.2) },
        c3: { value: new THREE.Color(0.1, 0.2, 0.25) },
        c4: { value: new THREE.Color(0.0, 0.0, 0.0) },
        uTime: { value: 0 },
      },
      side: THREE.BackSide,
    });
    const sky = new THREE.Mesh(skyGeometry, skyMaterial);
    scene.add(sky);
    s.skyMaterial = skyMaterial;

    // Island group
    const islandGroup = new THREE.Group();
    scene.add(islandGroup);
    s.islandGroup = islandGroup;

    createIsland(islandGroup, s.coralMaterials, s);

    // Particles (Hope/Embers)
    const particleCount = 150;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(particleCount * 3);
    for(let i=0; i<particleCount*3; i++) {
      pPos[i] = (Math.random() - 0.5) * 30;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0x64ffda,
      size: 0.15,
      transparent: true,
      opacity: 0.0, // hidden initially
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);
    s.particles = particles;

    // Sun sprite
    const sunCanvas = document.createElement('canvas');
    sunCanvas.width = 256; sunCanvas.height = 256;
    const ctx = sunCanvas.getContext('2d')!;
    const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    gradient.addColorStop(0, 'rgba(255, 230, 180, 1)');
    gradient.addColorStop(0.2, 'rgba(255, 200, 100, 0.8)');
    gradient.addColorStop(0.5, 'rgba(255, 150, 50, 0.3)');
    gradient.addColorStop(1, 'rgba(255, 100, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 256);
    const sunMaterial = new THREE.SpriteMaterial({
      map: new THREE.CanvasTexture(sunCanvas),
      blending: THREE.AdditiveBlending,
      depthWrite: false, transparent: true,
    });
    const sun = new THREE.Sprite(sunMaterial);
    sun.position.set(20, 30, -50);
    sun.scale.set(25, 25, 1);
    scene.add(sun);
    s.sun = sun;

    s.startTime = performance.now();
    const animate = () => {
      s.animationId = requestAnimationFrame(animate);
      const elapsed = (performance.now() - s.startTime) / 1000;
      updateSceneState(s, scrollProgress.current, elapsed);

      if (s.waterMaterial) s.waterMaterial.uniforms.uTime.value = elapsed * 0.5;
      if (s.skyMaterial) s.skyMaterial.uniforms.uTime.value = elapsed;
      s.coralMaterials.forEach((mat: any) => mat.uniforms.uTime.value = elapsed);

      if (s.particles) {
        s.particles.rotation.y = elapsed * 0.05;
        s.particles.position.y = Math.sin(elapsed * 0.5) * 0.5;
      }

      camera.position.x = Math.sin(elapsed * 0.1) * 0.5;
      camera.position.y = 6 + Math.cos(elapsed * 0.08) * 0.2;
      camera.lookAt(0, 1, 0);

      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(s.animationId);
      
      // CRITICAL FIX: Properly dispose all WebGL resources to prevent GPU memory leak
      scene.traverse((object: any) => {
        if (object.geometry) {
          object.geometry.dispose();
        }
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach((mat: any) => {
              if (mat.map) mat.map.dispose();
              mat.dispose();
            });
          } else {
            if (object.material.map) object.material.map.dispose();
            object.material.dispose();
          }
        }
      });
      
      renderer.forceContextLoss();
      renderer.dispose();
      
      if (container && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="fixed inset-0 z-0">
    </div>
  );
});

export default IslandScene;

function smoothstep(min: number, max: number, value: number) {
  const x = Math.max(0, Math.min(1, (value - min) / (max - min)));
  return x * x * (3 - 2 * x);
}

function createHut() {
  const hutGroup = new THREE.Group();
  
  // Raised floor (Deck)
  const floor = new THREE.Mesh(
    new THREE.CylinderGeometry(0.4, 0.4, 0.05, 8),
    new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 1.0, flatShading: true })
  );
  floor.position.y = 0.1;
  hutGroup.add(floor);

  // Pillars
  const pillarGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.3, 4);
  const pillarMat = new THREE.MeshStandardMaterial({ color: 0x3d2314, roughness: 1.0, flatShading: true });
  const pPositions = [
    [0.25, 0.2, 0.25], [-0.25, 0.2, 0.25], 
    [0.25, 0.2, -0.25], [-0.25, 0.2, -0.25]
  ];
  pPositions.forEach(p => {
    const pillar = new THREE.Mesh(pillarGeo, pillarMat);
    pillar.position.set(p[0], p[1], p[2]);
    hutGroup.add(pillar);
  });

  // Thatched Roof
  const roof = new THREE.Mesh(
    new THREE.ConeGeometry(0.55, 0.45, 8),
    new THREE.MeshStandardMaterial({ color: 0xc4a471, roughness: 1.0, flatShading: true })
  );
  roof.position.y = 0.55;
  hutGroup.add(roof);

  return hutGroup;
}

class CustomSinCurve extends THREE.Curve<THREE.Vector3> {
  scale: number;
  constructor(scale = 1) {
    super();
    this.scale = scale;
  }
  getPoint(t: number, optionalTarget = new THREE.Vector3()) {
    const tx = Math.sin(t * Math.PI * 0.5) * 0.6; // Leans outward
    const ty = t * 1.5; // Height
    const tz = 0;
    return optionalTarget.set(tx, ty, tz).multiplyScalar(this.scale);
  }
}

function createFrondGeo() {
  // Increased segments (8x16) for a beautifully smooth, curved cross-section
  const frondGeo = new THREE.PlaneGeometry(1.2, 2.6, 8, 16);
  const pos = frondGeo.attributes.position;
  for (let j = 0; j < pos.count; j++) {
    const x = pos.getX(j);
    const y = pos.getY(j);
    const newY = y + 1.3; // Shift origin to base (0 to 2.6)
    const t = newY / 2.6; 
    
    // Smooth downward arching droop
    let z = Math.sin(t * Math.PI) * -0.9 - (t * 0.3); 
    
    // Smooth Parabolic Fold: Creates an elegant, natural curved roof instead of a sharp paper fold
    const nx = Math.abs(x) / 0.6; // Normalized X (0 to 1)
    const fold = Math.pow(nx, 1.5) * 0.45; // Curved fold
    z -= fold;

    pos.setY(j, newY);
    pos.setZ(j, z);
  }
  frondGeo.computeVertexNormals();
  return frondGeo;
}

let cachedFrondMaterial: THREE.MeshStandardMaterial | null = null;

function getFrondMaterial() {
  if (cachedFrondMaterial) return cachedFrondMaterial;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;
  
  ctx.clearRect(0, 0, 512, 1024);
  ctx.lineCap = 'round';
  
  // Tapered Midrib (Thick at base, extremely thin at tip)
  for(let y=0; y<=1024; y+=10) {
    const t = y / 1024; // 0=tip, 1=base
    ctx.strokeStyle = '#6a7826';
    ctx.lineWidth = 2 + t * 20; 
    ctx.beginPath();
    ctx.moveTo(256, Math.max(0, y-10));
    ctx.lineTo(256, y);
    ctx.stroke();
  }
  
  ctx.lineWidth = 5; // Finer, more detailed leaflets

  // Left leaflets (Ultra lush and dense)
  for (let y = 10; y < 1000; y += 8 + Math.random() * 4) { 
    const t = y / 1024; 
    
    // Perfect Teardrop Envelope: Natural taper at both the tip and the base!
    // Prevents blunt edges and off-canvas clipping.
    const envelope = Math.pow(Math.sin(t * Math.PI), 0.8) * (1.0 + t*0.5); 
    const length = envelope * 180 + 5 + (Math.random() * 20);
    
    // Natural sweep downwards
    const sweep = 10 + t * 30 + (Math.random() * 20); 
    
    const gG = Math.floor(130 + (1-t) * 50 + Math.random()*20);
    ctx.strokeStyle = `rgb(${Math.floor(30 + t * 50)},${gG},${Math.floor(20 - t * 10)})`;

    ctx.beginPath();
    ctx.moveTo(256, y);
    const cpY = y + (Math.random() * 20 - 10); 
    ctx.quadraticCurveTo(256 - length * 0.5, cpY, 256 - length, y - sweep);
    ctx.stroke();
  }

  // Right leaflets
  for (let y = 15; y < 1000; y += 8 + Math.random() * 4) { 
    const t = y / 1024; 
    const envelope = Math.pow(Math.sin(t * Math.PI), 0.8) * (1.0 + t*0.5); 
    const length = envelope * 180 + 5 + (Math.random() * 20);
    const sweep = 10 + t * 30 + (Math.random() * 20); 
    
    const gG = Math.floor(130 + (1-t) * 50 + Math.random()*20);
    ctx.strokeStyle = `rgb(${Math.floor(30 + t * 50)},${gG},${Math.floor(20 - t * 10)})`;

    ctx.beginPath();
    ctx.moveTo(256, y);
    const cpY = y + (Math.random() * 20 - 10);
    ctx.quadraticCurveTo(256 + length * 0.5, cpY, 256 + length, y - sweep);
    ctx.stroke();
  }
  
  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  
  cachedFrondMaterial = new THREE.MeshStandardMaterial({
    map: map,
    alphaTest: 0.5,
    roughness: 0.8,
    side: THREE.DoubleSide
  });

  return cachedFrondMaterial;
}

function createCoconutTree() {
  const treeGroup = new THREE.Group();
  
  const path = new CustomSinCurve(1);
  const trunkGeo = new THREE.TubeGeometry(path, 8, 0.08, 5, false);
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x6e4e2e, roughness: 1.0, flatShading: true });
  const trunk = new THREE.Mesh(trunkGeo, trunkMat);
  treeGroup.add(trunk);

  const topPos = path.getPoint(1);

  // Coconuts
  const coconutGeo = new THREE.SphereGeometry(0.12, 5, 4); 
  const coconutMat = new THREE.MeshStandardMaterial({ color: 0x4a3219, roughness: 1.0, flatShading: true });
  for(let i=0; i<3; i++) {
    const coconut = new THREE.Mesh(coconutGeo, coconutMat);
    const angle = (i / 3) * Math.PI * 2;
    coconut.position.set(
      topPos.x + Math.cos(angle)*0.1, 
      topPos.y - 0.05, 
      topPos.z + Math.sin(angle)*0.1
    );
    coconut.rotation.x = Math.random();
    treeGroup.add(coconut);
  }

  const frondGeo = createFrondGeo();
  const frondMat = getFrondMaterial();

  // Canopy Construction
  // ALL 12 Leaves point downwards in every direction
  for(let i=0; i<12; i++) {
    const frond = new THREE.Mesh(frondGeo, frondMat);
    frond.position.copy(topPos);
    frond.rotation.order = 'YXZ'; 
    
    // Spread evenly 360 degrees
    frond.rotation.y = (i / 12) * Math.PI * 2 + (Math.random() * 0.2); 
    
    // Pitch: 1.57 is horizontal. We want them ALL pointing DOWNWARDS.
    // Randomize between 1.6 (slightly down) and 2.3 (steeply down towards trunk)
    frond.rotation.x = 1.6 + Math.random() * 0.7; 
    
    // Roll: Twist the leaf so it catches light dynamically
    frond.rotation.z = (Math.random() - 0.5) * 0.7; 
    
    // Random size (Made significantly smaller)
    frond.scale.setScalar(0.4 + Math.random() * 0.25); 
    treeGroup.add(frond);
  }

  return treeGroup;
}

function createIsland(group: THREE.Group, coralMaterials: THREE.ShaderMaterial[], s: any) {
  // Low-poly rugged atoll with Grass & Sand (Vertex Colors)
  const sandGeometry = new THREE.TorusGeometry(3.5, 1.6, 24, 48);
  const pos = sandGeometry.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  const colorSand = new THREE.Color(0xE8D5B5); // Beach
  const colorGrass = new THREE.Color(0x4a7c2a); // Jungle green

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const angle = Math.atan2(y, x);
    
    // Deform terrain
    const noise = Math.sin(angle * 7) * 0.4 + Math.cos(angle * 4) * 0.3 + Math.random() * 0.15;
    const newZ = z + noise;
    pos.setZ(i, newZ);

    // Color mixing based on height (Z is up after rotation)
    let mixVal = smoothstep(0.7, 1.4, newZ); // Above 0.7 becomes grass
    mixVal += (Math.random() - 0.5) * 0.2; // Blend noise
    mixVal = Math.max(0, Math.min(1, mixVal));
    
    const finalColor = colorSand.clone().lerp(colorGrass, mixVal);
    colors[i*3] = finalColor.r;
    colors[i*3+1] = finalColor.g;
    colors[i*3+2] = finalColor.b;
  }
  sandGeometry.computeVertexNormals();
  sandGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const sandMaterial = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.9,
    metalness: 0.0,
    flatShading: true,
  });
  const sand = new THREE.Mesh(sandGeometry, sandMaterial);
  sand.rotation.x = -Math.PI / 2;
  sand.position.y = 0.2;
  sand.scale.set(1, 1, 0.45);
  group.add(sand);

  // Rocks along the shore (Clustered volcanic rocks)
  const rockGeo = new THREE.DodecahedronGeometry(1, 0);
  const rockMat = new THREE.MeshStandardMaterial({ color: 0x4a4a4a, roughness: 1.0, flatShading: true });
  for(let i=0; i<15; i++) {
    const rockCluster = new THREE.Group();
    for(let k=0; k<3; k++) {
      const rock = new THREE.Mesh(rockGeo, rockMat);
      rock.position.set((Math.random()-0.5)*0.3, (Math.random()-0.5)*0.3, (Math.random()-0.5)*0.3);
      rock.scale.set(0.1+Math.random()*0.2, 0.2+Math.random()*0.3, 0.1+Math.random()*0.2);
      rock.rotation.set(Math.random(), Math.random(), Math.random());
      rockCluster.add(rock);
    }
    const angle = Math.random() * Math.PI * 2;
    const radius = 3.6 + (Math.random() - 0.5) * 1.5;
    rockCluster.position.set(
      Math.cos(angle) * radius,
      0.2 + Math.random() * 0.15,
      Math.sin(angle) * radius
    );
    group.add(rockCluster);
  }

  // Bioluminescent center lagoon
  const lagoonGeometry = new THREE.CircleGeometry(2.3, 32);
  const lagoonMaterial = new THREE.MeshStandardMaterial({
    color: 0x2DB5C7,
    roughness: 0.1,
    metalness: 0.8,
    transparent: true,
    opacity: 0.85,
  });
  const lagoon = new THREE.Mesh(lagoonGeometry, lagoonMaterial);
  lagoon.rotation.x = -Math.PI / 2;
  lagoon.position.y = 0.4;
  group.add(lagoon);

  const lagoonLight = new THREE.PointLight(0x2DB5C7, 3, 10);
  lagoonLight.position.set(0, 0.5, 0);
  group.add(lagoonLight);
  s.lagoonLight = lagoonLight;

  // Huts (Fales)
  const hutCount = 4;
  for(let i=0; i<hutCount; i++) {
    const angle = (i / hutCount) * Math.PI * 2 + 0.5;
    const radius = 2.4; // Edge of the lagoon
    const hut = createHut();
    hut.position.set(Math.cos(angle) * radius, 0.6, Math.sin(angle) * radius);
    hut.rotation.y = -angle; // Face lagoon
    hut.scale.setScalar(0.7 + Math.random() * 0.3);
    group.add(hut);
  }

  // Coconut Trees - Neat and sparse
  const palmCount = 5; // Dramatically reduced for a clean look
  for(let i=0; i<palmCount; i++) {
    const angle = (i / palmCount) * Math.PI * 2 + 0.3; // Perfect spacing
    const radius = 3.6 + (Math.random() - 0.5) * 0.3; // Outer grassy ring
    const tree = createCoconutTree();
    tree.position.set(Math.cos(angle) * radius, 0.8, Math.sin(angle) * radius);
    tree.rotation.y = -angle; // Lean outwards towards ocean
    tree.rotation.z = 0.15; // Consistent tilt
    tree.scale.setScalar(0.8 + Math.random() * 0.3);
    group.add(tree);
  }

  // Coral clusters
  const coralPositions = [
    [3.2, 0.4, 0], [2.5, 0.4, 2.2], [0, 0.4, 3.5], [-2.5, 0.4, 2],
    [-3.5, 0.4, 0], [-2.5, 0.4, -2.5], [0, 0.4, -3.2], [2.8, 0.4, -2],
  ];

  const coralTypes = [
    () => new THREE.DodecahedronGeometry(0.2 + Math.random() * 0.15, 0),
    () => new THREE.TorusKnotGeometry(0.12, 0.04, 32, 6, 2, 3), // Branching
    () => new THREE.IcosahedronGeometry(0.2, 1) // Brain
  ];

  coralPositions.forEach((pos) => {
    for(let j=0; j<3; j++) {
      const coralGeo = coralTypes[Math.floor(Math.random() * coralTypes.length)]();
      const coralMat = new THREE.ShaderMaterial({
        vertexShader: coralVertexShader,
        fragmentShader: coralFragmentShader,
        uniforms: {
          uColorAlive: { value: new THREE.Color(0x2DB5C7) },
          uColorDying: { value: new THREE.Color(0xE85D4E) },
          uColorDead: { value: new THREE.Color(0xE0E0E0) },
          uTipThreshold: { value: 1.0 },
          uDieThreshold: { value: 0.8 },
          uSunPosition: { value: new THREE.Vector3(15, 20, 10) },
          uTime: { value: 0 },
        },
      });
      coralMaterials.push(coralMat);
      const coral = new THREE.Mesh(coralGeo, coralMat);
      coral.position.set(
        pos[0] + (Math.random()-0.5)*0.6, 
        pos[1] + Math.random()*0.2, 
        pos[2] + (Math.random()-0.5)*0.6
      );
      coral.rotation.set(Math.random(), Math.random(), Math.random());
      coral.scale.set(1, 1.5 + Math.random(), 1);
      group.add(coral);
    }
  });
}

function updateSceneState(s: any, progress: number, elapsed: number) {
  const numActs = 5;
  for (let i = 0; i < numActs; i++) {
    const segmentStart = i / numActs;
    const segmentEnd = (i + 1) / numActs;
    s.actStates[i] = Math.max(0, Math.min(1, (progress - segmentStart) / (segmentEnd - segmentStart)));
  }

  const act2Progress = s.actStates[1]; // Sinking Islands
  const act3Progress = s.actStates[2]; // Carbon Paradox
  const act4Progress = s.actStates[3]; // Extreme Weather
  const act5Progress = s.actStates[4]; // Renewable Hope

  const drowningProgress = (act2Progress * 0.4) + (act3Progress * 0.4) + (act4Progress * 0.6);

  const tipThreshold = 1.0 - act2Progress * 0.6 - act3Progress * 0.3 - act4Progress * 0.1;
  const dieThreshold = 0.8 - act3Progress * 0.5 - act4Progress * 0.3;

  s.coralMaterials.forEach((mat: THREE.ShaderMaterial) => {
    mat.uniforms.uTipThreshold.value = Math.max(0.1, tipThreshold);
    mat.uniforms.uDieThreshold.value = Math.max(0.05, dieThreshold);
  });

  if (s.waterMaterial) {
    const waveHeight = 0.15 + act3Progress * 0.3 + act4Progress * 0.8 + drowningProgress * 0.5;
    const stormIntensity = act4Progress * 1.2;
    s.waterMaterial.uniforms.uWaveHeight.value = waveHeight;
    s.waterMaterial.uniforms.uStormIntensity.value = stormIntensity;
    s.waterMaterial.uniforms.uSubmerged.value = drowningProgress;
  }

  if (s.islandGroup) {
    s.islandGroup.position.y = -drowningProgress * 2.0;
    s.islandGroup.rotation.y = elapsed * 0.05;
  }

  if (s.skyMaterial) {
    const c1r = 0.04 + act4Progress * 0.05;
    const c1g = 0.09 - act2Progress * 0.02 + act4Progress * 0.02;
    const c1b = 0.13 - act2Progress * 0.03;
    s.skyMaterial.uniforms.c1.value.set(c1r, c1g, c1b);
  }

  if (s.directionalLight) {
    s.directionalLight.intensity = 1.5 - act4Progress * 0.8 + act5Progress * 0.5;
    s.directionalLight.color.setHSL(0.08 + act2Progress * 0.02, 0.8, 0.85 - act4Progress * 0.3 + act5Progress * 0.2);
  }

  if (s.sun) {
    s.sun.material.opacity = 1.0 - act4Progress * 0.8 + act5Progress * 0.8;
  }

  if (s.lagoonLight) {
    s.lagoonLight.intensity = 3 * (1.0 - act4Progress) + act5Progress * 4;
  }

  if (s.particles) {
    // Show particles only in act 5
    s.particles.material.opacity = act5Progress * 0.8;
  }
}
