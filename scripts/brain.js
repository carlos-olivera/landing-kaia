/* ============================================================
   Three.js — 3D AI Brain + 3D "Ai" text
   - Wireframe icosahedron (the polygonal brain)
   - 3D extruded "Ai" text rendered as a solid mesh + visible
     polygonal edges, subtly rotating on its own axis
   - Slow Y rotation + gentle X bob + damped mouse tilt for the
     whole scene
   ============================================================ */

import * as THREE from "three";

const canvas = document.getElementById("brain-canvas");
if (canvas) {
  const prefersReducedMotion =
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- Renderer / scene / camera ---------------- */
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  camera.position.set(0, 0, 4.6);

  /* ---------------- Soft round dot sprite ----------------
     White core, cyan halo — matches the KAIA accent. */
  const makeDotTexture = () => {
    const size = 64;
    const c = document.createElement("canvas");
    c.width = c.height = size;
    const ctx = c.getContext("2d");
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0,    "rgba(255,255,255,1)");
    g.addColorStop(0.4,  "rgba(168,245,224,0.75)");
    g.addColorStop(0.75, "rgba(0,230,184,0.25)");
    g.addColorStop(1,    "rgba(0,255,198,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  };

  /* ---------------- Brain ---------------- */
  const brain = new THREE.Group();
  scene.add(brain);

  const icoGeo = new THREE.IcosahedronGeometry(1.4, 2);

  const edgesMat = new THREE.LineBasicMaterial({
    color: 0xa8f5e0,        // cyan-tinted white (KAIA primary)
    transparent: true,
    opacity: 0.7,
    depthWrite: false,
  });
  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(icoGeo), edgesMat);
  brain.add(edges);

  const pointsGeo = new THREE.BufferGeometry();
  pointsGeo.setAttribute("position", icoGeo.attributes.position);
  const pointsMat = new THREE.PointsMaterial({
    size: 0.07,
    map: makeDotTexture(),
    transparent: true,
    alphaTest: 0.001,
    depthWrite: false,
    sizeAttenuation: true,
    color: 0xffffff,
  });
  const points = new THREE.Points(pointsGeo, pointsMat);
  brain.add(points);

  const ghostGeo = new THREE.IcosahedronGeometry(1.62, 1);
  const ghostMat = new THREE.LineBasicMaterial({
    color: 0x7A5CFF,        // soft purple ghost layer
    transparent: true,
    opacity: 0.18,
    depthWrite: false,
  });
  const ghost = new THREE.LineSegments(new THREE.EdgesGeometry(ghostGeo), ghostMat);
  brain.add(ghost);

  /* The "Ai" label is an HTML element styled with `perspective` on
     its parent — we drive its rotateY/rotateX every frame so it can
     respond to the mouse and have its own idle wobble independent
     from the WebGL brain. */
  const labelEl = document.querySelector(".brain__label-3d");

  /* ---------------- Sizing ---------------- */
  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    const w = Math.max(1, Math.floor(rect.width));
    const h = Math.max(1, Math.floor(rect.height));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  resize();

  let rId;
  window.addEventListener("resize", () => {
    clearTimeout(rId);
    rId = setTimeout(resize, 120);
  });

  /* ---------------- Damped mouse tilt ---------------- */
  let targetX = 0, targetY = 0, currentX = 0, currentY = 0;

  if (!prefersReducedMotion) {
    window.addEventListener("mousemove", (e) => {
      targetX = (e.clientX / window.innerWidth  - 0.5) * 2;
      targetY = (e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });
  }

  /* ---------------- Animation loop ---------------- */
  const clock = new THREE.Clock();

  const tick = () => {
    const t  = clock.getElapsedTime();
    const dt = clock.getDelta();

    currentX += (targetX - currentX) * 0.04;
    currentY += (targetY - currentY) * 0.04;

    // Brain
    brain.rotation.y += dt * 0.18;
    brain.rotation.x = Math.sin(t * 0.4) * 0.08 + currentY * 0.25;
    brain.rotation.z = currentX * 0.10;

    ghost.rotation.y = -brain.rotation.y * 0.6;
    ghost.rotation.x = -brain.rotation.x * 0.6;

    pointsMat.opacity = 0.85 + Math.sin(t * 1.5) * 0.1;

    /* "Ai" label — independent 3D motion.
       Compared to the brain:
         - Faster frequency  (0.85 / 1.3  vs the brain's slow spin + 0.4 bob)
         - Smaller amplitude (±10° vs the brain rotating fully)
         - Mouse Y parallax is INVERTED so when the brain leans one
           way the text leans the other — this is what gives the
           "two-layer" depth on hover.
    */
    if (labelEl && !prefersReducedMotion) {
      const wobbleY = Math.sin(t * 0.85) * 10;     // ±10°
      const wobbleX = Math.sin(t * 1.30) * 3.5;    // ±3.5°
      const mouseY  = -currentX * 18;              // inverted relative to brain
      const mouseX  =  currentY * 8;               // gentler than brain
      const ry = wobbleY + mouseY;
      const rx = wobbleX + mouseX;
      labelEl.style.transform = `rotateY(${ry.toFixed(2)}deg) rotateX(${rx.toFixed(2)}deg)`;
    }

    renderer.render(scene, camera);
    if (!prefersReducedMotion) requestAnimationFrame(tick);
  };

  if (prefersReducedMotion) {
    renderer.render(scene, camera);
  } else {
    requestAnimationFrame(tick);
  }
}
