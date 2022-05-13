import IngrediantList from "../models/IngrediantList"
import { createAPI } from "./utilities"

const url = "ingrediant-list"
const plural = "ingrediant-lists"
const single = "ingrediant-list"

const apiIngrediantList = createAPI({
    url: url,
    plural: plural,
    single: single,
    model: IngrediantList,
})

export default apiIngrediantList
