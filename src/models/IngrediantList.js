import { immerable } from "immer"
import ModelIngrediant from "./Ingrediant"

export default class IngrediantList {
    [immerable] = true

    constructor({ name = "", ingrediants = [] }) {
        this.name = name
        this.ingrediants = ingrediants
    }

    static serialize = ({ name, ingrediants }) => {
        const ingrediantsItems = ingrediants.map((i) => ModelIngrediant.serialize(i))
        return {
            name,
            ingrediants: ingrediantsItems,
        }
    }

    static deserialize = ({ name, ingrediants }) => {
        const ingrediantsItems = ingrediants.map((i) => ModelIngrediant.deserialize(i))
        return new IngrediantList({
            name,
            ingrediants: ingrediantsItems,
        })
    }

    get firstCheckedIndex() {
        return this.ingrediants.findIndex(({ checked }) => checked === true)
    }
}
