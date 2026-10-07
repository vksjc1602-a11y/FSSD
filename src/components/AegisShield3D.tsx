import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RiskLevel } from '../types/aegis';

interface AegisShield3DProps {
  score?: number;
  riskLevel?: RiskLevel;
  isScanning?: boolean;
  className?: string;
  size?: 'small' | 'medium' | 'large' | 'compact';
  showControls?: boolean;
}

export const AegisShield3D: React.FC<AegisShield3DProps> = ({
  score = 15,
  riskLevel = 'LOW',
  isScanning = false,
  className = '',
  size = 'medium',
  showControls = false,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [use2DFallback, setUse2DFallback] = useState(false);
  const [webglSupported, setWebglSupported] = useState(true);

  // Palette lookup strictly adhering to system rules:
  // Black: #050505, #090909, #111111
  // White: #FFFFFF, #F7F7F7
  // Gold: #D4AF37, #C9A227
  // Light Blue: #8FD3FF, #BFE9FF
  // Yellow: #FFD54A, #FFE680
  const getThemeColors = (level: RiskLevel) => {
    switch (level) {
      case 'CRITICAL':
      case 'HIGH':
        return {
          primary: 0xd4af37, // Gold
          secondary: 0xffd54a, // Yellow
          ambient: 0x111111,
          glow: '#D4AF37',
          speedMultiplier: 2.4,
          particleSpeed: 0.04,
        };
      case 'ELEVATED':
        return {
          primary: 0xffd54a, // Yellow
          secondary: 0xc9a227, // Muted gold
          ambient: 0x090909,
          glow: '#FFD54A',
          speedMultiplier: 1.8,
          particleSpeed: 0.025,
        };
      case 'MODERATE':
        return {
          primary: 0xbfe9ff, // Pale light blue
          secondary: 0xd4af37, // Subtle gold edge
          ambient: 0x090909,
          glow: '#BFE9FF',
          speedMultiplier: 1.3,
          particleSpeed: 0.018,
        };
      case 'LOW':
      default:
        return {
          primary: 0x8fd3ff, // Light blue
          secondary: 0xffffff, // White
          ambient: 0x050505,
          glow: '#8FD3FF',
          speedMultiplier: 0.8,
          particleSpeed: 0.01,
        };
    }
  };

  useEffect(() => {
    if (use2DFallback) return;
    const container = mountRef.current;
    if (!container) return;

    // Dimensions
    const width = container.clientWidth || 300;
    const height = container.clientHeight || 300;

    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;
    let renderer: THREE.WebGLRenderer;
    let animationFrameId: number;

    try {
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
      camera.position.z = 7;

      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.appendChild(renderer.domElement);
    } catch {
      setWebglSupported(false);
      setUse2DFallback(true);
      return;
    }

    const theme = getThemeColors(riskLevel);

    // Group for entire shield core
    const aegisGroup = new THREE.Group();
    scene.add(aegisGroup);

    // --- 1. SHIELD GEOMETRY CREATION ---
    const shieldShape = new THREE.Shape();
    shieldShape.moveTo(0, 1.6);
    shieldShape.lineTo(1.1, 1.2);
    shieldShape.lineTo(1.15, -0.2);
    shieldShape.quadraticCurveTo(0.9, -1.2, 0, -1.8);
    shieldShape.quadraticCurveTo(-0.9, -1.2, -1.15, -0.2);
    shieldShape.lineTo(-1.1, 1.2);
    shieldShape.closePath();

    const extrudeSettings = {
      depth: 0.22,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 2,
      bevelSize: 0.08,
      bevelThickness: 0.08,
    };

    const shieldGeo = new THREE.ExtrudeGeometry(shieldShape, extrudeSettings);
    shieldGeo.center();

    // Metallic Obsidian Shield Material
    const shieldMat = new THREE.MeshStandardMaterial({
      color: 0x111111,
      roughness: 0.25,
      metalness: 0.85,
      flatShading: false,
    });
    const shieldMesh = new THREE.Mesh(shieldGeo, shieldMat);
    aegisGroup.add(shieldMesh);

    // Gold/Light-Blue Facet Rim Wireframe
    const wireframeGeo = new THREE.WireframeGeometry(shieldGeo);
    const wireframeMat = new THREE.LineBasicMaterial({
      color: theme.primary,
      transparent: true,
      opacity: 0.65,
    });
    const wireframeMesh = new THREE.LineSegments(wireframeGeo, wireframeMat);
    wireframeMesh.scale.set(1.01, 1.01, 1.01);
    aegisGroup.add(wireframeMesh);

    // Inner Crest Core (Hexagonal Micro Emblem)
    const crestGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.12, 6);
    crestGeo.rotateX(Math.PI / 2);
    const crestMat = new THREE.MeshStandardMaterial({
      color: theme.secondary,
      roughness: 0.2,
      metalness: 0.9,
    });
    const crestMesh = new THREE.Mesh(crestGeo, crestMat);
    crestMesh.position.z = 0.18;
    aegisGroup.add(crestMesh);

    // --- 2. ORBITING SCANNING RINGS ---
    const ring1Geo = new THREE.TorusGeometry(2.1, 0.018, 16, 100);
    const ring1Mat = new THREE.MeshBasicMaterial({
      color: theme.primary,
      transparent: true,
      opacity: 0.75,
    });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    ring1.rotation.x = Math.PI / 3;
    aegisGroup.add(ring1);

    const ring2Geo = new THREE.TorusGeometry(2.4, 0.012, 16, 100);
    const ring2Mat = new THREE.MeshBasicMaterial({
      color: theme.secondary,
      transparent: true,
      opacity: 0.45,
    });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.y = Math.PI / 4;
    aegisGroup.add(ring2);

    // --- 3. NEURAL NETWORK DATA NODES & STREAM LINES ---
    const nodeCount = 14;
    const nodePositions: THREE.Vector3[] = [];
    const nodeSpheres: THREE.Mesh[] = [];

    const nodeGeo = new THREE.SphereGeometry(0.045, 8, 8);
    const nodeMat = new THREE.MeshBasicMaterial({ color: theme.primary });

    for (let i = 0; i < nodeCount; i++) {
      const radius = 2.1 + (Math.random() - 0.5) * 0.6;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI;

      const pos = new THREE.Vector3(
        radius * Math.cos(theta) * Math.cos(phi),
        radius * Math.sin(theta) * Math.cos(phi),
        radius * Math.sin(phi)
      );
      nodePositions.push(pos);

      const sphere = new THREE.Mesh(nodeGeo, nodeMat);
      sphere.position.copy(pos);
      aegisGroup.add(sphere);
      nodeSpheres.push(sphere);
    }

    // Connect some neural nodes with thin stream lines
    const lineCoords: number[] = [];
    for (let i = 0; i < nodeCount; i++) {
      for (let j = i + 1; j < nodeCount; j++) {
        if (nodePositions[i].distanceTo(nodePositions[j]) < 1.6) {
          lineCoords.push(
            nodePositions[i].x,
            nodePositions[i].y,
            nodePositions[i].z,
            nodePositions[j].x,
            nodePositions[j].y,
            nodePositions[j].z
          );
        }
      }
    }
    const linesGeo = new THREE.BufferGeometry();
    linesGeo.setAttribute('position', new THREE.Float32BufferAttribute(lineCoords, 3));
    const linesMat = new THREE.LineBasicMaterial({
      color: theme.primary,
      transparent: true,
      opacity: 0.28,
    });
    const networkLines = new THREE.LineSegments(linesGeo, linesMat);
    aegisGroup.add(networkLines);

    // --- 4. DATA STREAM PARTICLES ---
    const particleCount = 120;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePos[i] = (Math.random() - 0.5) * 6;
      particlePos[i + 1] = (Math.random() - 0.5) * 6;
      particlePos[i + 2] = (Math.random() - 0.5) * 3;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({
      color: theme.primary,
      size: 0.04,
      transparent: true,
      opacity: 0.5,
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    aegisGroup.add(particleSystem);

    // --- LIGHTING ---
    const keyLight = new THREE.DirectionalLight(theme.primary, 2.5);
    keyLight.position.set(4, 5, 6);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 1.2);
    fillLight.position.set(-4, -2, 4);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight(theme.secondary, 2.0, 10);
    rimLight.position.set(0, 0, -3);
    scene.add(rimLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    // --- INTERACTIVE MOUSE ROTATION ---
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetX = x * 0.45;
      targetY = y * 0.35;
    };

    container.addEventListener('mousemove', handleMouseMove);

    // --- ANIMATION LOOP ---
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();
      const speed = isScanning ? 3.5 : theme.speedMultiplier;

      // Mouse lerping
      mouseX += (targetX - mouseX) * 0.05;
      mouseY += (targetY - mouseY) * 0.05;

      // Shield floating bob & orientation
      shieldMesh.rotation.y = Math.sin(elapsedTime * 0.6) * 0.12 + mouseX;
      shieldMesh.rotation.x = Math.cos(elapsedTime * 0.5) * 0.08 + mouseY;
      shieldMesh.position.y = Math.sin(elapsedTime * 1.2) * 0.08;

      wireframeMesh.rotation.copy(shieldMesh.rotation);
      wireframeMesh.position.copy(shieldMesh.position);

      crestMesh.rotation.z += 0.01 * speed;

      // Rotating scanning rings
      ring1.rotation.z += 0.012 * speed;
      ring1.rotation.y += 0.008 * speed;

      ring2.rotation.x += 0.014 * speed;
      ring2.rotation.z -= 0.01 * speed;

      // Scanning pulse effect
      if (isScanning) {
        const pulse = (Math.sin(elapsedTime * 8) + 1) * 0.5;
        wireframeMat.opacity = 0.5 + pulse * 0.45;
        ring1Mat.opacity = 0.6 + pulse * 0.4;
      }

      // Rotate particle cloud gently
      particleSystem.rotation.y += theme.particleSpeed * 0.5;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousemove', handleMouseMove);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      shieldGeo.dispose();
      wireframeGeo.dispose();
      ring1Geo.dispose();
      ring2Geo.dispose();
      nodeGeo.dispose();
      particleGeo.dispose();
    };
  }, [riskLevel, isScanning, use2DFallback]);

  const sizeClasses = {
    compact: 'h-36 w-36',
    small: 'h-48 w-48',
    medium: 'h-72 w-72 md:h-80 md:w-80',
    large: 'h-96 w-96 md:h-[450px] md:w-[450px]',
  }[size];

  return (
    <div className={`relative flex flex-col items-center justify-center ${className}`}>
      {/* 2D Accessible Fallback / Toggle State */}
      {use2DFallback || !webglSupported ? (
        <div
          className={`${sizeClasses} flex flex-col items-center justify-center rounded-2xl border border-[#D4AF37]/30 bg-[#090909] p-6 text-center shadow-xl`}
          role="img"
          aria-label={`AEGIS 2D Shield Security Status: Score ${score}, Risk Level ${riskLevel}`}
        >
          {/* Futuristic 2D SVG Shield */}
          <div className="relative mb-3 flex items-center justify-center">
            <svg
              className="h-24 w-24 text-[#D4AF37]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="#111111" />
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="m9 12 2 2 4-4" stroke="#8FD3FF" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center font-mono text-xl font-bold tabular-nums text-white">
              {score}
            </div>
          </div>
          <span className="font-mono text-xs uppercase tracking-wider text-[#8FD3FF]">
            2D Accessibility Mode
          </span>
          <span className="mt-1 text-sm font-semibold text-white">Risk: {riskLevel}</span>
        </div>
      ) : (
        <div
          ref={mountRef}
          className={`${sizeClasses} relative cursor-grab active:cursor-grabbing`}
          aria-label={`3D AEGIS Core visualization. Current Risk Score: ${score}/100, Level: ${riskLevel}`}
        />
      )}

      {/* Floating Score Badge HUD underneath shield */}
      <div className="mt-2 flex items-center gap-3 rounded-full border border-white/10 bg-[#090909]/90 px-4 py-1.5 backdrop-blur-md">
        <span className="font-mono text-xs tracking-wider text-[#8FD3FF]">AEGIS CORE</span>
        <span className="text-white/30">/</span>
        <span className="font-mono text-sm font-semibold tabular-nums text-white">
          {isScanning ? 'SCANNING...' : `${score} / 100`}
        </span>
        <span className="text-white/30">/</span>
        <span
          className={`font-mono text-xs uppercase ${
            riskLevel === 'CRITICAL' || riskLevel === 'HIGH'
              ? 'text-[#FFD54A]'
              : riskLevel === 'ELEVATED'
              ? 'text-[#FFD54A]'
              : 'text-[#8FD3FF]'
          }`}
        >
          {riskLevel} RISK
        </span>
      </div>

      {/* 2D / 3D Experience Toggle */}
      {showControls && (
        <div className="mt-3 flex items-center gap-2 text-xs">
          <button
            onClick={() => setUse2DFallback(!use2DFallback)}
            className="rounded border border-white/10 bg-[#111111] px-3 py-1 font-mono text-xs text-white/70 hover:border-[#D4AF37] hover:text-white transition-colors"
          >
            3D EXPERIENCE: {use2DFallback ? 'OFF (2D MODE)' : 'ON'}
          </button>
        </div>
      )}
    </div>
  );
};
