import apiProvider from "./utilities/provider"
import ModelUser from "../models/User"
import Recipe from "../models/Recipe"

export interface SignInModel {
    email: string
    password: string
}

const signin = async (model: SignInModel) => {
    const { user } = await apiProvider.post("signin", model)
    return new ModelUser(user)
}

export interface SignUpModel {
    user: {
        username: string
        email: string
        password: string
    }
    recipe?: Recipe
}

const signup = async (model: SignUpModel) => {
    const { user } = await apiProvider.post("signup", model)
    return new ModelUser(user)
}

const signout = async () => await apiProvider.getSingle("signout")

const auth = {
    signin,
    signout,
    signup,
}

export default auth
