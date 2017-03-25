/**
 * @see https://bl.ocks.org/mbostock/ca5b03a33affa4160321
 */

import * as d3    from 'd3'
import setup      from './setup'
import CirclePack from '../charts/circle-pack/CirclePack'
import extendGui  from '../charts/circle-pack/gui'
import flare      from './data/flare'

const { scene, gui, render } = setup({
    width:    window.innerWidth,
    height:   window.innerHeight,
    renderer: { clearColor: '#2b0022' },
    ground:   { color: '#400035' },
    fog:      { color: '#2b0022' },
})

const stratify = d3.stratify()
    .parentId(d => d.id.substring(0, d.id.lastIndexOf('.')))

const circlePack = new CirclePack({
    width:    1200,
    height:   1200,
})
circlePack.setData(stratify(flare))
circlePack.compute()
circlePack.position.y = 0
circlePack.update()
scene.add(circlePack)
extendGui(gui, circlePack)

render()
