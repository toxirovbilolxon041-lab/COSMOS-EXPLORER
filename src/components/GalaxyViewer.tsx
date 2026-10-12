import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Language, GalaxyItem } from '../types';
import { GALAXY_DATA, ASSET_IMAGES } from '../data/spaceData';
import { translations } from '../i18n/translations';
import { Compass, Sparkles, Orbit } from 'lucide-react';

interface GalaxyViewerProps {
  language: Language;
}

export const GalaxyViewer: React.FC<GalaxyViewerProps> = ({ language }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [selectedGalaxy, setSelectedGalaxy] = useState<GalaxyItem>(GALAXY_DATA[0]);
  const t = translations[language];

  // 3D Scene setup
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 18, 28);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.replaceChildren(renderer.domElement);

    // Generate Spiral Galaxy Particles
    const particleCount = 20000;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const arms = selectedGalaxy.id === 'sombrero' ? 1 : 2;
    const galaxyRadius = 16;
    const coreRadius = 3.5;

    const insideColor = new THREE.Color('#ffedd5'); // Warm golden core
    const outsideColor = new THREE.Color(
      selectedGalaxy.id === 'andromeda'
        ? '#38bdf8'
        : selectedGalaxy.id === 'sombrero'
        ? '#f59e0b'
        : '#ec4899'
    ); // Cool stellar arms

    for (let i = 0; i < particleCount; i++) {
      // Position
      const i3 = i * 3;
      const radius = Math.random() * galaxyRadius;
      const spinAngle = radius * 0.9;
      const branchAngle = ((i % arms) * 2 * Math.PI) / arms;

      const randomX =
        Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 0.3 * (galaxyRadius - radius);
      const randomY =
        Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 0.2 * (galaxyRadius - radius);
      const randomZ =
        Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 0.3 * (galaxyRadius - radius);

      positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
      positions[i3 + 1] = randomY;
      positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

      // Color
      const mixedColor = insideColor.clone();
      mixedColor.lerp(outsideColor, radius / galaxyRadius);
      colors[i3] = mixedColor.r;
      colors[i3 + 1] = mixedColor.g;
      colors[i3 + 2] = mixedColor.b;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.12,
      sizeAttenuation: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
    });

    const galaxyPoints = new THREE.Points(geometry, material);
    scene.add(galaxyPoints);

    // Glowing Galactic Nucleus
    const coreGeo = new THREE.SphereGeometry(1.6, 32, 32);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0xfff7ed,
      transparent: true,
      opacity: 0.9,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    scene.add(coreMesh);

    // Drag to Rotate
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

      galaxyPoints.rotation.y += dx * 0.005;
      camera.position.y = Math.max(5, Math.min(35, camera.position.y - dy * 0.05));
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
      galaxyPoints.rotation.y += 0.0015;
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
  }, [selectedGalaxy]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="text-xs uppercase font-mono tracking-widest text-cyan-500 dark:text-cyan-400 mb-1">
          {language === 'uz' ? 'Ulkan yulduzlar oroli' : 'Island Universes'}
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {t.galaxies.title}
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
          {t.galaxies.subtitle}
        </p>
      </div>

      {/* Galaxy Tabs Switcher */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {GALAXY_DATA.map((galaxy) => {
          const isSelected = selectedGalaxy.id === galaxy.id;
          return (
            <button
              key={galaxy.id}
              onClick={() => setSelectedGalaxy(galaxy)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isSelected
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                  : 'bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
              }`}
            >
              <Orbit className="w-3.5 h-3.5" />
              <span>{language === 'uz' ? galaxy.nameUz : galaxy.nameEn}</span>
            </button>
          );
        })}
      </div>

      {/* 3D Particle Galaxy Canvas + Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* 3D Canvas */}
        <div className="lg:col-span-7 relative h-[450px] md:h-[500px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950/95 shadow-2xl">
          <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

          {/* Telemetry HUD */}
          <div className="absolute top-4 left-4 flex flex-col gap-1.5 pointer-events-none">
            <div className="px-3 py-1 bg-slate-900/85 backdrop-blur-md rounded border border-slate-800 text-[11px] font-mono text-cyan-300">
              {language === 'uz' ? selectedGalaxy.typeUz : selectedGalaxy.typeEn}
            </div>
            <div className="px-3 py-1 bg-slate-900/85 backdrop-blur-md rounded border border-slate-800 text-[11px] font-mono text-slate-300">
              20,000+ Realtime Particle Stars
            </div>
          </div>

          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-slate-400 pointer-events-none">
            <span className="bg-slate-900/80 px-2.5 py-1 rounded border border-slate-800 text-[11px] font-mono">
              Drag to tilt · Spiral density simulation
            </span>
            <span className="text-[11px] font-mono text-cyan-400">
              {selectedGalaxy.starsCountEstimate}
            </span>
          </div>
        </div>

        {/* Selected Galaxy Profile */}
        <div className="lg:col-span-5 space-y-5">
          <div>
            <div className="text-xs uppercase font-mono tracking-wider text-cyan-500 mb-1">
              {language === 'uz' ? selectedGalaxy.typeUz : selectedGalaxy.typeEn}
            </div>
            <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">
              {language === 'uz' ? selectedGalaxy.nameUz : selectedGalaxy.nameEn}
            </h3>
          </div>

          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            {language === 'uz' ? selectedGalaxy.descriptionUz : selectedGalaxy.descriptionEn}
          </p>

          {/* Metric cards */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-mono text-slate-500 uppercase block">
                {t.galaxies.diameter}
              </span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                {selectedGalaxy.diameterLightYears}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-mono text-slate-500 uppercase block">
                {t.galaxies.distance}
              </span>
              <span className="font-mono font-bold text-cyan-500">
                {selectedGalaxy.distanceLightYears}
              </span>
            </div>
          </div>

          {/* Facts list */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2 shadow-sm">
            <div className="flex items-center gap-1.5 text-slate-900 dark:text-white font-bold text-xs mb-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>{language === 'uz' ? 'Ahamiyatli faktlar' : 'Astrophysical Facts'}</span>
            </div>
            {(language === 'uz' ? selectedGalaxy.factsUz : selectedGalaxy.factsEn).map((fact, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                <span className="font-mono text-cyan-500 font-bold shrink-0">{i + 1}.</span>
                <span>{fact}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
