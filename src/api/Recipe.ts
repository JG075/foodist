import Recipe from "../models/Recipe"
import { createAPI } from "./utilities"

const url = "recipe"
const plural = "recipes"
const single = "recipe"

const apiRecipe = createAPI({
    url: url,
    plural: plural,
    single: single,
    model: Recipe,
})

export default apiRecipe
