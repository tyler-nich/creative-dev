import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.164/build/three.module.js";
import { gsap } from "https://cdn.jsdelivr.net/npm/gsap@3.12.5/index.js";

// --- Canvas 2D overlay ---
const overlay = document.getElementById("overlay");
const ctx = overlay.getContext("2d");
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

function resizeCanvas() {
  overlay.width = window.innerWidth;
  overlay.height = window.innerHeight;
}

function drawNoise() {
  ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.03})`;
  ctx.fillRect(Math.random() * overlay.width, Math.random() * overlay.height, 1, 1);
  requestAnimationFrame(drawNoise);
}
drawNoise();

// --- Three.js setup ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 10);
camera.position.z = 1;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- Track mouse position ---
const mouse = new THREE.Vector2(0.5, 0.5);
window.addEventListener("pointermove", (e) => {
  mouse.x = e.clientX / window.innerWidth;
  mouse.y = 1.0 - e.clientY / window.innerHeight; // flip Y for shader space
});


// --- Shader material ---
const uniforms = {
  uTime: { value: 0.0 },
  uColor: { value: new THREE.Color(0.2, 0.8, 1.0) }
};

const material = new THREE.ShaderMaterial({
  uniforms,
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform vec3 uColor;
    varying vec2 vUv;

    void main() {
      float wave = sin(vUv.x * 10.0 + uTime) * 0.5 + 0.5;
      gl_FragColor = vec4(uColor * wave, 1.0);
    }
  `
});

const geometry = new THREE.PlaneGeometry(2, 2);
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

// --- Animate with GSAP ---
gsap.to(uniforms.uTime, {
  value: 20,
  duration: 20,
  repeat: -1,
  ease: "none"
});

// --- Render loop ---
function animate() {
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();
