import Treemap    from '../charts/treemap/Treemap'
import treemapGui from '../charts/treemap/gui'
import setup      from './setup'

const { scene, gui, render } = setup({
    width:    window.innerWidth,
    height:   window.innerHeight,
    renderer: { clearColor: '#271e13' },
    ground:   { color: '#362d1f' },
    fog:      { color: '#271e13' },
})

const treemap = new Treemap({
    width:    800,
    height:   800,
    minDepth: 100,
    maxDepth: 300,
})
treemap.setData({
    "name": "Eve",
    "children": [
        {
            "name": "Cain",
            value: 12,
        },
        {
            "name": "Seth",
            "children": [
                {
                    "name": "Enszos",
                    value: 3,
                },
                {
                    "name": "Noam",
                    value: 8,
                }
            ]
        },
        {
            "name": "Abel",
            "children": [
                {
                    "name": "Enosqs",
                    value: 17,
                },
                {
                    "name": "Nsdqoam",
                    value: 11,
                }
            ]
        },
        {
            "name": "Awan",
            "children": [
                {
                    "name": "Ensqddsqoch",
                    value: 15,
                },
                {
                    "name": "whatever",
                    value: 5,
                }
            ]
        },
        {
            "name": "Azura",
            value: 27,
        },
        {
            "name": "Blah",
            value: 15,
        }
    ]
})
treemap.compute()
treemap.position.y = 1
treemap.update()
scene.add(treemap)
treemapGui(gui, treemap)

render()
