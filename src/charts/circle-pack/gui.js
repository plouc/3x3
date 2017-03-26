import { DEFAULTS } from './CirclePack'

export default (gui, circlePack) => {
    const folder  = gui.addFolder('CirclePack')
    folder.closed = false

    const options = {
        ...DEFAULTS,
        size:      circlePack.size,
        padding:   circlePack.padding,
        wireframe: circlePack.wireframe,
    }

    const sizeCtrl = folder.add(options, 'size', 200, 1000).step(10)
    sizeCtrl.onFinishChange(size => {
        circlePack.size = size
        circlePack.compute()
        circlePack.update()
    })

    const paddingCtrl = folder.add(options, 'padding', 0, 60).step(1)
    paddingCtrl.onFinishChange(padding => {
        circlePack.padding = padding
        circlePack.compute()
        circlePack.update()
    })

    const wireframeCtrl = folder.add(options, 'wireframe')
    wireframeCtrl.onFinishChange(isEnabled => {
        circlePack.wireframe = isEnabled
        circlePack.update()
    })
}