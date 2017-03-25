export const hitTestRectangle = (r1, r2) => {
    if (r1.hitRect) {
        r1 = {
            ...r1.hitRect,
            x: r1.x + r1.hitRect.x,
            y: r1.y + r1.hitRect.y,
        }
    }
    if (r2.hitRect) {
        r2 = {
            ...r2.hitRect,
            x: r2.x + r2.hitRect.x,
            y: r2.y + r2.hitRect.y,
        }
    }

    const halfWidth1          = r1.width  / 2
    const halfHeight1         = r1.height / 2
    const halfWidth2          = r2.width  / 2
    const halfHeight2         = r2.height / 2

    const centerX1            = r1.x + halfWidth1
    const centerY1            = r1.y + halfHeight1
    const centerX2            = r2.x + halfWidth2
    const centerY2            = r2.y + halfHeight2

    const vx                  = centerX1 - centerX2
    const vy                  = centerY1 - centerY2

    const combinedHalfWidths  = halfWidth1  + halfWidth2
    const combinedHalfHeights = halfHeight1 + halfHeight2

    return Math.abs(vx) < combinedHalfWidths && Math.abs(vy) < combinedHalfHeights
}

export const rectContains = (rect, item) => {
    return item.x > rect.x && item.x < rect.width && item.y > rect.y && item.y < rect.height
}

export const positionRectConstrain = (pos, rect) => {
    let x = pos.x
    let y = pos.y

    if (x < rect.x)          x = rect.x
    else if (x > rect.width) x = rect.width

    if (y < rect.y)           y = rect.y
    else if (y > rect.height) y = rect.height

    return { x, y }
}

export const contain = (sprite, container) => {
    const collision = []

    if (sprite.x < container.x) {
        collision.push('left')
        sprite.x = container.x
    } else if (sprite.x > container.width) {
        collision.push('right')
        sprite.x = container.width
    }

    if (sprite.y < container.y) {
        collision.push('top')
        sprite.y = container.y
    } else if (sprite.y > container.height) {
        collision.push('bottom')
        sprite.y = container.height
    }

    return collision
}
