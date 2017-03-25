const MIN_RADIUS = 6
const MIN_DEPTH  = 6

export default (gui, chord) => {
    const folder  = gui.addFolder('Chord')
    folder.closed = false

    const depthRange = chord.depthRange
    const options    = {
        innerRadius:   chord.innerRadius,
        outerRadius:   chord.outerRadius,
        anglePadding:  chord.anglePadding,
        minDepth:      depthRange[0],
        maxDepth:      depthRange[1],
        linkThickness: chord.linkThickness,
        linkOffset:    chord.linkOffset,
        wireframe:     chord.wireframe,
    }

    const innerRadiusCtrl = folder.add(options, 'innerRadius', 100, 600).step(10)
    innerRadiusCtrl.onFinishChange(innerRadius => {
        chord.radiusTransition(
            Math.min(innerRadius, options.outerRadius - MIN_RADIUS),
            options.outerRadius
        )
    })

    const outerRadiusCtrl = folder.add(options, 'outerRadius', 100, 600).step(10)
    outerRadiusCtrl.onFinishChange(outerRadius => {
        chord.radiusTransition(
            options.innerRadius,
            Math.max(outerRadius, options.innerRadius + MIN_RADIUS)
        )
    })

    const anglePaddingCtrl = folder.add(options, 'anglePadding', 0, Math.PI * .1).step(.01)
    anglePaddingCtrl.onFinishChange(padding => {
        chord.anglePaddingTransition(padding)
    })

    const arcs = folder.addFolder('Arcs')

    const minDepthCtrl = arcs.add(options, 'minDepth', MIN_DEPTH, 1000).step(10)
    minDepthCtrl.onFinishChange(minDepth => {
        chord.depthRangeTransition(Math.min(minDepth, options.maxDepth), options.maxDepth)
    })

    const maxDepthCtrl = arcs.add(options, 'maxDepth', MIN_DEPTH, 1000).step(10)
    maxDepthCtrl.onFinishChange(maxDepth => {
        chord.depthRangeTransition(options.minDepth, Math.max(maxDepth, options.minDepth))
    })

    const links = folder.addFolder('Links')

    const linkThicknessCtrl = links.add(options, 'linkThickness', 2, 100).step(1)
    linkThicknessCtrl.onFinishChange(thickness => {
        chord.linkThickness = thickness
        chord.update()
    })

    const linkOffsetCtrl = links.add(options, 'linkOffset', 0, 100).step(1)
    linkOffsetCtrl.onFinishChange(offset => {
        chord.linkOffset = offset
        chord.update()
    })

    const wireframeCtrl = folder.add(options, 'wireframe')
    wireframeCtrl.onFinishChange(isEnabled => {
        chord.wireframe = isEnabled
    })
}