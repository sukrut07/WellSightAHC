'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export const Hero3DCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasWebGL, setHasWebGL] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check for prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Test WebGL support
    try {
      const testCanvas = document.createElement('canvas');
      const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
      if (!gl) {
        setHasWebGL(false);
        setIsLoading(false);
        return;
      }
    } catch {
      setHasWebGL(false);
      setIsLoading(false);
      return;
    }

    // Three.js Scene Setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x070d19, 0.08);

    const width = container.clientWidth || 500;
    const height = container.clientHeight || 500;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 2.5, 6.5);
    camera.lookAt(0, 0.5, 0);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.2;
      container.appendChild(renderer.domElement);
    } catch {
      setHasWebGL(false);
      setIsLoading(false);
      return;
    }

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x0f2942, 1.8);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x00d4a1, 2.4);
    dirLight.position.set(4, 8, 5);
    scene.add(dirLight);

    const blueLight = new THREE.DirectionalLight(0x38bdf8, 1.5);
    blueLight.position.set(-5, -2, -3);
    scene.add(blueLight);

    // Group for the entire stylized industrial asset
    const assetGroup = new THREE.Group();
    scene.add(assetGroup);

    // 1. Wellhead Foundation Platform
    const baseGeo = new THREE.CylinderGeometry(2.4, 2.7, 0.25, 32);
    const darkMat = new THREE.MeshStandardMaterial({
      color: 0x0c1524,
      roughness: 0.8,
      metalness: 0.4,
    });
    const baseMesh = new THREE.Mesh(baseGeo, darkMat);
    baseMesh.position.y = -1.2;
    assetGroup.add(baseMesh);

    // Ring perimeter
    const perimeterGeo = new THREE.TorusGeometry(2.55, 0.03, 16, 64);
    const emeraldMat = new THREE.MeshStandardMaterial({
      color: 0x00d4a1,
      emissive: 0x00d4a1,
      emissiveIntensity: 0.6,
      roughness: 0.2,
      metalness: 0.9,
    });
    const perimeterMesh = new THREE.Mesh(perimeterGeo, emeraldMat);
    perimeterMesh.rotation.x = Math.PI / 2;
    perimeterMesh.position.y = -1.06;
    assetGroup.add(perimeterMesh);

    // 2. Central Wellhead Tree & Casing Spool
    const casingGeo = new THREE.CylinderGeometry(0.35, 0.42, 1.6, 24);
    const steelMat = new THREE.MeshStandardMaterial({
      color: 0x1e2d42,
      roughness: 0.4,
      metalness: 0.8,
    });
    const casing = new THREE.Mesh(casingGeo, steelMat);
    casing.position.y = -0.3;
    assetGroup.add(casing);

    // Flange rings on casing
    for (let i = 0; i < 3; i++) {
      const flangeGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.08, 24);
      const flange = new THREE.Mesh(flangeGeo, steelMat);
      flange.position.y = -0.8 + i * 0.5;
      assetGroup.add(flange);
    }

    // Master Valve block
    const valveGeo = new THREE.BoxGeometry(0.9, 0.5, 0.5);
    const valveMesh = new THREE.Mesh(valveGeo, steelMat);
    valveMesh.position.y = 0.6;
    assetGroup.add(valveMesh);

    // Pressure gauge & telemetry sensor node
    const sensorGeo = new THREE.SphereGeometry(0.18, 16, 16);
    const sensorMesh = new THREE.Mesh(sensorGeo, emeraldMat);
    sensorMesh.position.set(0.65, 0.8, 0);
    assetGroup.add(sensorMesh);

    // 3. Stylized Pumpjack Rocker Beam
    const samsonPostGeo = new THREE.ConeGeometry(0.6, 1.8, 4);
    const postMat = new THREE.MeshStandardMaterial({
      color: 0x162234,
      wireframe: true,
    });
    const samsonPost = new THREE.Mesh(samsonPostGeo, postMat);
    samsonPost.position.set(-0.8, 0.2, 0);
    samsonPost.rotation.y = Math.PI / 4;
    assetGroup.add(samsonPost);

    // Walking Beam Pivot
    const beamPivot = new THREE.Group();
    beamPivot.position.set(-0.8, 1.1, 0);
    assetGroup.add(beamPivot);

    const beamGeo = new THREE.BoxGeometry(2.8, 0.18, 0.22);
    const beamMesh = new THREE.Mesh(beamGeo, steelMat);
    beamMesh.position.set(0.4, 0, 0);
    beamPivot.add(beamMesh);

    // Horsehead curve at well end
    const horseHeadGeo = new THREE.BoxGeometry(0.3, 0.7, 0.2);
    const horseHead = new THREE.Mesh(horseHeadGeo, emeraldMat);
    horseHead.position.set(1.8, -0.2, 0);
    beamPivot.add(horseHead);

    // Polished Rod into wellhead
    const rodGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.4, 12);
    const rodMesh = new THREE.Mesh(rodGeo, steelMat);
    rodMesh.position.set(0, 0.7, 0);
    assetGroup.add(rodMesh);

    // 4. Orbital Telemetry Rings (Asset Intelligence Data Layers)
    const ringGroup = new THREE.Group();
    assetGroup.add(ringGroup);

    const orbitGeo1 = new THREE.TorusGeometry(1.8, 0.015, 12, 64);
    const skyMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.5,
      roughness: 0.2,
      metalness: 0.9,
    });
    const orbit1 = new THREE.Mesh(orbitGeo1, skyMat);
    orbit1.rotation.x = Math.PI / 3;
    orbit1.rotation.y = Math.PI / 6;
    ringGroup.add(orbit1);

    const orbitGeo2 = new THREE.TorusGeometry(2.1, 0.012, 12, 64);
    const orbit2 = new THREE.Mesh(orbitGeo2, emeraldMat);
    orbit2.rotation.x = -Math.PI / 4;
    orbit2.rotation.z = Math.PI / 5;
    ringGroup.add(orbit2);

    // Orbital Nodes (SCADA / RAG / Ingestion indicators)
    const nodeCount = 5;
    const nodeSpheres: THREE.Mesh[] = [];
    for (let i = 0; i < nodeCount; i++) {
      const nodeGeo = new THREE.SphereGeometry(0.06, 12, 12);
      const node = new THREE.Mesh(nodeGeo, i % 2 === 0 ? emeraldMat : skyMat);
      ringGroup.add(node);
      nodeSpheres.push(node);
    }

    // 5. Floor grid coordinate field
    const gridHelper = new THREE.GridHelper(7, 14, 0x00d4a1, 0x162438);
    gridHelper.position.y = -1.22;
    (gridHelper.material as any).opacity = 0.25;
    (gridHelper.material as any).transparent = true;
    scene.add(gridHelper);

    setIsLoading(false);

    // Pointer-driven parallax
    let targetRotationX = 0;
    let targetRotationY = 0;
    const onMouseMove = (event: MouseEvent) => {
      if (prefersReducedMotion) return;
      const rect = container.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
      targetRotationY = x * 0.25;
      targetRotationX = -y * 0.15;
    };

    container.addEventListener('mousemove', onMouseMove);

    // Window Resize Handler
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      if (!prefersReducedMotion) {
        // Idle smooth rotation
        assetGroup.rotation.y += 0.0035;

        // Rocker beam oscillation (realistic pump cadence)
        beamPivot.rotation.z = Math.sin(elapsedTime * 1.5) * 0.12;
        rodMesh.position.y = 0.7 + Math.sin(elapsedTime * 1.5) * 0.08;

        // Orbital telemetry rotation
        ringGroup.rotation.y -= 0.006;
        ringGroup.rotation.x = Math.sin(elapsedTime * 0.4) * 0.15;

        // Move orbital nodes along paths
        nodeSpheres.forEach((node, idx) => {
          const angle = elapsedTime * 0.6 + (idx * Math.PI * 2) / nodeCount;
          const radius = idx % 2 === 0 ? 1.8 : 2.1;
          node.position.set(Math.cos(angle) * radius, Math.sin(angle) * 0.4, Math.sin(angle) * radius);
        });

        // Parallax damping
        assetGroup.rotation.y += (targetRotationY - assetGroup.rotation.y) * 0.05;
        assetGroup.rotation.x += (targetRotationX - assetGroup.rotation.x) * 0.05;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      baseGeo.dispose();
      casingGeo.dispose();
      perimeterGeo.dispose();
      darkMat.dispose();
      emeraldMat.dispose();
      steelMat.dispose();
    };
  }, []);

  if (!hasWebGL) {
    return (
      <div className="relative flex h-full w-full items-center justify-center rounded-2xl border border-slate-800 bg-[#0A1224] p-8 text-center shadow-2xl">
        <div className="absolute inset-0 bg-dot-matrix opacity-40 rounded-2xl" />
        <div className="relative z-10 space-y-4">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400">
            <svg className="h-12 w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <div className="text-sm font-semibold text-white">Industrial Asset Intelligence</div>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Surface Wellhead & Artificial Lift Model. Real-time telemetry connection active.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-full w-full items-center justify-center">
      {/* Background radial highlight */}
      <div className="absolute h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

      {/* 3D Canvas mount point */}
      <div
        ref={containerRef}
        className="relative h-[380px] sm:h-[460px] md:h-[500px] w-full cursor-grab active:cursor-grabbing transition-opacity duration-700"
        style={{ opacity: isLoading ? 0 : 1 }}
      />

      {/* Subtle Asset Tag Overlay */}
      <div className="absolute bottom-3 left-4 sm:left-8 z-10 flex items-center gap-2 rounded-full border border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 text-[11px] font-mono text-slate-300">
        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>WELLHEAD SENSOR TWIN · TELEMETRY ACTIVE</span>
      </div>
    </div>
  );
};
