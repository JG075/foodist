import { immerable } from "immer"

import ModelIngrediant from "./Ingrediant"

export default class IngrediantList {
    [immerable] = true

    constructor({ id = "", authorId = "", name = "", ingrediants = [] }) {
        this.id = id
        this.authorId = authorId
        this.name = name
        this.ingrediants = ingrediants
    }

    serialize() {
        const { authorId, name, ingrediants } = this
        const ingrediantsItems = ingrediants.map((i) => i.serialize())
        return {
            authorId,
            name,
            ingrediants: ingrediantsItems,
        }
    }

    static deserialize = ({ authorId, name, ingrediants }) => {
        const ingrediantsItems = ingrediants.map((i) => ModelIngrediant.deserialize(i))
        return new IngrediantList({
            authorId,
            name,
            ingrediants: ingrediantsItems,
        })
    }

    get firstCheckedIndex() {
        return this.ingrediants.findIndex(({ checked }) => checked === true)
    }
}
