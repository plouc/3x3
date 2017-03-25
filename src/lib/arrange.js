import _ from 'lodash'

/**
 * Creates a grid of positions for the given items count and size.
 * It assumes items anchor are centered.
 *
 * @param {number}  x             - The grid x position
 * @param {number}  y             - The grid y position
 * @param {number}  count         - The number of positions you wish to create
 * @param {number}  size          - The item size
 * @param {boolean} [center=true] - If true wil center the grid according to `x`, `y`
 * @param {number}  [spacing=0]   - Item spacing
 * @return {Array.<{x: number, y: number}>} The generated positions
 */
export const makeGrid = (x, y, count, size, { center = true, spacing = 0 } = {}) => {
    // avoid computing trivial cases
    if (count === 0) return []
    if (count === 1) return [{ x, y }]

    const sqrt           = Math.sqrt(count)
    const columns        = Math.ceil(sqrt)
    const rows           = Math.round(sqrt) < columns ? columns - 1 : columns
    const sizeAndSpacing = size + spacing

    let offsetX = x
    let offsetY = y

    // if grid is centered apply offset according to `columns` and `rows`
    if (center === true) {
        offsetX -= (columns - 1) * sizeAndSpacing * .5
        offsetY -= (rows    - 1) * sizeAndSpacing * .5
    }

    let column = 0
    let row    = 0

    return _.range(count).map(() => {
        // if we're on last row's first column and grid is centered
        if (row === rows - 1 && column === 0 && center === true) {
            // if last row's items doesn't completely fill the line
            // we apply an extra offset to center them
            const modulus = count % columns
            if (modulus > 0) {
                offsetX += (columns - modulus) * sizeAndSpacing * .5
            }

        }
        const pos = {
            x: offsetX + column * sizeAndSpacing,
            y: offsetY + row    * sizeAndSpacing,
        }

        column++
        if (column === columns) {
            column = 0
            row++
        }

        return pos
    })
}