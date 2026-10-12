import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Language } from '../types';
import { translations } from '../i18n/translations';
import { ASSET_IMAGES } from '../data/spaceData';
import { Sparkles, Sliders, Eye, Orbit, Zap, Atom } from 'lucide-react';

interface BlackHoleSimulationProps {
  language: Language;
}

export const BlackHoleSimulation: React.FC<BlackHoleSimulationProps> = ({ language }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [solarMasses, setSolarMasses] = useState<number>(10); // 10 to 4,000,000
  const [spinParam, setSpinParam] = useState<number>(0.85); // 0 to 0.99
  const [showDoppler, setShowDoppler] = useState<boolean>(true);
  const [blackHoleType, setBlackHoleType] = useState<'stellar' | 'supermassive'>('stellar');

  const t = translations[language];

  // Three.js Scene References
  const diskMeshRef = useRef<THREE.Mesh | null>(null);
  const haloMeshRef = useRef<THREE.Mesh | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 2.5, 7.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.replaceChildren(renderer.domElement);

    // 1. Black Hole Core (Absolute Black Event Horizon)
    const horizonGeo = new THREE.SphereGeometry(1.2, 64, 64);
    const horizonMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const horizonMesh = new THREE.Mesh(horizonGeo, horizonMat);
    scene.add(horizonMesh);

    // 2. Gravitational Lensing Light Ring (Photon Sphere)
    const haloGeo = new THREE.RingGeometry(1.22, 1.45, 64);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0xffaa33,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
    });
    const haloMesh = new THREE.Mesh(haloGeo, haloMat);
    haloMesh.rotation.x = Math.PI / 2;
    scene.add(haloMesh);
    haloMeshRef.current = haloMesh;

    // 3. Relativistic Accretion Disk Canvas Texture (with Doppler beaming gradient)
    const diskCanvas = document.createElement('canvas');
    diskCanvas.width = 512;
    diskCanvas.height = 512;
    const dCtx = diskCanvas.getContext('2d');
    if (dCtx) {
      const grad = dCtx.createRadialGradient(256, 256, 120, 256, 256, 256);
      grad.addColorStop(0, '#ffffff'); // superheated inner edge
      grad.addColorStop(0.15, '#38bdf8'); // relativistic cyan-blue shift
      grad.addColorStop(0.4, '#fb923c'); // bright orange
      grad.addColorStop(0.75, '#b91c1c'); // red shift
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      dCtx.fillStyle = grad;
      dCtx.fillRect(0, 0, 512, 512);

      // Add swirling turbulence lines
      dCtx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      dCtx.lineWidth = 2;
      for (let r = 140; r < 240; r += 12) {
        dCtx.beginPath();
        dCtx.arc(256, 256, r, 0, Math.PI * 2);
        dCtx.stroke();
      }
    }
    const diskTexture = new THREE.CanvasTexture(diskCanvas);

    const diskGeo = new THREE.RingGeometry(1.5, 4.2, 128);
    const diskMat = new THREE.MeshBasicMaterial({
      map: diskTexture,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.88,
      blending: THREE.AdditiveBlending,
    });
    const diskMesh = new THREE.Mesh(diskGeo, diskMat);
    diskMesh.rotation.x = Math.PI / 2.3; // inclined view
    scene.add(diskMesh);
    diskMeshRef.current = diskMesh;

    // 4. Infalling Particles System
    const particleCount = 1200;
    const posArray = new Float32Array(particleCount * 3);
    const particleRadii = new Float32Array(particleCount);
    const particleSpeeds = new Float32Array(particleCount);
    const particleAngles = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const r = Math.random() * 3.5 + 1.4;
      const angle = Math.random() * Math.PI * 2;
      particleRadii[i] = r;
      particleAngles[i] = angle;
      particleSpeeds[i] = (1 / Math.sqrt(r)) * 0.04;

      posArray[i * 3] = Math.cos(angle) * r;
      posArray[i * 3 + 1] = (Math.random() - 0.5) * 0.15;
      posArray[i * 3 + 2] = Math.sin(angle) * r;
    }

    const particlesGeo = new THREE.BufferGeometry();
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMat = new THREE.PointsMaterial({
      size: 0.04,
      color: 0xfed7aa,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particlesGeo, particlesMat);
    particles.rotation.x = Math.PI / 2.3;
    scene.add(particles);
    particlesRef.current = particles;

    // Drag to Inspect
    let isDragging = false;
    let prevX = 0;
    let prevY = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevX = e.clientX;
      prevY = e.clientY;
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - prevX;
      const dy = e.clientY - prevY;
      prevX = e.clientX;
      prevY = e.clientY;

      diskMesh.rotation.z += dx * 0.006;
      particles.rotation.z += dx * 0.006;
      camera.position.y = Math.max(0.5, Math.min(5, camera.position.y - dy * 0.01));
      camera.lookAt(0, 0, 0);
    };
    const onMouseUp = () => {
      isDragging = false;
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Animation Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      // Rotate disk
      diskMesh.rotation.z += 0.012 * (1 + spinParam);
      haloMesh.rotation.z += 0.006;

      // Update Infalling particles
      const positions = particlesGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        particleAngles[i] += particleSpeeds[i] * (1 + spinParam * 0.5);
        particleRadii[i] -= 0.002;

        // Reset if captured by event horizon
        if (particleRadii[i] < 1.25) {
          particleRadii[i] = 4.2;
          particleAngles[i] = Math.random() * Math.PI * 2;
        }

        const r = particleRadii[i];
        const a = particleAngles[i];
        positions[i * 3] = Math.cos(a) * r;
        positions[i * 3 + 2] = Math.sin(a) * r;
      }
      particlesGeo.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      domElement.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      cancelAnimationFrame(animId);
      renderer.dispose();
    };
  }, [spinParam, showDoppler]);

  // Schwarzschild radius formula: Rs = 2GM / c^2 ≈ 2.95 km * (M / M_sun)
  const schwarzschildKm = (2.95 * solarMasses).toLocaleString();

  const handleSelectType = (type: 'stellar' | 'supermassive') => {
    setBlackHoleType(type);
    if (type === 'stellar') {
      setSolarMasses(15);
      setSpinParam(0.7);
    } else {
      setSolarMasses(4150000); // Sagittarius A* mass
      setSpinParam(0.95);
    }
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <div className="text-xs uppercase font-mono tracking-widest text-cyan-500 dark:text-cyan-400 mb-1">
          {language === 'uz' ? 'Astrofizika va Umumiy Nisbiylik' : 'Astrophysics & General Relativity'}
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {t.blackHoles.title}
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
          {t.blackHoles.subtitle}
        </p>
      </div>

      {/* 3D Simulation Canvas + Interactive Telemetry Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* 3D Simulation Stage */}
        <div className="lg:col-span-7 relative h-[460px] md:h-[520px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950/95 shadow-2xl">
          <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

          {/* Telemetry HUD Overlays */}
          <div className="absolute top-4 left-4 flex flex-col gap-1.5 pointer-events-none">
            <div className="px-3 py-1 bg-slate-900/85 backdrop-blur-md rounded border border-slate-800 text-[11px] font-mono text-cyan-400">
              Rs (Shvarschild radiusi): {schwarzschildKm} km
            </div>
            <div className="px-3 py-1 bg-slate-900/85 backdrop-blur-md rounded border border-slate-800 text-[11px] font-mono text-amber-300">
              Spin (Kerr parametri a*): {spinParam.toFixed(2)} c
            </div>
          </div>

          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-slate-400 pointer-events-none">
            <span className="bg-slate-900/80 px-2.5 py-1 rounded border border-slate-800 text-[11px] font-mono">
              Doppler beaming & gravitational lensing simulated
            </span>
            <span className="text-[11px] font-mono text-cyan-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>ACTIVE PHYSICS</span>
            </span>
          </div>
        </div>

        {/* Live Simulation Parameters Controls */}
        <div className="lg:col-span-5 space-y-5">
          <div className="flex items-center gap-2 text-xs uppercase font-mono tracking-wider text-slate-500 dark:text-slate-400">
            <Sliders className="w-4 h-4 text-cyan-500" />
            <span>{language === 'uz' ? 'Simulyatsiya parametrlari' : 'Simulation Parameters'}</span>
          </div>

          {/* Black Hole Type Quick Presets */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleSelectType('stellar')}
              className={`p-3 rounded-xl border text-xs font-semibold text-left transition-all cursor-pointer ${
                blackHoleType === 'stellar'
                  ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-500 dark:text-cyan-300 shadow-sm'
                  : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
              }`}
            >
              <div className="font-bold">{t.blackHoles.stellar}</div>
              <div className="font-mono text-[10px] text-slate-400 mt-0.5">Cygnus X-1 (~15 M☉)</div>
            </button>
            <button
              onClick={() => handleSelectType('supermassive')}
              className={`p-3 rounded-xl border text-xs font-semibold text-left transition-all cursor-pointer ${
                blackHoleType === 'supermassive'
                  ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-500 dark:text-cyan-300 shadow-sm'
                  : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
              }`}
            >
              <div className="font-bold">{t.blackHoles.supermassive}</div>
              <div className="font-mono text-[10px] text-slate-400 mt-0.5">Sagittarius A* (4.15M M☉)</div>
            </button>
          </div>

          {/* Sliders Box */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
            {/* Spin Parameter a */}
            <div>
              <div className="flex justify-between items-center mb-1 text-xs">
                <span className="text-slate-600 dark:text-slate-400">
                  {language === 'uz' ? 'Aylanish tezligi (Spin a)' : 'Spin Parameter (Kerr a)'}
                </span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {spinParam.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="0.99"
                step="0.01"
                value={spinParam}
                onChange={(e) => setSpinParam(parseFloat(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
              <span className="text-[10px] text-slate-400 block mt-1">
                {language === 'uz' ? '0 = Shvarschild (statik), 0.99 = Kerr (o‘ta tez aylanuvchi)' : '0 = Static Schwarzschild, 0.99 = Extremal spinning Kerr'}
              </span>
            </div>

            {/* Mass Slider (log scale) */}
            <div>
              <div className="flex justify-between items-center mb-1 text-xs">
                <span className="text-slate-600 dark:text-slate-400">
                  {language === 'uz' ? 'Massa (Quyosh massasi M☉)' : 'Mass (Solar Masses M☉)'}
                </span>
                <span className="font-mono font-bold text-cyan-500">
                  {solarMasses.toLocaleString()} M☉
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="100"
                step="1"
                value={solarMasses > 100 ? 50 : solarMasses}
                onChange={(e) => {
                  setBlackHoleType('stellar');
                  setSolarMasses(parseInt(e.target.value, 10));
                }}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Photographic Insight Banner with generated asset */}
          <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 group shadow-md">
            <img
              src={ASSET_IMAGES.blackHole}
              alt="Black hole simulation"
              referrerPolicy="no-referrer"
              className="w-full h-36 object-cover transform group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent flex flex-col justify-end p-3 text-white">
              <span className="text-[10px] font-mono text-cyan-300 uppercase">
                {language === 'uz' ? 'Haqiqiy astrofizik kuzatuv' : 'Empirical Observation'}
              </span>
              <p className="text-xs font-semibold leading-tight">
                {language === 'uz'
                  ? 'Event Horizon Telescope (EHT) 2019 va 2022-yillarda M87* va Sgr A* qora tuynuklarining gravitatsion soyasini suratga oldi.'
                  : 'Event Horizon Telescope resolved the shadow and glowing photon ring of M87* and Sagittarius A*.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Deep Conceptual Explanations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2.5">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
            <Orbit className="w-4 h-4 text-cyan-500" />
            <span>{t.blackHoles.eventHorizon}</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {language === 'uz'
              ? 'Voqealar gorizonti — bu qora tuynuk atrofidagi orqaga qaytish imkoni bo‘lmagan geometrik sferadir. Ushbu chegara ichiga tushgan har qanday narsa (hatto yorug‘lik fotonlari ham) tashqariga chiqa olmaydi, chunki ikkinchi kosmik tezlik yorug‘lik tezligidan (c) oshib ketadi.'
              : 'The event horizon is the defining boundary of no return. Within this threshold, the escape velocity exceeds the speed of light in vacuum, requiring all spacetime geodesics to terminate inwards.'}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2.5">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
            <Zap className="w-4 h-4 text-amber-500" />
            <span>{t.blackHoles.accretionDisk}</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {language === 'uz'
              ? 'Qora tuynuk yaqinidan o‘tgan yulduz gazlari va materiya to‘g‘ridan-to‘g‘ri ichiga tushmay, uning atrofida aylanma disk hosil qiladi. Ulkan tezlikdagi ishqalanish tufayli gaz millionlab darajaga qizib, kuchli rentgen va gamma nurlari sochadi.'
              : 'Infalling matter forms a churning accretion disk orbiting at relativistic fractions of light speed. Intense viscously dissipated friction superheats plasma to tens of millions of degrees, radiating intense X-ray luminosity.'}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2.5">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
            <Eye className="w-4 h-4 text-purple-500" />
            <span>{t.blackHoles.gravityEffect}</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {language === 'uz'
              ? 'Qora tuynukning massasi fazo-vaqtni shunchalik kuchli egradiki, uning orqasidagi yulduzlar va diskning orqa tomoni bizga qora tuynuk ustida va ostida bukilgan nurli halqa shaklida ko‘rinadi ("Eynshteyn halqasi").'
              : 'Immense gravitational fields bend the paths of light rays propagating around the singularity. Observers view light originating behind the black hole warped above and below its equatorial silhouette.'}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2.5">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
            <Atom className="w-4 h-4 text-emerald-500" />
            <span>{t.blackHoles.singularity}</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {language === 'uz'
              ? 'Klassik umumiy nisbiylik nazariyasiga ko‘ra, qora tuynukning markazida butun massa nol hajmga siqilgan cheksiz zichlikdagi gravitatsion singulyarlik yotadi. Bu yerda barcha ma’lum fizika tenglamalari cheksizlikka aylanadi.'
              : 'At the geometric center lies a gravitational singularity where spacetime curvature diverges to infinity, signaling the breakdown of classical General Relativity awaiting a quantum gravity synthesis.'}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2.5">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
            <Sparkles className="w-4 h-4 text-cyan-500" />
            <span>{t.blackHoles.hawking}</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {language === 'uz'
              ? 'Stiven Xoking kvant effektlari sababli voqealar gorizonti yaqinida virtual zarracha-antizarracha juftliklari ajralib, bittasi koinotga nurlanish sifatida uchib ketishini, natijada qora tuynuk asta-sekin massasini yo‘qotib bug‘lanishini kashf etgan.'
              : 'Stephen Hawking demonstrated that quantum fluctuations near the event horizon spontaneously separate virtual particle-antiparticle pairs, steadily radiating thermal energy and evaporating the black hole.'}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2.5">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
            <Sparkles className="w-4 h-4 text-rose-500" />
            <span>{t.blackHoles.spaghettification}</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {language === 'uz'
              ? 'Agar inson yoki yulduz qora tuynukka yaqinlashsa, uning oyoq qismiga tushadigan tortishish kuchi bosh qismidagiga qaraganda millionlab marta kuchliroq bo‘ladi. Ushbu gravitatsion gradient tanani ip kabi cho‘zib yuboradi.'
              : 'Differential gravitational tidal forces across an infalling object stretch it vertically along the radial vector while compressing it horizontally, ripping structures apart into microscopic particle ribbons.'}
          </p>
        </div>
      </div>
    </div>
  );
};
