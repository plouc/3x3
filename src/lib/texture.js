import * as THREE from 'three'

export const getLabelTexture = (text, color, {
    size     = 512,
    fontsize = 64,
    align    = 'center',
} = {}) => {
    const canvas  = document.createElement('canvas')
    const context = canvas.getContext('2d')
    canvas.width  = size
    canvas.height = size

    let maxFontsize = fontsize
    do {
        maxFontsize--
        context.font = `bold ${maxFontsize}pt Arial`
    } while (context.measureText(text).width > canvas.width)

    context.textAlign = align
    context.fillStyle = color

    let x
    if (align === 'center') {
        x = canvas.width / 2
    } else if (align === 'left') {
        x = 0
    } else if (align === 'right') {
        x = canvas.width
    } else {
        throw new Error(`invalid 'align' option: '${align}'`)
    }

    context.fillText(text, x, canvas.height / 2 + fontsize / 2)

    const texture = new THREE.Texture(canvas)
    texture.needsUpdate = true

    return texture
}
