import { immerable } from "immer"
import { v4 as uuidv4 } from "uuid"
import Qty from "../lib/qty"

export default class Ingrediant {
    [immerable] = true
    id: string
    name: string
    qty: Qty
    checked: boolean

    constructor({ id = uuidv4(), name = "", qty = new Qty(), checked = false }) {
        this.id = id
        this.name = name
        this.qty = qty
        this.checked = checked
    }

    serialize() {
        const { id, name, qty, checked } = this
        return {
            id,
            name,
            qty: qty.toString(),
            checked,
        }
    }

    static deserialize = (instance: Ingrediant) => {
        const { id, name, qty, checked } = instance
        return new Ingrediant({
            id,
            name,
            qty: new Qty(qty),
            checked: Boolean(checked),
        })
    }
}
