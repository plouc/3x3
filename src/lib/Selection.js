import _ from 'lodash'

const DEFAULT_IDENTIFY = e => e.id
const NO_OP            = () => {}

export default class Selection {
    constructor({
        identify = DEFAULT_IDENTIFY,
        enter    = NO_OP,
        update   = NO_OP,
        exit     = NO_OP,
        recycle  = NO_OP,
    }) {
        this.identify = identify
        this.enter    = enter
        this._update  = update
        this.exit     = exit
        this.recycle  = recycle

        this._currents  = []
        this._stockpile = []
    }

    get currentSize() {
        return this._currents.length
    }

    get stockpileSize() {
        return this._stockpile.length
    }

    get size() {
        return this.currentSize + this.stockpileSize
    }

    update(entities, ...extra) {
        const existingIds = this._currents.map(this.identify)
        const ids         = entities.map(this.identify)
        const newIds      = _.difference(ids, existingIds)
        const currents    = []

        entities.forEach(entity => {
            const identity = this.identify(entity)
            if (newIds.includes(identity)) {
                // recycle
                if (this.stockpileSize > 0) {
                    const recycled = this._stockpile.shift()
                    this.recycle(recycled, entity, ...extra)
                    currents.push(recycled)
                    return
                }

                // create fresh entity
                currents.push(this.enter(entity, ...extra))
            } else if (existingIds.includes(identity)) {
                const existing = _.find(this._currents, e => this.identify(e) === identity)
                this._update(existing, entity, ...extra)
                currents.push(existing)
            }
        })

        const staleEntities = this._currents.filter(e => !ids.includes(this.identify(e)))
        staleEntities.forEach(e => this.exit(e, ...extra))

        this._currents  = currents
        this._stockpile = [ ...this._stockpile, ...staleEntities ]
    }
}
