import { immerable } from "immer"

import ModelIngrediant from "./Ingrediant"

export default class IngrediantList {
    [immerable] = true

    constructor({ id = "", authorId = "", name = "", serves = 1, ingrediants = [] }) {
        this.id = id
        this.authorId = authorId
        this.name = name
        this.serves = serves
        this.ingrediants = ingrediants
    }

    static deserialize = ({ id, authorId, name, serves, ingrediants }) => {
        const ingrediantsItems = ingrediants.map((i) => ModelIngrediant.deserialize(i))
        return new IngrediantList({
            id,
            authorId,
            name,
            serves,
            ingrediants: ingrediantsItems,
        })
    }

    serialize() {
        const { id, authorId, name, serves, ingrediants } = this
        const ingrediantsItems = ingrediants.map((i) => i.serialize())
        return {
            id,
            authorId,
            name,
            serves,
            ingrediants: ingrediantsItems,
        }
    }

    belongsTo(username) {
        return this.authorId === username
    }

    get firstCheckedIndex() {
        return this.ingrediants.findIndex(({ checked }) => checked === true)
    }

    get displayName() {
        return this.name || "Unnamed list"
    }
}
