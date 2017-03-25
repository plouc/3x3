import * as d3             from 'd3'
import * as THREE          from 'three'
import TWEEN               from 'tween.js'
import * as chroma         from 'd3-scale-chromatic'
import Selection           from '../../lib/Selection'
import { getLabelTexture } from '../../lib/texture'
import { blend }           from '../../lib/utils'

const tileModes = {
    binary:    d3.treemapBinary,
    sliceDice: d3.treemapSliceDice,
    squarify:  d3.treemapSquarify,
    slice:     d3.treemapSlice,
    dice:      d3.treemapDice,
}

export const TILE_MODES = Object.keys(tileModes)

export const DEFAULTS = {
    width:    600,
    height:   600,
    minDepth: 200,
    maxDepth: 400,
    tile:     'squarify',
    padding:  0,
}

export default class CirclePack extends THREE.Object3D {
    constructor({
        width    = DEFAULTS.width,
        height   = DEFAULTS.height,
        minDepth = DEFAULTS.minDepth,
        maxDepth = DEFAULTS.maxDepth,
        tile     = DEFAULTS.tile,
        padding  = DEFAULTS.padding,
    }) {
        super()

        this.width  = width
        this.height = height

        this.pack = d3.pack()
            .size([width - 2, height - 2])
            .padding(padding)

        this.treemap = d3.treemap()
            .size([width, height])
            .round(true)
            .paddingInner(0)

        this.depthScale = d3.scaleLinear()
            .range([minDepth, maxDepth])

        this.color = d3.scaleOrdinal(chroma.schemePastel1)
        this.color = d3.scaleSequential(chroma.interpolateYlGnBu)

        this.setTiling(tile)

        this.data   = {}
        this.leaves = []
        this.nodes  = []

        this.buildPool()
    }

    buildPool() {
        this.pool = new Selection({
            enter: node => {
                const root = new THREE.Object3D()
                root.position.x = node.x
                root.position.z = node.z

                const sphere = new THREE.SphereGeometry(.5, 16, 16)

                const mesh = new THREE.Mesh(
                    sphere,
                    new THREE.MeshPhongMaterial({
                        color:     node.color,
                        shininess: 10,
                    })
                )
                mesh.receiveShadow = true
                mesh.castShadow    = true
                mesh.position.y    = node.radius
                mesh.scale.x       = node.radius * 2
                mesh.scale.y       = node.radius * 2
                mesh.scale.z       = node.radius * 2

                const lineGeom = new THREE.Geometry()
                lineGeom.vertices.push(
                    new THREE.Vector3(0, 0, 0),
                    new THREE.Vector3(0, 300, 0)
                )

                const line = new THREE.Line(
                    lineGeom,
                    new THREE.LineBasicMaterial({
                        color: d3.rgb(node.color).darker(1).toString(),
                    })
                )
                line.castShadow = false

                const label = new THREE.Mesh(
                    new THREE.PlaneGeometry(100, 100, 4, 4),
                    new THREE.MeshBasicMaterial({
                        map:         getLabelTexture(node.value, node.color, { fontsize: 96 }),
                        transparent: true,
                        depthTest:   false,
                    })
                )
                label.position.y = 370

                root.add(mesh)
                root.add(line)
                root.add(label)

                this.add(root)

                return {
                    ...node,
                    root,
                    sphere,
                    mesh,
                    label,
                    line,
                }
            },
            update(el, node) {
                el.root.position.x = node.x
                el.root.position.z = node.z
                el.mesh.position.y = node.radius
                el.mesh.scale.x = node.radius * 2
                el.mesh.scale.y = node.radius * 2
                el.mesh.scale.z = node.radius * 2
            },
        })
    }

    compute() {
        this.pack(this.data)
        this.leaves = this.data.leaves()

        console.log(this.leaves)

        this.color.domain([0, this.leaves.length])
        this.depthScale.domain([0, d3.max(this.leaves, d => d.value)])

        this.nodes = this.mapLeaves(this.leaves)
    }

    update() {
        this.pool.update(this.nodes)
    }

    resize(width, height) {
        this.width  = width
        this.height = height

        this.treemap.size([width, height])
    }

    setDepth(minDepth, maxDepth) {
        this.depthScale.range([minDepth, maxDepth])
    }

    setTiling(tiling) {
        this.treemap.tile(tileModes[tiling])
    }

    tilingTransition(tiling) {
        this.setTiling(tiling)

        if (this.tileTween1) {
            this.tileTween1.stop()
            this.tileTween2.stop()
            this.tileTween3.stop()
        }

        const oldNodes = [...this.nodes]
        this.compute()
        const newNodes = this.nodes

        const self = this

        this.tileTween1 = new TWEEN.Tween({ completion: 0 })
            .to({ completion: 1 }, 400)
            .easing(TWEEN.Easing.Exponential.In)
            .onUpdate(function () {
                self.pool.update(oldNodes.map(node => ({
                    ...node,
                    width:  blend(node.width,  30, this.completion),
                    height: blend(node.height, 30, this.completion),
                    depth:  blend(node.depth,  30, this.completion),
                })))
            })

        this.tileTween2 = new TWEEN.Tween({ completion: 0 })
            .to({ completion: 1 }, 400)
            .onUpdate(function () {
                self.pool.update(oldNodes.map((node, i) => {
                    const newNode = newNodes[i]
                    return {
                        ...node,
                        x:      blend(node.x, newNode.x, this.completion),
                        z:      blend(node.z, newNode.z, this.completion),
                        width:  30,
                        height: 30,
                        depth:  30,
                    }
                }))
            })

        this.tileTween3 = new TWEEN.Tween({ completion: 0 })
            .to({ completion: 1 }, 600)
            .easing(TWEEN.Easing.Exponential.Out)
            .onUpdate(function () {
                self.pool.update(newNodes.map(node => ({
                    ...node,
                    width:  blend(30, node.width,  this.completion),
                    height: blend(30, node.height, this.completion),
                    depth:  blend(30, node.depth,  this.completion),
                })))
            })

        this.tileTween1.chain(this.tileTween2)
        this.tileTween2.chain(this.tileTween3)
        this.tileTween1.start()
    }

    mapLeaves(leaves) {
        return leaves.map((leaf, i) => {
            return {
                value:  leaf.value,
                id:     leaf.data.name,
                radius: leaf.r,
                x:      leaf.x - this.width  * .5,
                z:      leaf.y - this.height * .5,
                color:  this.color(i),
            }
        })
    }

    setData(data) {
        this.data = d3.hierarchy({ ...data })
            .sum(d => d.value)
            .sort((a, b) => b.value - a.value)
    }
}