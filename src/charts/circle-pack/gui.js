import { DEFAULTS } from './CirclePack'

export default (gui, circelPack) => {
    const folder  = gui.addFolder('CirclePack')
    folder.closed = false

    const options = {
        ...DEFAULTS,
        wireframe: circelPack.wireframe,
    }

    const widthCtrl = folder.add(options, 'width', 200, 1000).step(10)
    widthCtrl.onFinishChange(width => {
        circelPack.resize(width, options.height)
        circelPack.compute()
        circelPack.update()
    })

    const heightCtrl = folder.add(options, 'height', 200, 1000).step(10)
    heightCtrl.onFinishChange(height => {
        circelPack.resize(options.width, height)
        circelPack.compute()
        circelPack.update()
    })

    const wireframeCtrl = folder.add(options, 'wireframe')
    wireframeCtrl.onFinishChange(isEnabled => {
        circelPack.wireframe = isEnabled
        circelPack.update()
    })
}