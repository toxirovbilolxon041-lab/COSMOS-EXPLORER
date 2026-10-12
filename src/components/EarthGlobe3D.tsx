import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Language } from '../types';
import { translations } from '../i18n/translations';
import { Shield, Cloud, Sun, Compass, Globe2, Moon, Sparkles } from 'lucide-react';

interface EarthGlobe3DProps {
  language: Language;
}

type EarthLayer = 'general' | 'atmosphere' | 'interior' | 'magnetic' | 'seasons' | 'dayNight';

export const EarthGlobe3D: React.FC<EarthGlobe3DProps> = ({ language }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [activeLayer, setActiveLayer] = useState<EarthLayer>('general');
  const t = translations[language];

  // Three.js scene refs
  const magneticGroupRef = useRef<THREE.Group | null>(null);
  const atmosphereMeshRef = useRef<THREE.Mesh | null>(null);
  const cloudsMeshRef = useRef<THREE.Mesh | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 1.2, 5.8);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.replaceChildren(renderer.domElement);

    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x334155, 0.9);
    scene.add(ambientLight);

    // Directional Sun Light
    const sunLight = new THREE.DirectionalLight(0xffffff, 2.4);
    sunLight.position.set(5, 2, 4);
    scene.add(sunLight);

    // Back rim light
    const rimLight = new THREE.DirectionalLight(0x0284c7, 0.8);
    rimLight.position.set(-5, -2, -4);
    scene.add(rimLight);

    // Earth group with 23.44° axial tilt
    const earthTiltGroup = new THREE.Group();
    earthTiltGroup.rotation.z = (-23.44 * Math.PI) / 180;
    scene.add(earthTiltGroup);

    // Procedural Earth surface texture
    const earthCanvas = document.createElement('canvas');
    earthCanvas.width = 1024;
    earthCanvas.height = 512;
    const ctx = earthCanvas.getContext('2d');
    if (ctx) {
      // Ocean deep blue
      ctx.fillStyle = '#0f3a68';
      ctx.fillRect(0, 0, 1024, 512);

      // Continent landmass shapes
      ctx.fillStyle = '#22543d'; // deep forest / land
      // Africa & Eurasia
      ctx.beginPath();
      ctx.ellipse(550, 240, 140, 120, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(650, 160, 190, 90, 0, 0, Math.PI * 2);
      ctx.fill();
      // Americas
      ctx.beginPath();
      ctx.ellipse(260, 170, 90, 80, -0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(320, 340, 75, 110, 0.3, 0, Math.PI * 2);
      ctx.fill();
      // Australia
      ctx.beginPath();
      ctx.ellipse(780, 350, 60, 45, 0, 0, Math.PI * 2);
      ctx.fill();
      // Polar Ice caps
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(0, 0, 1024, 40);
      ctx.fillRect(0, 475, 1024, 37);
    }
    const earthTexture = new THREE.CanvasTexture(earthCanvas);

    // Earth Sphere
    const earthGeo = new THREE.SphereGeometry(1.8, 64, 64);
    const earthMat = new THREE.MeshStandardMaterial({
      map: earthTexture,
      roughness: 0.6,
      metalness: 0.1,
    });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    earthTiltGroup.add(earthMesh);

    // Clouds Layer
    const cloudsCanvas = document.createElement('canvas');
    cloudsCanvas.width = 512;
    cloudsCanvas.height = 256;
    const cCtx = cloudsCanvas.getContext('2d');
    if (cCtx) {
      cCtx.clearRect(0, 0, 512, 256);
      cCtx.fillStyle = 'rgba(255, 255, 255, 0.55)';
      for (let i = 0; i < 40; i++) {
        cCtx.beginPath();
        cCtx.arc(
          Math.random() * 512,
          Math.random() * 256,
          Math.random() * 35 + 10,
          0,
          Math.PI * 2
        );
        cCtx.fill();
      }
    }
    const cloudsTexture = new THREE.CanvasTexture(cloudsCanvas);
    const cloudsGeo = new THREE.SphereGeometry(1.83, 48, 48);
    const cloudsMat = new THREE.MeshStandardMaterial({
      map: cloudsTexture,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
    });
    const cloudsMesh = new THREE.Mesh(cloudsGeo, cloudsMat);
    earthTiltGroup.add(cloudsMesh);
    cloudsMeshRef.current = cloudsMesh;

    // Atmospheric Limb Glow
    const atmoGeo = new THREE.SphereGeometry(1.95, 32, 32);
    const atmoMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.22,
      side: THREE.BackSide,
    });
    const atmoMesh = new THREE.Mesh(atmoGeo, atmoMat);
    earthTiltGroup.add(atmoMesh);
    atmosphereMeshRef.current = atmoMesh;

    // Orbiting 3D Moon
    const moonGeo = new THREE.SphereGeometry(0.38, 32, 32);
    const moonMat = new THREE.MeshStandardMaterial({
      color: 0xcccccc,
      roughness: 0.9,
    });
    const moonMesh = new THREE.Mesh(moonGeo, moonMat);
    scene.add(moonMesh);

    // Magnetic field toroid lines group
    const magGroup = new THREE.Group();
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const torusGeo = new THREE.TorusGeometry(2.5, 0.02, 16, 64);
      const torusMat = new THREE.MeshBasicMaterial({
        color: 0x06b6d4,
        transparent: true,
        opacity: 0.35,
      });
      const torusMesh = new THREE.Mesh(torusGeo, torusMat);
      torusMesh.rotation.y = angle;
      magGroup.add(torusMesh);
    }
    magGroup.visible = false;
    earthTiltGroup.add(magGroup);
    magneticGroupRef.current = magGroup;

    // Mouse Drag Rotation
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

      earthMesh.rotation.y += dx * 0.008;
      earthMesh.rotation.x += dy * 0.008;
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
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Earth rotation
      if (!isDragging) {
        earthMesh.rotation.y += 0.003;
      }
      // Independent cloud drift
      cloudsMesh.rotation.y += 0.004;

      // Orbiting Moon
      const moonDist = 3.6;
      const moonAngle = time * 0.5;
      moonMesh.position.x = Math.cos(moonAngle) * moonDist;
      moonMesh.position.z = Math.sin(moonAngle) * moonDist;
      moonMesh.position.y = Math.sin(moonAngle * 0.5) * 0.4;

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
  }, []);

  // Sync layer toggles
  useEffect(() => {
    if (magneticGroupRef.current) {
      magneticGroupRef.current.visible = activeLayer === 'magnetic';
    }
    if (atmosphereMeshRef.current) {
      atmosphereMeshRef.current.visible = activeLayer === 'atmosphere' || activeLayer === 'general';
    }
  }, [activeLayer]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="text-xs uppercase font-mono tracking-widest text-cyan-500 dark:text-cyan-400 mb-1">
          {language === 'uz' ? 'Yagona hayot maskani' : 'The Living Planet'}
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {t.earth.title}
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
          {t.earth.subtitle}
        </p>
      </div>

      {/* Main Interactive Stage & Layer Controller */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* 3D Earth Globe Canvas */}
        <div className="lg:col-span-7 relative h-[440px] md:h-[500px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950/85 shadow-xl">
          <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

          {/* Floating HUD Telemetry */}
          <div className="absolute top-4 left-4 flex flex-col gap-1.5 pointer-events-none">
            <div className="px-2.5 py-1 bg-slate-900/80 backdrop-blur-md rounded border border-slate-800 text-[11px] font-mono text-cyan-300">
              Axial Tilt: 23.44° · Equator
            </div>
            <div className="px-2.5 py-1 bg-slate-900/80 backdrop-blur-md rounded border border-slate-800 text-[11px] font-mono text-slate-300">
              Orbital Speed: 29.78 km/s
            </div>
          </div>

          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-slate-400 pointer-events-none">
            <span className="bg-slate-900/80 px-2 py-1 rounded border border-slate-800 text-[11px] font-mono">
              Drag to rotate globe · Moon in real orbit
            </span>
            <div className="flex items-center gap-1.5 text-cyan-400 font-mono text-[11px]">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>LIVE 3D</span>
            </div>
          </div>
        </div>

        {/* Dynamic Interactive Layer Inspector */}
        <div className="lg:col-span-5 space-y-4">
          <div className="text-xs uppercase font-mono tracking-wider text-slate-500 dark:text-slate-400">
            {t.earth.layersTitle}
          </div>

          {/* Layer Selector Tabs */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'general' as EarthLayer, label: language === 'uz' ? 'Umumiy parametrlar' : 'General Dynamics', icon: Globe2 },
              { id: 'atmosphere' as EarthLayer, label: t.earth.layers.atmosphere, icon: Cloud },
              { id: 'magnetic' as EarthLayer, label: t.earth.layers.magnetic, icon: Shield },
              { id: 'interior' as EarthLayer, label: t.earth.layers.crust, icon: Sparkles },
              { id: 'seasons' as EarthLayer, label: t.earth.layers.seasons, icon: Sun },
              { id: 'dayNight' as EarthLayer, label: t.earth.layers.dayNight, icon: Moon },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeLayer === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveLayer(tab.id)}
                  className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer ${
                    isActive
                      ? 'bg-cyan-500/15 border border-cyan-500/50 text-cyan-500 dark:text-cyan-300 shadow-sm'
                      : 'bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Active Layer Scientific Narrative Card */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm text-xs leading-relaxed space-y-3">
            {activeLayer === 'general' && (
              <>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  {language === 'uz' ? 'Yer sayyorasining o‘ziga xosligi' : 'Unique Characteristics of Earth'}
                </h4>
                <p className="text-slate-600 dark:text-slate-300">
                  {language === 'uz'
                    ? 'Yer — Quyoshdan hisoblaganda uchinchi va zichligi bo‘yicha Quyosh tizimidagi eng zich sayyoradir (5.515 g/sm³). Uning 71% qismini okeanlar qoplaydi. Quyoshdan optimal 1 AU masofada joylashgani suvning suyuq holda saqlanishini ta’minlaydi.'
                    : 'Earth is the third planet from the Sun and the densest planetary body in the system (5.515 g/cm³). Positioned precisely inside the circumstellar habitable zone, it maintains liquid oceans that cover roughly 70.8% of its crust.'}
                </p>
                <div className="pt-2 grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div className="p-2 rounded bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 block">Diametr</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">12,742 km</span>
                  </div>
                  <div className="p-2 rounded bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 block">Sirt maydoni</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">510.1M km²</span>
                  </div>
                </div>
              </>
            )}

            {activeLayer === 'atmosphere' && (
              <>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  {language === 'uz' ? '5 ta atmosfera qatlami' : 'The 5 Atmospheric Strata'}
                </h4>
                <div className="space-y-2 text-slate-600 dark:text-slate-300">
                  <div>
                    <strong className="text-slate-900 dark:text-white">1. Troposfera (0–12 km):</strong>{' '}
                    {language === 'uz' ? 'Biz nafas oladigan, bulutlar va barcha ob-havo hodisalari yuz beradigan quyi qatlam.' : 'Where all terrestrial life breathes, and nearly all cloud and weather dynamics unfold.'}
                  </div>
                  <div>
                    <strong className="text-slate-900 dark:text-white">2. Stratosfera (12–50 km):</strong>{' '}
                    {language === 'uz' ? 'Zararli ultrabinafsha nurlarni yutuvchi Ozon qatlami joylashgan.' : 'Home to the ozone layer absorbing sterilizing solar UV-B radiation.'}
                  </div>
                  <div>
                    <strong className="text-slate-900 dark:text-white">3. Mezosfera (50–85 km):</strong>{' '}
                    {language === 'uz' ? 'Meteorlar va kosmik chang zarrachalari ishqalanishdan yonib ketadigan sovuq qatlam.' : 'Where meteors incinerate into incandescent shooting star streaks upon atmospheric friction.'}
                  </div>
                  <div>
                    <strong className="text-slate-900 dark:text-white">4. Termosfera (85–600 km):</strong>{' '}
                    {language === 'uz' ? 'Shimol nuri (qutb yog‘dusi) va ISS xalqaro kosmik stansiyasi aylanadigan hudud.' : 'Site of vibrant auroral ribbons and orbit altitude for the International Space Station.'}
                  </div>
                  <div>
                    <strong className="text-slate-900 dark:text-white">5. Ekzosfera (600–10,000 km):</strong>{' '}
                    {language === 'uz' ? 'Atmosferaning ochiq koinotga ulanib ketuvchi eng chetki chegarasi.' : 'The outermost tenuous fringe blending gradually into the interplanetary vacuum.'}
                  </div>
                </div>
              </>
            )}

            {activeLayer === 'magnetic' && (
              <>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  {language === 'uz' ? 'Magnetosfera: Sayyora qalqoni' : 'Magnetosphere: Cosmic Shield'}
                </h4>
                <p className="text-slate-600 dark:text-slate-300">
                  {language === 'uz'
                    ? 'Yerning suyuq temir-nikel tashqi yadrosi aylanishi natijasida geodinamo effekti hosil bo‘lib, ulkan magnit maydon yaratadi. Ushbu ko‘rinmas qalqon sayyoramizni quyosh shamolining halokatli ionlashtiruvchi nurlaridan himoya qiladi va atmosferamiz koinotga uchib ketishining oldini oladi.'
                    : 'Driven by convection currents in the molten liquid iron outer core (the geodynamo), Earth generates an expansive magnetosphere. This invisible dipole shield deflects ionizing solar wind particles away from our delicate biosphere.'}
                </p>
                <div className="p-2.5 rounded-lg bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800/60 text-cyan-800 dark:text-cyan-300 font-medium">
                  {language === 'uz'
                    ? 'Qutb yog‘dusi (Aurora) — quyosh shamoli zarralari magnit maydon bo‘ylab qutblarga yo‘nalib, atmosferadagi kislorod va azot bilan to‘qnashganda paydo bo‘ladi.'
                    : 'Auroras occur when solar wind particles funnel along magnetic field lines into polar latitudes, exciting atmospheric oxygen and nitrogen atoms.'}
                </div>
              </>
            )}

            {activeLayer === 'interior' && (
              <>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  {language === 'uz' ? 'Yerning ichki tuzilishi' : 'Earth Interior Structure'}
                </h4>
                <div className="space-y-2 text-slate-600 dark:text-slate-300">
                  <div>
                    <strong className="text-slate-900 dark:text-white">Qobiq (0–70 km):</strong>{' '}
                    {language === 'uz' ? 'Qattiq toshli qatlam, okeanik va qit’aviy plitalardan iborat.' : 'Rigid outermost shell composed of continental granites and dense oceanic basalts.'}
                  </div>
                  <div>
                    <strong className="text-slate-900 dark:text-white">Mantiya (70–2900 km):</strong>{' '}
                    {language === 'uz' ? 'Yer massasining 84% qismi; yarim suyuq harakatdagi silikat jinslar.' : 'Hot, semi-solid silicate rock driving plate tectonics via slow thermal convection.'}
                  </div>
                  <div>
                    <strong className="text-slate-900 dark:text-white">Tashqi yadro (2900–5150 km):</strong>{' '}
                    {language === 'uz' ? 'Suyuq temir va nikel; magnit maydon generatori.' : 'Liquid iron-nickel ocean generating our global magnetic field.'}
                  </div>
                  <div>
                    <strong className="text-slate-900 dark:text-white">Ichki yadro (5150–6371 km):</strong>{' '}
                    {language === 'uz' ? 'Ulkan bosim ostida qattiq kristallangan temir-nikel shari (harorat ~5400°C).' : 'Solid crystallized iron-nickel sphere under crushing pressure, as hot as the surface of the Sun.'}
                  </div>
                </div>
              </>
            )}

            {activeLayer === 'seasons' && (
              <>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  {language === 'uz' ? '23.44° o‘q qiyaligi va fasllar' : 'Axial Tilt (23.44°) & Seasons'}
                </h4>
                <p className="text-slate-600 dark:text-slate-300">
                  {language === 'uz'
                    ? 'Fasllarning almashinuvi Yerning Quyoshdan uzoqlashishi bilan emas, balki uning o‘q qiyaligi (23.44°) bilan bog‘liqdir! Yozda shimoliy yarimshar Quyoshga tomon qiyalanib, nurlar to‘g‘ri burchak ostida tushadi va kunlar uzayadi.'
                    : 'Earth’s seasonal changes stem not from varying distance to the Sun, but exclusively from its 23.44° axial tilt. When the Northern Hemisphere tilts sunward, daylight hours lengthen and solar irradiance hits at steeper angles, causing summer.'}
                </p>
              </>
            )}

            {activeLayer === 'dayNight' && (
              <>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  {language === 'uz' ? 'Kun va tunning almashinuvi' : 'Diurnal Cycle & Terminator Line'}
                </h4>
                <p className="text-slate-600 dark:text-slate-300">
                  {language === 'uz'
                    ? 'Yer g‘arbdan sharqqa tomon o‘z o‘qi atrofida to‘liq bir marta aylanishi uchun 23 soat, 56 daqiqa va 4 soniya (yulduz sutkasi) sarflaydi. Yorug‘ va qorong‘i yarimsharlarni ajratib turuvchi chegara "Terminator chizig‘i" deb ataladi.'
                    : 'Rotating from west to east once every 23 hours, 56 minutes, and 4 seconds (sidereal day), Earth creates our day-night rhythm. The moving twilight boundary dividing sunlit day from shadow night is known as the terminator line.'}
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
