import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Language, MoonPhaseInfo } from '../types';
import { MOON_PHASES } from '../data/spaceData';
import { translations } from '../i18n/translations';
import { Moon, Compass, Sparkles, Rocket } from 'lucide-react';

interface MoonExplorer3DProps {
  language: Language;
}

export const MoonExplorer3D: React.FC<MoonExplorer3DProps> = ({ language }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [selectedPhase, setSelectedPhase] = useState<MoonPhaseInfo>(MOON_PHASES[4]); // Full Moon default
  const sunLightRef = useRef<THREE.DirectionalLight | null>(null);
  const t = translations[language];

  // 3D Setup
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0, 5.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.replaceChildren(renderer.domElement);

    // Very subtle ambient light (lunar shadows are deep and contrasty in space)
    const ambientLight = new THREE.AmbientLight(0x1e293b, 0.25);
    scene.add(ambientLight);

    // Directional Sun Light that rotates based on lunar phase angle
    const sunLight = new THREE.DirectionalLight(0xfffdf0, 3.2);
    sunLight.position.set(0, 0, 6); // default pointing front
    scene.add(sunLight);
    sunLightRef.current = sunLight;

    // Earthshine light (faint bluish light bouncing back from Earth onto the dark side)
    const earthshineLight = new THREE.DirectionalLight(0x0284c7, 0.15);
    earthshineLight.position.set(0, 0, 5);
    scene.add(earthshineLight);

    // Procedural cratered lunar texture
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Base gray regolith
      ctx.fillStyle = '#8c8d8f';
      ctx.fillRect(0, 0, 1024, 512);

      // Dark basaltic plains (Lunar Maria - Sea of Tranquility, etc.)
      ctx.fillStyle = '#55585d';
      // Mare Tranquillitatis & Serenitatis
      ctx.beginPath();
      ctx.ellipse(450, 220, 80, 50, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(420, 150, 70, 55, -0.1, 0, Math.PI * 2);
      ctx.fill();
      // Oceanus Procellarum
      ctx.beginPath();
      ctx.ellipse(260, 220, 130, 90, 0.1, 0, Math.PI * 2);
      ctx.fill();
      // Mare Imbrium
      ctx.beginPath();
      ctx.arc(310, 130, 70, 0, Math.PI * 2);
      ctx.fill();

      // Craters & ejecta rays
      for (let i = 0; i < 500; i++) {
        const cx = Math.random() * 1024;
        const cy = Math.random() * 512;
        const r = Math.random() * 14 + 1.5;

        // Rim
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.beginPath();
        ctx.arc(cx, cy, r + 1, 0, Math.PI * 2);
        ctx.fill();

        // Floor
        ctx.fillStyle = 'rgba(40, 40, 45, 0.4)';
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Bright Tycho crater with radiant rays
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.arc(430, 370, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(240, 240, 240, 0.25)';
      ctx.lineWidth = 1;
      for (let a = 0; a < Math.PI * 2; a += 0.25) {
        ctx.beginPath();
        ctx.moveTo(430, 370);
        ctx.lineTo(430 + Math.cos(a) * 120, 370 + Math.sin(a) * 120);
        ctx.stroke();
      }
    }
    const moonTexture = new THREE.CanvasTexture(canvas);

    // Moon Sphere
    const moonGeo = new THREE.SphereGeometry(1.8, 64, 64);
    const moonMat = new THREE.MeshStandardMaterial({
      map: moonTexture,
      roughness: 0.95,
      metalness: 0.05,
    });
    const moonMesh = new THREE.Mesh(moonGeo, moonMat);
    scene.add(moonMesh);

    // Interactive Drag to Rotate Moon
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
      moonMesh.rotation.y += dx * 0.008;
      moonMesh.rotation.x += dy * 0.008;
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
      if (!isDragging) {
        moonMesh.rotation.y += 0.001; // very slow drift
      }
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

  // Update Directional Sunlight based on selected phase angle
  useEffect(() => {
    if (!sunLightRef.current) return;
    // Angle in radians
    const rad = (selectedPhase.phaseAngleDeg * Math.PI) / 180;
    const distance = 8;
    // When phaseAngle is 180 (Full Moon), Sun is behind camera: (0, 0, 8)
    // When phaseAngle is 0 (New Moon), Sun is behind Moon: (0, 0, -8)
    // When phaseAngle is 90 (First Quarter), Sun is on right: (8, 0, 0)
    const x = Math.sin(rad) * distance;
    const z = -Math.cos(rad) * distance;
    sunLightRef.current.position.set(x, 1, z);
  }, [selectedPhase]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="text-xs uppercase font-mono tracking-widest text-cyan-500 dark:text-cyan-400 mb-1">
          {language === 'uz' ? 'Tabiiy yo‘ldosh' : 'Natural Satellite'}
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {t.moon.title}
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
          {t.moon.subtitle}
        </p>
      </div>

      {/* 3D Stage + Moon Phase Interactive Selector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* 3D Moon Canvas */}
        <div className="lg:col-span-7 relative h-[440px] md:h-[500px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950/90 shadow-xl">
          <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

          {/* Phase Telemetry Banner */}
          <div className="absolute top-4 left-4 flex flex-col gap-1.5 pointer-events-none">
            <div className="px-3 py-1.5 bg-slate-900/85 backdrop-blur-md rounded-lg border border-slate-800 text-xs text-white flex items-center gap-2">
              <Moon className="w-4 h-4 text-cyan-400" />
              <span className="font-bold">
                {language === 'uz' ? selectedPhase.nameUz : selectedPhase.nameEn}
              </span>
              <span className="text-cyan-400 font-mono text-[11px]">
                ({selectedPhase.illumination}%)
              </span>
            </div>
          </div>

          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-slate-400 pointer-events-none">
            <span className="bg-slate-900/80 px-2.5 py-1 rounded border border-slate-800 text-[11px] font-mono">
              Drag to inspect craters · Light updates with phase
            </span>
            <span className="text-[11px] font-mono text-cyan-400">
              Angle: {selectedPhase.phaseAngleDeg}°
            </span>
          </div>
        </div>

        {/* Phase Selector & Details Column */}
        <div className="lg:col-span-5 space-y-5">
          <div>
            <div className="text-xs uppercase font-mono tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              {t.moon.phasesTitle}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {t.moon.phaseSelectHint}
            </p>
          </div>

          {/* 8 Moon Phase Clickable Buttons */}
          <div className="grid grid-cols-2 gap-2">
            {MOON_PHASES.map((phase) => {
              const isSelected = selectedPhase.id === phase.id;
              return (
                <button
                  key={phase.id}
                  onClick={() => setSelectedPhase(phase)}
                  className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-500/15 border border-cyan-500/60 text-cyan-500 dark:text-cyan-300 shadow-sm'
                      : 'bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <span className="truncate">
                    {language === 'uz' ? phase.nameUz : phase.nameEn}
                  </span>
                  <span className="font-mono text-[10px] text-slate-400 shrink-0 ml-1.5">
                    {phase.illumination}%
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Phase Description Card */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
              {language === 'uz' ? selectedPhase.nameUz : selectedPhase.nameEn}
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {language === 'uz' ? selectedPhase.descriptionUz : selectedPhase.descriptionEn}
            </p>
          </div>

          {/* Lunar Physical Telemetry */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 block uppercase">
                Diametri
              </span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                3,474 km
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 block uppercase">
                Masofa
              </span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                384,400 km
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 block uppercase">
                Gravitatsiya
              </span>
              <span className="font-mono font-bold text-cyan-500">
                1.62 m/s² (1/6)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Prominent Craters & Lunar Maria */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
            <Compass className="w-4 h-4 text-cyan-500" />
            <span>{t.moon.cratersTitle}</span>
          </div>
          <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800">
              <strong className="text-slate-900 dark:text-white block font-semibold">
                Tinchlik dengizi (Mare Tranquillitatis):
              </strong>
              {language === 'uz'
                ? 'Qadimiy qotib qolgan bazaltik lava tekisligi. 1969-yilda Apollo 11 aynan shu yerga qo‘ngan.'
                : 'Dark basaltic flood plain where Apollo 11 made its historic inaugural landing in 1969.'}
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800">
              <strong className="text-slate-900 dark:text-white block font-semibold">
                Tixo krateri (Tycho):
              </strong>
              {language === 'uz'
                ? 'Janubiy tog‘liklarda joylashgan yosh zarba krateri (85 km diametr). 1500 km ga cho‘zilgan oq nurlari butun Oy yuzida ko‘rinadi.'
                : 'Prominent 85-km impact crater surrounded by radiant bright ejecta rays reaching over 1,500 km.'}
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800">
              <strong className="text-slate-900 dark:text-white block font-semibold">
                Kopernik krateri (Copernicus):
              </strong>
              {language === 'uz'
                ? '93 km kenglikdagi chuqur va terasli devorlarga ega bo‘lgan markaziy cho‘qqili klassik krater.'
                : 'Spectacular 93-km complex crater featuring stepped terraced walls and central mountain peaks.'}
            </div>
          </div>
        </div>

        {/* Historic Lunar Missions */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
            <Rocket className="w-4 h-4 text-cyan-500" />
            <span>{t.moon.missionsTitle}</span>
          </div>
          <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800">
              <div className="flex justify-between items-center mb-0.5">
                <strong className="text-slate-900 dark:text-white font-semibold">Apollo 11 (1969)</strong>
                <span className="font-mono text-[10px] text-cyan-500">NASA</span>
              </div>
              <span>{language === 'uz' ? 'Nil Armstrong va Bazz Oldrin Oyga inson qadamini ilk bor olib kirdi.' : 'First human crewed lunar surface touchdown by Neil Armstrong and Buzz Aldrin.'}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800">
              <div className="flex justify-between items-center mb-0.5">
                <strong className="text-slate-900 dark:text-white font-semibold">Chang’e 4 (2019)</strong>
                <span className="font-mono text-[10px] text-cyan-500">CNSA</span>
              </div>
              <span>{language === 'uz' ? 'Tarixda birinchi marta Oyning orqa (ko‘rinmas) tomoniga muvaffaqiyatli qo‘ndi.' : 'First probe in history to make a soft landing on the far side of the Moon.'}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800">
              <div className="flex justify-between items-center mb-0.5">
                <strong className="text-slate-900 dark:text-white font-semibold">Artemis (2025+)</strong>
                <span className="font-mono text-[10px] text-cyan-500">NASA / Int.</span>
              </div>
              <span>{language === 'uz' ? 'Janubiy qutbdagi suv muzini qazish va insoniyatni doimiy stansiya bilan qaytarish.' : 'Sustainable lunar exploration aiming to extract south pole water ice reserves.'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
