import * as d3             from 'd3'
import * as THREE          from 'three'
import TWEEN               from 'tween.js'
import * as chroma         from 'd3-scale-chromatic'
import Selection           from '../../lib/Selection'
import { getLabelTexture } from '../../lib/texture'
import { blend }           from '../../lib/utils'

export const DEFAULTS = {
    width:       600,
    height:      600,
    padding:     3,
    depthOffset: 12,
    wireframe:   false,
}

export default class CirclePack extends THREE.Object3D {
    constructor({
        width       = DEFAULTS.width,
        height      = DEFAULTS.height,
        padding     = DEFAULTS.padding,
        depthOffset = DEFAULTS.depthOffset,
        wireframe   = DEFAULTS.wireframe,
    }) {
        super()

        this.width  = width
        this.height = height

        this.depthOffset = depthOffset

        this.pack = d3.pack()
            .size([width, height])
            .padding(padding)

        this.color = d3.scaleSequential(chroma.interpolateYlGnBu)
        this.color = d3.scaleSequential(d3.interpolateMagma).domain([-4, 4])

        this.wireframe = wireframe

        this.data    = {}
        this.parents = []
        this.leaves  = []

        this.initParentsSelection()
        this.initLeavesSelection()
    }

    initParentsSelection() {
        this.parentsSelection = new Selection({
            enter: node => {
                const root = new THREE.Object3D()
                root.position.x = node.x
                root.position.y = (node.depth + .5) * this.depthOffset
                root.position.z = node.z

                const cylinder = new THREE.CylinderGeometry(1, 1, 1, 64, 1)

                const mesh = new THREE.Mesh(
                    cylinder,
                    new THREE.MeshPhongMaterial({
                        color:     node.color,
                        shininess: 3,
                        specular:  d3.rgb(node.color).brighter(.1).toString(),
                        wireframe: this.wireframe,
                    })
                )
                mesh.receiveShadow = true
                mesh.castShadow    = true
                mesh.scale.x       = node.radius
                mesh.scale.y       = this.depthOffset
                mesh.scale.z       = node.radius

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
                //root.add(line)
                //root.add(label)

                this.add(root)

                return {
                    ...node,
                    root,
                    cylinder,
                    mesh,
                    label,
                    line,
                }
            },
            update: (el, node) => {
                el.root.position.x = node.x
                el.root.position.z = node.z
                el.root.position.y = (node.depth + .5) * this.depthOffset

                el.mesh.scale.x    = node.radius
                el.mesh.scale.y    = this.depthOffset
                el.mesh.scale.z    = node.radius

                el.mesh.material.wireframe = this.wireframe
            },
        })
    }

    initLeavesSelection() {
        this.leavesSelection = new Selection({
            enter: node => {
                const root = new THREE.Object3D()
                root.position.x = node.x
                root.position.y = node.depth * this.depthOffset + node.radius
                root.position.z = node.z

                const sphere = new THREE.SphereGeometry(.5, 16, 16)

                const mesh = new THREE.Mesh(
                    sphere,
                    new THREE.MeshPhongMaterial({
                        color:     node.color,
                        shininess: 3,
                        specular:  d3.rgb(node.color).brighter(.1).toString(),
                        wireframe: this.wireframe,
                    })
                )
                mesh.receiveShadow = true
                mesh.castShadow    = true
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
                //root.add(line)
                //root.add(label)

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
            update: (el, node) => {
                el.root.position.x = node.x
                el.root.position.y = node.depth * this.depthOffset + node.radius
                el.root.position.z = node.z

                el.mesh.scale.x = node.radius * 2
                el.mesh.scale.y = node.radius * 2
                el.mesh.scale.z = node.radius * 2

                el.mesh.material.wireframe = this.wireframe
            },
        })
    }

    compute() {
        this.pack(this.data)
        this.leaves = this.data.leaves()

        const descendants = this.data.descendants()

        this.parents = descendants.filter(d => (d.children !== undefined && d.children.length  >  0))
        this.leaves  = descendants.filter(d => (d.children === undefined || d.children.length === 0))
    }

    update() {
        this.parentsSelection.update(this.mapLeaves(this.parents))
        this.leavesSelection.update(this.mapLeaves(this.leaves))
    }

    resize(width, height) {
        this.width  = width
        this.height = height

        this.pack.size([width, height])
    }

    mapLeaves(leaves) {
        return leaves.map((leaf, i) => {
            return {
                value:  leaf.value,
                id:     leaf.data.id,
                radius: leaf.r,
                depth:  leaf.depth,
                x:      leaf.x - this.width  * .5,
                z:      leaf.y - this.height * .5,
                color:  this.color(leaf.depth),
            }
        })
    }

    setData(data) {
        this.data = data//d3.hierarchy({ ...data })
            .sum(d => d.value)
            .sort((a, b) => b.value - a.value)
    }
}