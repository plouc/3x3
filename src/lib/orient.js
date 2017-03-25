import {
    GAME_DIRECTION_UPWARD,
    GAME_DIRECTION_FORWARD,
    GAME_DIRECTION_DOWNWARD,
    GAME_DIRECTION_BACKWARD,
} from '../constants'

const directionsRotations = {
    [GAME_DIRECTION_UPWARD]:   0,
    [GAME_DIRECTION_FORWARD]:  Math.PI * .5,
    [GAME_DIRECTION_DOWNWARD]: Math.PI,
    [GAME_DIRECTION_BACKWARD]: Math.PI * 1.5,
}

const reversedDirectionsRotations = {
    [GAME_DIRECTION_UPWARD]:   Math.PI,
    [GAME_DIRECTION_FORWARD]:  Math.PI * 1.5,
    [GAME_DIRECTION_DOWNWARD]: 0,
    [GAME_DIRECTION_BACKWARD]: Math.PI * .5,
}

export const rotationFromDirection = (direction, reverse = false) => {
    if (!reverse) return directionsRotations[direction]
    return reversedDirectionsRotations[direction]
}

const directionsRotations3d = {
    [GAME_DIRECTION_UPWARD]:   0,
    [GAME_DIRECTION_FORWARD]:  Math.PI * 1.5,
    [GAME_DIRECTION_DOWNWARD]: Math.PI,
    [GAME_DIRECTION_BACKWARD]: Math.PI * .5,
}

export const rotation3dFromDirection = (direction, reverse = false) => {
    if (!reverse) return directionsRotations3d[direction]
    return directionsRotations3d[direction]
}
