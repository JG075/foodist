import { immerable } from "immer"

import Ingrediant from "./Ingrediant"

interface IngrediantListAttrs {
    id: string
    authorId: string
    name: string
    imageUrl: string
    description: string
    serves: number
    ingrediants: Ingrediant[] | any[]
}

interface IngrediantList extends IngrediantListAttrs {}
class IngrediantList {
    [immerable] = true

    constructor({
        id = "",
        authorId = "",
        name = "",
        imageUrl = "",
        description = "",
        serves = 1,
        ingrediants = [],
    }: Partial<IngrediantListAttrs>) {
        this.id = id
        this.authorId = authorId
        this.name = name
        this.imageUrl = imageUrl
        this.description = description
        this.serves = serves
        this.ingrediants = ingrediants
    }

    static deserialize = (model: IngrediantList) => {
        const { id, authorId, name, imageUrl, description, serves, ingrediants } = model
        const ingrediantsItems = ingrediants.map((i) => Ingrediant.deserialize(i))
        return new IngrediantList({
            id,
            authorId,
            name,
            imageUrl,
            description,
            serves,
            ingrediants: ingrediantsItems,
        })
    }

    serialize() {
        const { id, authorId, name, imageUrl, description, serves, ingrediants } = this
        const ingrediantsItems = ingrediants.map((i) => i.serialize())
        return {
            id,
            authorId,
            name,
            imageUrl,
            description,
            serves,
            ingrediants: ingrediantsItems,
        }
    }

    belongsTo(username: string) {
        return this.authorId === username
    }

    get firstCheckedIndex() {
        return this.ingrediants.findIndex(({ checked }) => checked === true)
    }

    get displayName() {
        return this.name || "Unnamed list"
    }
}

export default IngrediantList
