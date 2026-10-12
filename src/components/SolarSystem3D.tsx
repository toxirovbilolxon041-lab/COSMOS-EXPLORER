import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { PlanetData, Language } from '../types';
import { PLANETS_DATA } from '../data/spaceData';
import { translations } from '../i18n/translations';
import { Play, Pause, RotateCcw, Eye, ChevronRight, Compass } from 'lucide-react';

interface SolarSystem3DProps {
  language: Language;
  onSelectPlanetForDetail: (planetId: string) => void;
}

export const SolarSystem3D: React.FC<SolarSystem3DProps> = ({
  language,
  onSelectPlanetForDetail,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetData | null>(
    PLANETS_DATA.find((p) => p.id === 'earth') || PLANETS_DATA[2]
  );
  const [isPaused, setIsPaused] = useState(false);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [showOrbits, setShowOrbits] = useState(true);

  // References for three.js objects
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const planetsGroupRef = useRef<THREE.Group | null>(null);
  const orbitsGroupRef = useRef<THREE.Group | null>(null);
  const planetMeshesRef = useRef<Map<string, THREE.Mesh>>(new Map());
  const targetCameraPos = useRef<THREE.Vector3 | null>(null);
  const targetLookAt = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));

  const t = translations[language];

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 2000);
    camera.position.set(0, 75, 140);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.replaceChildren(renderer.domElement);
    rendererRef.current = renderer;

    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x223344, 0.9);
    scene.add(ambientLight);

    // Sun light (Point light at center)
    const sunLight = new THREE.PointLight(0xfff7d6, 3.5, 800, 0.6);
    sunLight.position.set(0, 0, 0);
    scene.add(sunLight);

    // Secondary subtle fill
    const dirLight = new THREE.DirectionalLight(0x4466aa, 0.4);
    dirLight.position.set(0, 100, 50);
    scene.add(dirLight);

    // Sun Mesh
    const sunGeo = new THREE.SphereGeometry(6.5, 32, 32);
    const sunMat = new THREE.MeshBasicMaterial({
      color: 0xffaa00,
    });
    const sunMesh = new THREE.Mesh(sunGeo, sunMat);
    scene.add(sunMesh);

    // Sun Glow sprite
    const sunGlowGeo = new THREE.SphereGeometry(7.8, 32, 32);
    const sunGlowMat = new THREE.MeshBasicMaterial({
      color: 0xffdd55,
      transparent: true,
      opacity: 0.25,
      side: THREE.BackSide,
    });
    const sunGlow = new THREE.Mesh(sunGlowGeo, sunGlowMat);
    scene.add(sunGlow);

    // Groups
    const orbitsGroup = new THREE.Group();
    scene.add(orbitsGroup);
    orbitsGroupRef.current = orbitsGroup;

    const planetsGroup = new THREE.Group();
    scene.add(planetsGroup);
    planetsGroupRef.current = planetsGroup;

    // Procedural simple textures / canvas color gradients
    const createPlanetTexture = (baseColor: string, accentColor: string) => {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 128;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const grad = ctx.createLinearGradient(0, 0, 0, 128);
        grad.addColorStop(0, baseColor);
        grad.addColorStop(0.35, accentColor);
        grad.addColorStop(0.65, baseColor);
        grad.addColorStop(1, accentColor);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 256, 128);

        // Add subtle horizontal stripes for gas bands
        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        for (let i = 0; i < 128; i += 8) {
          ctx.fillRect(0, i, 256, 3);
        }
      }
      return new THREE.CanvasTexture(canvas);
    };

    // Add Planets
    PLANETS_DATA.forEach((planet) => {
      // Orbit Line
      const orbitCurve = new THREE.EllipseCurve(
        0, 0,
        planet.orbitRadiusAU * 2.8, planet.orbitRadiusAU * 2.8,
        0, 2 * Math.PI,
        false, 0
      );
      const orbitPoints = orbitCurve.getPoints(120);
      const orbitGeo = new THREE.BufferGeometry().setFromPoints(
        orbitPoints.map((p) => new THREE.Vector3(p.x, 0, p.y))
      );
      const orbitMat = new THREE.LineBasicMaterial({
        color: new THREE.Color(planet.colorHex),
        transparent: true,
        opacity: 0.25,
      });
      const orbitLine = new THREE.LineLoop(orbitGeo, orbitMat);
      orbitsGroup.add(orbitLine);

      // Planet Sphere
      const radius = Math.max(0.6, planet.visualScale * 1.5);
      const planetGeo = new THREE.SphereGeometry(radius, 32, 32);
      const texture = createPlanetTexture(planet.colorHex, planet.accentHex);
      const planetMat = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.7,
        metalness: 0.1,
      });
      const planetMesh = new THREE.Mesh(planetGeo, planetMat);
      planetMesh.name = planet.id;
      planetMesh.userData = { planet };

      // Rings (Saturn and Uranus)
      if (planet.hasRings) {
        const inner = radius * 1.4;
        const outer = radius * 2.5;
        const ringGeo = new THREE.RingGeometry(inner, outer, 64);
        const ringMat = new THREE.MeshBasicMaterial({
          color: new THREE.Color(planet.accentHex),
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.65,
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.rotation.x = Math.PI / 2 + 0.2;
        planetMesh.add(ringMesh);
      }

      planetsGroup.add(planetMesh);
      planetMeshesRef.current.set(planet.id, planetMesh);
    });

    // Orbit Drag Controls
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let spherical = {
      radius: 170,
      theta: 0.8,
      phi: 0.7,
    };

    const updateCameraFromSpherical = () => {
      const x = spherical.radius * Math.sin(spherical.phi) * Math.sin(spherical.theta);
      const y = spherical.radius * Math.cos(spherical.phi);
      const z = spherical.radius * Math.sin(spherical.phi) * Math.cos(spherical.theta);
      camera.position.set(x, Math.max(10, y), z);
      camera.lookAt(targetLookAt.current);
    };
    updateCameraFromSpherical();

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      spherical.theta -= deltaX * 0.006;
      spherical.phi = Math.max(0.15, Math.min(Math.PI / 2 - 0.05, spherical.phi - deltaY * 0.006));
      updateCameraFromSpherical();
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      spherical.radius = Math.max(35, Math.min(400, spherical.radius + e.deltaY * 0.15));
      updateCameraFromSpherical();
    };

    // Touch Support
    let touchStartX = 0;
    let touchStartY = 0;
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDragging = true;
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - touchStartX;
      const deltaY = e.touches[0].clientY - touchStartY;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;

      spherical.theta -= deltaX * 0.008;
      spherical.phi = Math.max(0.15, Math.min(Math.PI / 2 - 0.05, spherical.phi - deltaY * 0.008));
      updateCameraFromSpherical();
    };
    const onTouchEnd = () => {
      isDragging = false;
    };

    // Raycaster for planet clicks
    const raycaster = new THREE.Raycaster();
    const mouseCoord = new THREE.Vector2();

    const onCanvasClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouseCoord.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseCoord.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouseCoord, camera);
      const meshes: THREE.Mesh[] = Array.from(planetMeshesRef.current.values());
      const intersects = raycaster.intersectObjects(meshes);

      if (intersects.length > 0) {
        const hit = intersects[0].object as THREE.Mesh;
        const pData = hit.userData.planet as PlanetData;
        if (pData) {
          setSelectedPlanet(pData);
        }
      }
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    domElement.addEventListener('wheel', onWheel, { passive: false });
    domElement.addEventListener('click', onCanvasClick);
    domElement.addEventListener('touchstart', onTouchStart);
    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('touchend', onTouchEnd);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      // Rotate Sun
      sunMesh.rotation.y += 0.003;
      sunGlow.rotation.y -= 0.002;

      // Orbit Planets
      if (!isPaused) {
        const time = clock.getElapsedTime() * 0.25 * speedMultiplier;

        PLANETS_DATA.forEach((planet, index) => {
          const mesh = planetMeshesRef.current.get(planet.id);
          if (mesh) {
            const orbitDist = planet.orbitRadiusAU * 2.8;
            const angle = time * planet.orbitSpeed * 0.3 + index * 0.8;
            mesh.position.x = Math.cos(angle) * orbitDist;
            mesh.position.z = Math.sin(angle) * orbitDist;
            mesh.rotation.y += 0.015;
          }
        });
      }

      // Smooth camera transition if target exists
      if (targetCameraPos.current) {
        camera.position.lerp(targetCameraPos.current, 0.05);
        if (camera.position.distanceTo(targetCameraPos.current) < 0.5) {
          targetCameraPos.current = null;
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      domElement.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      domElement.removeEventListener('wheel', onWheel);
      domElement.removeEventListener('click', onCanvasClick);
      domElement.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
    };
  }, [isPaused, speedMultiplier]);

  // Update orbit visibility
  useEffect(() => {
    if (orbitsGroupRef.current) {
      orbitsGroupRef.current.visible = showOrbits;
    }
  }, [showOrbits]);

  // Focus Camera on Selected Planet
  const handleFocusSelected = () => {
    if (!selectedPlanet || !cameraRef.current) return;
    const mesh = planetMeshesRef.current.get(selectedPlanet.id);
    if (mesh) {
      targetLookAt.current.copy(mesh.position);
      targetCameraPos.current = new THREE.Vector3(
        mesh.position.x + 8,
        mesh.position.y + 6,
        mesh.position.z + 12
      );
    }
  };

  const handleResetCamera = () => {
    targetLookAt.current.set(0, 0, 0);
    targetCameraPos.current = new THREE.Vector3(0, 80, 150);
  };

  return (
    <div className="relative w-full h-[620px] md:h-[720px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950/80 shadow-2xl">
      {/* 3D Canvas Container */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Floating Controls Bar */}
      <div className="absolute top-4 left-4 right-4 flex flex-wrap items-center justify-between gap-3 pointer-events-none z-10">
        <div className="flex items-center gap-2 pointer-events-auto bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/60 text-xs text-slate-200">
          <Compass className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="font-mono">{t.solarSystem.controlsHint}</span>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto bg-slate-900/85 backdrop-blur-md p-1 rounded-lg border border-slate-700/60">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-slate-200 hover:text-white hover:bg-slate-800 rounded transition-colors whitespace-nowrap"
            title={isPaused ? t.solarSystem.resume : t.solarSystem.pause}
          >
            {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5 text-amber-400" />}
            <span>{isPaused ? t.solarSystem.resume : t.solarSystem.pause}</span>
          </button>

          <div className="h-4 w-px bg-slate-700" />

          {/* Speed Multipliers */}
          <div className="flex items-center gap-1">
            {[0.5, 1, 2, 5].map((spd) => (
              <button
                key={spd}
                onClick={() => setSpeedMultiplier(spd)}
                className={`px-2 py-0.5 text-xs font-mono rounded transition-colors ${
                  speedMultiplier === spd
                    ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-slate-700" />

          <button
            onClick={() => setShowOrbits(!showOrbits)}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
              showOrbits ? 'text-cyan-400 bg-cyan-950/40' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {showOrbits ? t.solarSystem.hideOrbits : t.solarSystem.showOrbits}
          </button>

          <button
            onClick={handleResetCamera}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
            title={t.solarSystem.resetView}
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Selected Planet Telemetry HUD (Bottom-Right or Floating) */}
      {selectedPlanet && (
        <div className="absolute top-16 right-4 w-72 sm:w-80 bg-slate-900/90 backdrop-blur-xl border border-cyan-500/30 rounded-xl p-4 shadow-2xl z-10 text-slate-100">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
            <div>
              <div className="text-xs uppercase font-mono tracking-wider text-cyan-400">
                {language === 'uz' ? selectedPlanet.typeUz : selectedPlanet.typeEn}
              </div>
              <h3 className="text-xl font-bold text-white tracking-wide">
                {language === 'uz' ? selectedPlanet.nameUz : selectedPlanet.nameEn}
              </h3>
            </div>
            <button
              onClick={handleFocusSelected}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded border border-slate-700 transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{t.solarSystem.focusOn}</span>
            </button>
          </div>

          <p className="text-xs text-slate-300 mb-3 leading-relaxed">
            {language === 'uz' ? selectedPlanet.taglineUz : selectedPlanet.taglineEn}
          </p>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs mb-4">
            <div className="p-2 rounded bg-slate-950/60 border border-slate-800/80">
              <span className="text-slate-400 block text-[10px] uppercase font-mono">
                {t.planets.metrics.distanceFromSun}
              </span>
              <span className="font-mono font-bold text-white tabular-nums">
                {selectedPlanet.distanceFromSunKm}
              </span>
            </div>
            <div className="p-2 rounded bg-slate-950/60 border border-slate-800/80">
              <span className="text-slate-400 block text-[10px] uppercase font-mono">
                {t.planets.metrics.diameter}
              </span>
              <span className="font-mono font-bold text-white tabular-nums">
                {selectedPlanet.diameterKm.toLocaleString()} km
              </span>
            </div>
            <div className="p-2 rounded bg-slate-950/60 border border-slate-800/80">
              <span className="text-slate-400 block text-[10px] uppercase font-mono">
                {t.planets.metrics.avgTemp}
              </span>
              <span className="font-mono font-bold text-amber-300 tabular-nums">
                {selectedPlanet.avgTempC > 0 ? `+${selectedPlanet.avgTempC}` : selectedPlanet.avgTempC}°C
              </span>
            </div>
            <div className="p-2 rounded bg-slate-950/60 border border-slate-800/80">
              <span className="text-slate-400 block text-[10px] uppercase font-mono">
                {t.planets.metrics.moons}
              </span>
              <span className="font-mono font-bold text-white tabular-nums">
                {selectedPlanet.moonsCount}
              </span>
            </div>
          </div>

          {/* Link to Full Planet View */}
          <button
            onClick={() => onSelectPlanetForDetail(selectedPlanet.id)}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg shadow-lg shadow-cyan-600/30 transition-all cursor-pointer"
          >
            <span>{t.solarSystem.viewPlanetDetails}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Bottom Horizontal Planet Selector Ribbon */}
      <div className="absolute bottom-4 left-4 right-4 z-10 overflow-x-auto pb-1 scrollbar-none">
        <div className="flex items-center gap-2 min-w-max bg-slate-900/85 backdrop-blur-md p-1.5 rounded-xl border border-slate-800">
          {PLANETS_DATA.map((planet) => {
            const isSelected = selectedPlanet?.id === planet.id;
            return (
              <button
                key={planet.id}
                onClick={() => setSelectedPlanet(planet)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: planet.colorHex }}
                />
                <span>{language === 'uz' ? planet.nameUz : planet.nameEn}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
