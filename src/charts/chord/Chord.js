import _                   from 'lodash'
import * as d3             from 'd3'
import * as THREE          from 'three'
import TWEEN               from 'tween.js'
import * as chroma         from 'd3-scale-chromatic'
import Selection           from '../../lib/Selection'
import { getLabelTexture } from '../../lib/texture'

export const DEFAULTS = {
    innerRadius:    520,
    outerRadius:    540,
    anglePadding:   .05,
    minDepth:       100,
    maxDepth:       200,
    linkThickness:  6,
    linkOffset:     10,
    arcResolution:  32,
    linkResolution: 16,
    wireframe:      false,
}

const HALF_PI = Math.PI * .5

const bindArcToBoxGeometry = ({
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    depth,
    box,
    resolution = 32,
}) => {
    const angleStep = (endAngle - startAngle) / resolution

    _.range(resolution + 1).forEach(index => {
        const a  = Math.PI * .5 - (startAngle + index * angleStep)
        const x0 = Math.cos(a) * innerRadius
        const z0 = Math.sin(a) * innerRadius
        const x1 = Math.cos(a) * outerRadius
        const z1 = Math.sin(a) * outerRadius

        // top-right
        const v0 = box.vertices[index]
        v0.x = x1
        v0.y = depth
        v0.z = z1

        // bottom-right
        const v1 = box.vertices[resolution + 1 + index]
        v1.x = x1
        v1.y = 0
        v1.z = z1

        // top-left
        const v2 = box.vertices[(resolution + 1) * 2 + resolution - index]
        v2.x = x0
        v2.y = depth
        v2.z = z0

        // bottom-left
        const v3 = box.vertices[(resolution + 1) * 3 + resolution - index]
        v3.x = x0
        v3.y = 0
        v3.z = z0
    })

    box.verticesNeedUpdate = true
}

const ribbonGeometry = ({
    radius: r,
    depth,
    sourceStartAngle,
    sourceEndAngle,
    targetStartAngle,
    targetEndAngle,
    resolution = 16,
}) => {
    const ssa   = sourceStartAngle - HALF_PI
    const sea   = sourceEndAngle   - HALF_PI

    const tsa   = targetStartAngle - HALF_PI
    const tea   = targetEndAngle   - HALF_PI

    const sx0   = r * Math.cos(ssa)
    const sy0   = r * Math.sin(ssa)

    const tx0   = r * Math.cos(tsa)
    const ty0   = r * Math.sin(tsa)

    const shape = new THREE.Shape()

    const same  = ssa === tsa && sea === tea

    shape.moveTo(sx0, sy0)
    shape.arc(-sx0, -sy0, r, ssa, sea)
    if (!same) {
        shape.quadraticCurveTo(0, 0, tx0, ty0)
        shape.arc(-tx0, -ty0, r, tsa, tea)
    }
    shape.quadraticCurveTo(0, 0, sx0, sy0)

    /*
    let points
    if (same) {
        console.log('on self')
        points = shape.extractPoints(resolution * 2)
    } else {
        console.log('on other')
        points = shape.extractPoints(resolution)
    }
    console.log(points.shape.length)

    const finalShape = new THREE.Shape()
    points.forEach((p, i) => {
        if (i === 0) return shape.moveTo(p.x, p.y)
        shape.lineTo(p.x, p.y)
    })
    */

    const geometry = new THREE.ExtrudeGeometry(shape, {
        steps:        1,
        amount:       depth,
        bevelEnabled: false,
    })

    return geometry
}

export default class Chord extends THREE.Object3D {
    constructor({
        innerRadius   = DEFAULTS.innerRadius,
        outerRadius   = DEFAULTS.outerRadius,
        anglePadding  = DEFAULTS.anglePadding,
        minDepth      = DEFAULTS.minDepth,
        maxDepth      = DEFAULTS.maxDepth,
        linkThickness = DEFAULTS.linkThickness,
        linkOffset    = DEFAULTS.linkOffset,
        wireframe     = DEFAULTS.wireframe,
        arcResolution = DEFAULTS.arcResolution,
    }) {
        super()

        this.innerRadius  = innerRadius
        this.outerRadius  = outerRadius

        this.chord = d3.chord()
            .padAngle(anglePadding)
            .sortSubgroups(d3.descending)

        this.color = d3.scaleOrdinal(chroma.schemePastel1)
        this.color = d3.scaleOrdinal()
            .domain(d3.range(4))
            .range(["#000000", "#FFDD89", "#957244", "#F26223"])

        this.depthScale = d3.scaleLinear()
            .range([minDepth, maxDepth])

        this.linkThickness = linkThickness
        this.linkOffset    = linkOffset

        this.wireframe = wireframe

        this.arcResolution = arcResolution

        this.data   = []
        this.groups = []
        this.links  = []

        // tweens, to be aware of involved ones
        this.radiusTween       = null
        this.depthTween        = null
        this.anglePaddingTween = null

        this.buildArcsPool()
        this.buildLinksPool()
    }

    buildArcsPool() {
        this.arcsPool = new Selection({
            identify: a => a.index,
            enter:    arc => {
                const arcMaterial = new THREE.MeshPhongMaterial({
                    color:     this.color(arc.index),
                    wireframe: this.wireframe,
                    shading:   THREE.FlatShading,
                })

                const arcBox = new THREE.BoxGeometry(1, 1, 1, 1, 1, this.arcResolution)

                const arcMesh = new THREE.Mesh(arcBox, arcMaterial)
                arcMesh.castShadow    = true
                arcMesh.receiveShadow = true

                const depth = this.depthScale(arc.value)

                bindArcToBoxGeometry({
                    innerRadius: this.innerRadius,
                    outerRadius: this.outerRadius,
                    startAngle:  arc.startAngle,
                    endAngle:    arc.endAngle,
                    depth,
                    box: arcBox,
                    resolution:  this.arcResolution,
                })

                this.add(arcMesh)

                return {
                    index:      arc.index,
                    startAngle: arc.startAngle,
                    endAngle:   arc.endAngle,
                    arcMaterial,
                    arcBox,
                    arcMesh,
                }
            },
            update: (current, next) => {
                const depth = this.depthScale(next.value)

                bindArcToBoxGeometry({
                    innerRadius: this.innerRadius,
                    outerRadius: this.outerRadius,
                    startAngle:  next.startAngle,
                    endAngle:    next.endAngle,
                    depth,
                    box:         current.arcBox,
                    resolution:  this.arcResolution,
                })

                current.arcMesh.material.wireframe = this.wireframe
            },
        })
    }

    buildLinksPool() {
        this.linksPool = new Selection({
            identify: ({ source, target }) => `${source.index}.${target.index}`,
            enter:    ({ source, target }) => {
                const geometry = ribbonGeometry({
                    radius:           this.innerRadius,
                    sourceStartAngle: source.startAngle,
                    sourceEndAngle:   source.endAngle,
                    targetStartAngle: target.startAngle,
                    targetEndAngle:   target.endAngle,
                    depth:            this.linkThickness,
                    resolution:       2,
                })

                const material = new THREE.MeshPhongMaterial({
                    color:     this.color(target.index),
                    wireframe: this.wireframe,
                })

                const mesh = new THREE.Mesh(geometry, material)
                mesh.castShadow    = true
                mesh.receiveShadow = true
                mesh.position.y    = (source.index + target.index) * this.linkOffset
                mesh.rotation.x    = -HALF_PI

                this.add(mesh)

                return {
                    source,
                    target,
                    geometry,
                    material,
                    mesh,
                }
            },
            update: (current, { source, target }) => {
                const geometry = ribbonGeometry({
                    radius:           this.innerRadius,
                    sourceStartAngle: source.startAngle,
                    sourceEndAngle:   source.endAngle,
                    targetStartAngle: target.startAngle,
                    targetEndAngle:   target.endAngle,
                    depth:            this.linkThickness,
                    resolution:       2,
                })

                current.mesh.geometry = geometry

                current.mesh.material.wireframe = this.wireframe
            },
        })
    }

    compute() {
        const chord = this.chord(this.data.slice(1))

        this.groups = chord.groups
        this.links  = chord

        this.depthScale.domain([0, d3.max(this.groups, d => d.value)])
    }

    update() {
        this.arcsPool.update(this.groups)
        this.linksPool.update(this.links)
    }

    radiusTransition(inner, outer) {
        if (this.radiusTween) this.radiusTween.stop()

        const self = this
        this.radiusTween = new TWEEN.Tween({
            inner: this.innerRadius,
            outer: this.outerRadius,
        })
            .to({ inner, outer }, 1200)
            .easing(TWEEN.Easing.Elastic.Out)
            .onUpdate(function () {
                self.innerRadius = this.inner
                self.outerRadius = this.outer
                self.compute()
                self.update()
            })
            .onStop(() => {
                this.innerRadius = inner
                this.outerRadius = outer
            })

        this.radiusTween.start()
    }

    get depthRange() {
        return this.depthScale.range()
    }

    set depthRange(range) {
        this.depthScale.range(range)
    }

    depthRangeTransition(minDepth, maxDepth) {
        if (this.depthTween) this.depthTween.stop()

        const [min, max] = this.depthScale.range()

        const self = this
        this.depthTween = new TWEEN.Tween({ min, max })
            .to({
                min: minDepth,
                max: maxDepth,
            }, 1200)
            .easing(TWEEN.Easing.Elastic.Out)
            .onUpdate(function () {
                self.depthScale.range([this.min, this.max])
                self.compute()
                self.update()
            })
            .onStop(() => {
                this.depthScale.range([minDepth, maxDepth])
            })

        this.depthTween.start()
    }

    get anglePadding() {
        return this.chord.padAngle()
    }

    set anglePadding(padding) {
        this.chord.padAngle(padding)
    }

    anglePaddingTransition(padding) {
        if (this.anglePaddingTween) this.anglePaddingTween.stop()

        const self = this
        this.anglePaddingTween = new TWEEN.Tween({ padding: this.chord.padAngle() })
            .to({ padding }, 1200)
            .easing(TWEEN.Easing.Elastic.Out)
            .onUpdate(function () {
                self.chord.padAngle(this.padding)
                self.compute()
                self.update()
            })
            .onStop(() => {
                this.chord.padAngle(padding)
            })

        this.anglePaddingTween.start()
    }

    setData(data) {
        this.data = data
    }
}