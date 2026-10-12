import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { PlanetData, Language } from '../types';
import { PLANETS_DATA } from '../data/spaceData';
import { translations } from '../i18n/translations';
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Scale,
  Thermometer,
  RotateCw,
  Compass,
  Layers,
  Sparkles,
} from 'lucide-react';

interface Planet3DViewProps {
  planetId: string;
  language: Language;
  onSelectPlanet: (id: string) => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}

export const Planet3DView: React.FC<Planet3DViewProps> = ({
  planetId,
  language,
  onSelectPlanet,
  isFavorite,
  onToggleFavorite,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const planet = PLANETS_DATA.find((p) => p.id === planetId) || PLANETS_DATA[0];
  const t = translations[language];

  const [autoRotate, setAutoRotate] = useState(true);

  // 3D Setup
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0, 7);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.replaceChildren(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff5e6, 2.5);
    sunLight.position.set(5, 3, 5);
    scene.add(sunLight);

    const backRimLight = new THREE.DirectionalLight(0x38bdf8, 0.6);
    backRimLight.position.set(-5, -2, -5);
    scene.add(backRimLight);

    // Planet Texture Canvas
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Base gradient
      const grad = ctx.createLinearGradient(0, 0, 0, 512);
      grad.addColorStop(0, planet.colorHex);
      grad.addColorStop(0.3, planet.accentHex);
      grad.addColorStop(0.7, planet.colorHex);
      grad.addColorStop(1, planet.accentHex);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1024, 512);

      // Procedural surface details
      for (let i = 0; i < 400; i++) {
        const x = Math.random() * 1024;
        const y = Math.random() * 512;
        const r = Math.random() * 20 + 2;
        ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)';
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      // Horizontal bands
      for (let y = 0; y < 512; y += 14) {
        ctx.fillStyle = y % 28 === 0 ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
        ctx.fillRect(0, y, 1024, 7);
      }
    }
    const texture = new THREE.CanvasTexture(canvas);

    // Planet Mesh
    const sphereGeo = new THREE.SphereGeometry(2, 64, 64);
    const sphereMat = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.65,
      metalness: 0.1,
    });
    const planetMesh = new THREE.Mesh(sphereGeo, sphereMat);
    planetMesh.rotation.z = (planet.axialTiltDeg * Math.PI) / 180;
    scene.add(planetMesh);

    // Rings if applicable
    let ringMesh: THREE.Mesh | null = null;
    if (planet.hasRings) {
      const ringGeo = new THREE.RingGeometry(2.6, 4.8, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(planet.accentHex),
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.7,
      });
      ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = Math.PI / 2;
      planetMesh.add(ringMesh);
    }

    // Atmosphere Glow layer
    const glowGeo = new THREE.SphereGeometry(2.15, 32, 32);
    const glowMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(planet.colorHex),
      transparent: true,
      opacity: 0.18,
      side: THREE.BackSide,
    });
    const glowMesh = new THREE.Mesh(glowGeo, glowMat);
    planetMesh.add(glowMesh);

    // Interactive Drag to Rotate
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
      planetMesh.rotation.y += dx * 0.01;
      planetMesh.rotation.x += dy * 0.01;
    };
    const onMouseUp = () => {
      isDragging = false;
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Animation
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (autoRotate && !isDragging) {
        planetMesh.rotation.y += 0.005;
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
  }, [planet, autoRotate]);

  // Navigate to previous / next planet
  const currentIndex = PLANETS_DATA.findIndex((p) => p.id === planet.id);
  const prevPlanet = PLANETS_DATA[(currentIndex - 1 + PLANETS_DATA.length) % PLANETS_DATA.length];
  const nextPlanet = PLANETS_DATA[(currentIndex + 1) % PLANETS_DATA.length];

  return (
    <div className="space-y-8">
      {/* Top Navigation Strip */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onSelectPlanet(prevPlanet.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>{language === 'uz' ? prevPlanet.nameUz : prevPlanet.nameEn}</span>
          </button>
          <button
            onClick={() => onSelectPlanet(nextPlanet.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <span>{language === 'uz' ? nextPlanet.nameUz : nextPlanet.nameEn}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Favorite Bookmark Button */}
        <button
          onClick={() => onToggleFavorite(planet.id)}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
            isFavorite
              ? 'bg-rose-500/10 border-rose-500 text-rose-500 shadow-sm'
              : 'border-slate-300 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-rose-500 hover:border-rose-300'
          }`}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500' : ''}`} />
          <span>{isFavorite ? (language === 'uz' ? 'Saqlangan' : 'Favorited') : (language === 'uz' ? 'Sevimliga qo‘shish' : 'Add to Favorites')}</span>
        </button>
      </div>

      {/* Main Showcase: 3D Stage + Core Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* 3D Viewport Column */}
        <div className="lg:col-span-6 relative h-[420px] md:h-[480px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950/80 shadow-xl">
          <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
          
          {/* 3D Viewport Controls */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span className="px-2.5 py-1 text-[11px] font-mono rounded bg-slate-900/80 border border-slate-800 text-slate-300">
              Axial Tilt: {planet.axialTiltDeg}°
            </span>
          </div>

          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-slate-400 pointer-events-none">
            <span className="bg-slate-900/80 px-2 py-1 rounded border border-slate-800 text-[11px] font-mono">
              Drag to spin
            </span>
            <button
              onClick={() => setAutoRotate(!autoRotate)}
              className="pointer-events-auto flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
            >
              <RotateCw className="w-3.5 h-3.5 text-cyan-400" />
              <span>{autoRotate ? 'Pause' : 'Auto-Rotate'}</span>
            </button>
          </div>
        </div>

        {/* Narrative & Telemetry Overview */}
        <div className="lg:col-span-6 space-y-5">
          <div>
            <div className="text-xs uppercase font-mono tracking-widest text-cyan-500 dark:text-cyan-400 mb-1">
              {language === 'uz' ? planet.typeUz : planet.typeEn}
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {language === 'uz' ? planet.nameUz : planet.nameEn}
            </h1>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mt-1">
              {language === 'uz' ? planet.taglineUz : planet.taglineEn}
            </p>
          </div>

          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            {language === 'uz' ? planet.descriptionUz : planet.descriptionEn}
          </p>

          {/* Quick Telemetry Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="block text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase">
                {t.planets.metrics.diameter}
              </span>
              <span className="text-base font-bold font-mono text-slate-900 dark:text-white tabular-nums">
                {planet.diameterKm.toLocaleString()} km
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="block text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase">
                {t.planets.metrics.gravity}
              </span>
              <span className="text-base font-bold font-mono text-slate-900 dark:text-white tabular-nums">
                {planet.gravityMps2} m/s²
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="block text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase">
                {t.planets.metrics.avgTemp}
              </span>
              <span className="text-base font-bold font-mono text-amber-500 tabular-nums">
                {planet.avgTempC > 0 ? `+${planet.avgTempC}` : planet.avgTempC}°C
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="block text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase">
                {t.planets.metrics.moons}
              </span>
              <span className="text-base font-bold font-mono text-cyan-500 tabular-nums">
                {planet.moonsCount}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Deep Scientific Parameters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Orbital Characteristics */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white font-semibold text-sm">
            <Compass className="w-4 h-4 text-cyan-500" />
            <span>{language === 'uz' ? 'Orbital parametrlar' : 'Orbital Characteristics'}</span>
          </div>
          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-500 dark:text-slate-400 block">{t.planets.metrics.distanceFromSun}</span>
              <span className="font-mono font-semibold text-slate-900 dark:text-slate-200 text-sm">
                {planet.distanceFromSunKm} ({planet.distanceAU} AU)
              </span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block">{t.planets.metrics.dayLength}</span>
              <span className="font-mono font-semibold text-slate-900 dark:text-slate-200 text-sm">
                {planet.dayLengthHours}
              </span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block">{t.planets.metrics.yearLength}</span>
              <span className="font-mono font-semibold text-slate-900 dark:text-slate-200 text-sm">
                {planet.yearLengthDays}
              </span>
            </div>
          </div>
        </div>

        {/* Physical & Chemical Composition */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white font-semibold text-sm">
            <Layers className="w-4 h-4 text-cyan-500" />
            <span>{language === 'uz' ? 'Tuzilishi va atmosferasi' : 'Atmosphere & Internal Geology'}</span>
          </div>
          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-500 dark:text-slate-400 block">{t.planets.metrics.mass}</span>
              <span className="font-mono font-semibold text-slate-900 dark:text-slate-200 text-sm">
                {planet.massKg}
              </span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block">{t.planets.metrics.atmosphere}</span>
              <span className="text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                {language === 'uz' ? planet.atmosphereUz : planet.atmosphereEn}
              </span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block">{t.planets.metrics.composition}</span>
              <span className="text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                {language === 'uz' ? planet.compositionUz : planet.compositionEn}
              </span>
            </div>
          </div>
        </div>

        {/* Comparative Scale with Earth */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white font-semibold text-sm">
            <Scale className="w-4 h-4 text-cyan-500" />
            <span>{t.planets.compareWithEarth}</span>
          </div>
          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-500 dark:text-slate-400">{t.planets.metrics.diameter}</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {(planet.diameterKm / 12742).toFixed(2)}x Earth
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-cyan-500 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(100, (planet.diameterKm / 139820) * 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-500 dark:text-slate-400">{t.planets.metrics.gravity}</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {(planet.gravityMps2 / 9.807).toFixed(2)}g
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-500 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(100, (planet.gravityMps2 / 25) * 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-500 dark:text-slate-400">{t.planets.metrics.avgTemp}</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {planet.avgTempC}°C vs +15°C
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-amber-500 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(100, ((planet.avgTempC + 250) / 750) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interesting Scientific Facts */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-base">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <span>{t.planets.interestingFacts}</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(language === 'uz' ? planet.factsUz : planet.factsEn).map((fact, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800/80 text-xs text-slate-700 dark:text-slate-300 leading-relaxed"
            >
              <span className="font-mono text-cyan-500 font-bold shrink-0">{idx + 1}.</span>
              <span>{fact}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
