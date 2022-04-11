import { ApiCore } from "./utilities"

const url = "user"
const plural = "users"
const single = "user"

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
