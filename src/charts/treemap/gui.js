import { DEFAULTS, TILE_MODES } from './Treemap'

export default (gui, treemap) => {
    const folder  = gui.addFolder('Treemap')

    const options = { ...DEFAULTS }

    const tilingCtrl = folder.add(options, 'tile', TILE_MODES)
    tilingCtrl.onFinishChange(tile => {
        treemap.tilingTransition(tile)
    })

    const widthCtrl = folder.add(options, 'width', 200, 1000).step(10)
    widthCtrl.onFinishChange(width => {
        treemap.resize(width, options.height)
        treemap.compute()
        treemap.update()
    })

    const heightCtrl = folder.add(options, 'height', 200, 1000).step(10)
    heightCtrl.onFinishChange(height => {
        treemap.resize(options.width, height)
        treemap.compute()
        treemap.update()
    })

    const minDepthCtrl = folder.add(options, 'minDepth', 0, 1000).step(10)
    minDepthCtrl.onFinishChange(minDepth => {
        treemap.setDepth(minDepth, options.maxDepth)
        treemap.compute()
        treemap.update()
    })

    const maxDepthCtrl = folder.add(options, 'maxDepth', 0, 1000).step(10)
    maxDepthCtrl.onFinishChange(maxDepth => {
        treemap.setDepth(options.minDepth, maxDepth)
        treemap.compute()
        treemap.update()
    })
}