import Vector2D from 'victor'

export const attractor = (options = {
    distance: 300,
    speed:    3,
}) => {
    return (subject, attractors) => {
        // filter with dumb distance checking to avoid unecessary computations
        const eligibles = attractors
            .filter(attractor => {
                return Math.abs(attractor.x - subject.x) < options.distance &&
                       Math.abs(attractor.y - subject.y) < options.distance
            })

        if (eligibles.length === 0) return { vx: subject.vx, vy: subject.vy }

        const origin = new Vector2D(subject.x, subject.y)

        let nearestDistance = options.distance
        let nearest         = null

        eligibles.forEach(attractor => {
            const attractorVector = Vector2D.fromObject(attractor)
            const dist            = origin.distance(attractorVector)

            if (dist < nearestDistance) {
                nearestDistance = dist
                nearest         = attractorVector
            }
        })

        if (!nearest) return { vx: subject.vx, vy: subject.vy }

        const delta = nearest.subtract(origin).norm().multiply(new Vector2D(options.speed, options.speed))
        const ratio = 1 - nearestDistance / options.distance

        const final = (new Vector2D(subject.vx, subject.vy)).norm().mix(delta, ratio)


        return { vx: final.x, vy: final.y }
    }
}
