<script setup>
import { ref, shallowRef, onMounted, onUnmounted, watchEffect, nextTick } from 'vue'
import * as THREE from 'three'

const props = defineProps({
  isDarkMode: {
    type: Boolean,
    default: true
  }
})

const canvasRef = ref(null)
const scene = shallowRef(null)
const camera = shallowRef(null)
const renderer = shallowRef(null)
const globe = shallowRef(null)

const init = () => {
  scene.value = new THREE.Scene()

  camera.value = new THREE.PerspectiveCamera(25, window.innerWidth / window.innerHeight, 0.1, 100)
  camera.value.position.set(0, 0, 4)

  renderer.value = new THREE.WebGLRenderer({ antialias: true, canvas: canvasRef.value, alpha: true })
  renderer.value.setSize(window.innerWidth, window.innerHeight)
  renderer.value.setPixelRatio(window.devicePixelRatio)

  // Directional Light (increased intensity)
  const directionalLight = new THREE.DirectionalLight('#ffffff', 1.5)
  directionalLight.position.set(5, 3, 5)
  scene.value.add(directionalLight)

  // Ambient Light for overall brightness
  const ambientLight = new THREE.AmbientLight(0x404040, 1) // Soft white light
  scene.value.add(ambientLight)

  // Point Light to add additional focus light
  const pointLight = new THREE.PointLight(0xffffff, 2, 10) // White light with high intensity
  pointLight.position.set(0, 1, 2)
  scene.value.add(pointLight)

  // Load textures and globe
  const textureLoader = new THREE.TextureLoader()
  const dayTexture = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_atmos_2048.jpg')

  const globeGeometry = new THREE.SphereGeometry(0.6, 32, 32)
  const globeMaterial = new THREE.MeshPhongMaterial({ map: dayTexture })
  globe.value = new THREE.Mesh(globeGeometry, globeMaterial)
  scene.value.add(globe.value)
}

const animate = () => {
  if (!renderer.value || !scene.value || !camera.value || !globe.value) return

  requestAnimationFrame(animate)

  globe.value.rotation.y += 0.001

  renderer.value.render(scene.value, camera.value)
  if (camera.value && renderer.value) {
    camera.value.aspect = window.innerWidth / window.innerHeight
    camera.value.updateProjectionMatrix()
    renderer.value.setSize(window.innerWidth, window.innerHeight)
  }
}

onMounted(() => {
  nextTick(() => {
    init()
    animate()
  })
})

watchEffect(() => {
  if (renderer.value) {
    renderer.value.setClearColor(props.isDarkMode ? 0x000000 : 0xf0f0f0, 0)
  }
})

onUnmounted(() => {
  if (renderer.value) renderer.value.dispose()
  if (globe.value) globe.value.geometry.dispose()
  if (globe.value && globe.value.material) globe.value.material.dispose()
})
</script>

<template>
  <canvas ref="canvasRef" class="w-full h-full"></canvas>
</template>
