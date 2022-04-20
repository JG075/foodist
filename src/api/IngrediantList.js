import ModelIngrediantList from "../models/IngrediantList"
import { ApiCore } from "./utilities"

const url = "ingrediant-list"
const plural = "ingrediant-lists"
const single = "ingrediant-list"

const apiIngrediantList = new ApiCore({
    getAll: true,
    getSingle: true,
    post: true,
    put: false,
    patch: true,
    remove: true,
    url: url,
    plural: plural,
    single: single,
    model: ModelIngrediantList,
})

export default apiIngrediantList
