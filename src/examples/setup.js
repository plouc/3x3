import '../vendor/dat.gui.css'
import './styles/main.css'
import '../vendor/OrbitControl'
import * as THREE from 'three'
import dat        from '../vendor/dat.gui'
import Stats      from 'stats.js'
import TWEEN      from 'tween.js'

export const initRenderer = ({
    width      = 800,
    height     = 800,
    clearColor = '#000000',
} = {}) => {
    const renderer = new THREE.WebGLRenderer()

    renderer.setSize(width, height)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type    = THREE.PCFSoftShadowMap
    renderer.antialias         = false
    renderer.setPixelRatio(1)
    renderer.setClearColor(clearColor, 1)

    document.getElementById('app')
        .appendChild(renderer.domElement)

    return renderer
}

export const initCamera = (scene, {
    renderer,
    fov    = 65,
    width  = 800,
    height = 800,
    near   = 1,
    far    = 2000,
    x      = 0,
    y      = 800,
    z      = 800,
} = {}) => {
    const camera = new THREE.PerspectiveCamera(fov,  width / height, near, far)

    camera.position.x = x
    camera.position.y = y
    camera.position.z = z

    scene.add(camera)

    const controls = new THREE.OrbitControls(camera, renderer.domElement)
    controls.enableZoom = false

    return camera
}

export const initLights = (scene, {
    shadowMapSize = 1024,
} = {}) => {
    const hemisphere = new THREE.HemisphereLight('#fff3e3', '#d4d8f4', .3)
    hemisphere.position.set(0, 800, 0)

    const directional = new THREE.DirectionalLight('#fff3e3', .8)
    directional.position.set(-200, 600, 400)
    directional.castShadow            = true
    directional.shadow.camera.left    = -1600
    directional.shadow.camera.right   =  1600
    directional.shadow.camera.top     =  1600
    directional.shadow.camera.bottom  = -1600
    directional.shadow.camera.near    = 1
    directional.shadow.camera.far     = 2000
    directional.shadow.bias           = .0001
    directional.shadow.mapSize.width  = shadowMapSize
    directional.shadow.mapSize.height = shadowMapSize

    scene.add(hemisphere)
    scene.add(directional)

    return {
        hemisphere,
        directional,
    }
}

export const initGround = (scene, {
    width  = 6000,
    height = 6000,
    color  = '#FFFFFF',
} = {}) => {
    const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(width, height, 1, 1),
        new THREE.MeshPhongMaterial({
            color,
            shininess: 10,
        })
    )
    ground.receiveShadow = true
    ground.rotation.x    = Math.PI * -.5

    scene.add(ground)

    return ground
}

export const initGui = ({
    renderer,
    lights,
    defaults,
} = {}) => {
    const gui = new dat.GUI()

    const commonFolder = gui.addFolder('Common')

    const pixelRatioCtrl = commonFolder.add(defaults, 'pixelRatio', .5, 2).step(.5)
    pixelRatioCtrl.onFinishChange(pixelRatio => {
        renderer.setPixelRatio(pixelRatio)
    })

    const shadowMapSizeCtrl = commonFolder.add(defaults, 'shadowMapSize', [512, 1024, 2048, 4096])
    shadowMapSizeCtrl.onFinishChange(size => {
        lights.directional.shadow.mapSize.width  = size
        lights.directional.shadow.mapSize.height = size
    })

    return gui
}

export const initStats = () => {
    const stats = new Stats()
    stats.showPanel(0)

    document.getElementById('app')
        .appendChild(stats.dom)

    return stats
}

export const initFog = (scene, {
    color = '#FFFFFF',
    near  = 1000,
    far   = 2000,
} = {}) => {
    const fog = new THREE.Fog(color, near, far)
    scene.fog = fog

    return fog
}

export default ({
    width                     = 800,
    height                    = 800,
    renderer: rendererOptions = {},
    camera:   cameraOptions   = {},
    lights:   lightsOptions   = {},
    fog:      fogOptions      = {},
    ground:   groundOptions   = {},
    gui:      guiOptions      = {},
}) => {
    const renderer = initRenderer({
        width,
        height,
        ...rendererOptions,
    })

    const scene = new THREE.Scene()

    let fog
    if (fogOptions !== false) fog = initFog(scene, fogOptions)

    const camera = initCamera(scene, {
        renderer,
        width,
        height,
        ...cameraOptions,
    })

    const lights = initLights(scene, lightsOptions)
    const ground = initGround(scene, groundOptions)

    const gui    = initGui({
        renderer,
        lights,
        defaults: {
            pixelRatio:    1,
            shadowMapSize: 1024,
        },
        ...guiOptions,
    })

    const stats  = initStats()

    const render = () => {
        requestAnimationFrame(render)

        camera.lookAt(scene.position)
        renderer.render(scene, camera)
        TWEEN.update()
        stats.update()
    }

    return {
        renderer,
        camera,
        scene,
        lights,
        fog,
        ground,
        gui,
        stats,
        render,
    }
}