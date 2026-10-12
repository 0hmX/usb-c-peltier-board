import { ACESFilmicToneMapping, Box3, Color, DirectionalLight, HemisphereLight, PerspectiveCamera, Scene, SRGBColorSpace, Vector3, WebGLRenderer } from "three"
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js"
import { OrbitControls } from "three/addons/controls/OrbitControls.js"

const viewport = document.querySelector<HTMLElement>("#viewport")!
const status = document.querySelector<HTMLElement>("#status")!

async function startViewer() {
  const renderer = new WebGLRenderer({ antialias: true, alpha: false })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.outputColorSpace = SRGBColorSpace
  renderer.toneMapping = ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.3
  viewport.append(renderer.domElement)
  const scene = new Scene()
  scene.background = new Color("#101a29")
  scene.add(new HemisphereLight(0xffffff, 0x63736d, 2))
  const keyLight = new DirectionalLight(0xffffff, 3)
  keyLight.position.set(-80, 130, -80)
  scene.add(keyLight)
  const fillLight = new DirectionalLight(0xd5e8ff, 1.5)
  fillLight.position.set(100, 60, 100)
  scene.add(fillLight)
  const camera = new PerspectiveCamera(38, 1, 0.1, 3000)
  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.minDistance = 15
  controls.maxDistance = 700
  controls.maxPolarAngle = Math.PI - 0.001
  const modelData = document.querySelector<HTMLElement>("#model-data")!
  const loader = new GLTFLoader()
  const loaded = modelData.dataset.url
    ? await loader.loadAsync(modelData.dataset.url)
    : await loader.parseAsync(Uint8Array.from(atob(modelData.textContent!.trim()), character => character.charCodeAt(0)).buffer, "")
  scene.add(loaded.scene)
  const bounds = new Box3().setFromObject(loaded.scene)
  if (bounds.isEmpty()) throw new Error("The assembly contains no geometry")
  const center = bounds.getCenter(new Vector3())
  const radius = bounds.getSize(new Vector3()).length() / 2
  controls.target.copy(center)
  const directions: Record<string, Vector3> = {
    isometric: new Vector3(-0.7, 1.2, -0.8),
    top: new Vector3(0, 1, -0.001),
    bottom: new Vector3(0, -1, 0.001),
  }
  function fitView(view: string) {
    const direction = directions[view] ?? directions.isometric!
    const distance = radius / Math.sin(camera.fov * Math.PI / 360) * 1.08 * Math.max(1, 1 / camera.aspect)
    camera.position.copy(center).addScaledVector(direction.clone().normalize(), distance)
    controls.target.copy(center)
    controls.update()
  }
  new ResizeObserver(() => {
    renderer.setSize(viewport.clientWidth, viewport.clientHeight)
    camera.aspect = viewport.clientWidth / viewport.clientHeight
    camera.updateProjectionMatrix()
  }).observe(viewport)
  renderer.setSize(viewport.clientWidth, viewport.clientHeight)
  camera.aspect = viewport.clientWidth / viewport.clientHeight
  camera.updateProjectionMatrix()
  fitView("isometric")
  for (const button of document.querySelectorAll<HTMLButtonElement>("[data-view]")) {
    button.addEventListener("click", () => fitView(button.dataset.view!))
  }
  document.querySelector<HTMLButtonElement>("#rotate")!.addEventListener("click", event => {
    controls.autoRotate = !controls.autoRotate
    controls.autoRotateSpeed = 0.8
    const button = event.currentTarget as HTMLButtonElement
    button.textContent = controls.autoRotate ? "Stop rotation" : "Auto rotate"
  })
  document.querySelector<HTMLElement>("#poster")!.hidden = true
  status.textContent = "Drag to rotate · scroll to zoom · right-drag to pan"
  viewport.dataset.ready = "true"
  renderer.setAnimationLoop(() => {
    controls.update()
    renderer.render(scene, camera)
  })
}

startViewer().catch(error => {
  viewport.querySelector("canvas")?.remove()
  for (const button of document.querySelectorAll<HTMLButtonElement>("[data-view], #rotate")) button.disabled = true
  status.textContent = "Interactive 3D is unavailable: " + String(error.message ?? error) + ". The rendered preview and GLB download remain available."
  viewport.dataset.ready = "error"
})
