import apiProvider from "./utilities/provider"
import ModelUser from "../models/User"

const signin = async (model) => {
    const { user } = await apiProvider.post("signin", model)
    return new ModelUser(user)
}

const signup = async (model) => {
    const { user } = await apiProvider.post("signup", model)
    return new ModelUser(user)
}

const signout = async (model) => await apiProvider.getSingle("signout")

const auth = {
    signin,
    signout,
    signup,
}

export default auth
