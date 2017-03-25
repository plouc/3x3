import * as THREE from 'three'

export const getLabelTexture = (text, color, {
    size     = 512,
    fontsize = 64
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

    context.textAlign = 'center'
    context.fillStyle = color
    context.fillText(text, canvas.width / 2, canvas.height / 2 + fontsize / 2)

    const texture = new THREE.Texture(canvas)
    texture.needsUpdate = true

    return texture
}
