import { DEFAULTS } from './CirclePack'

export default (gui, treemap) => {
    const folder  = gui.addFolder('CirclePack')
    folder.closed = false

    const options = { ...DEFAULTS }

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
}