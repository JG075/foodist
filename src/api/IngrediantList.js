import { ApiCore } from "./utilities"

const url = "ingrediant-list"
const plural = "ingrediant-lists"
const single = "ingrediant-list"

const apiIngrediantList = new ApiCore({
    getAll: false,
    getSingle: false,
    post: true,
    put: false,
    patch: false,
    delete: false,
    url: url,
    plural: plural,
    single: single,
})

export default apiIngrediantList
