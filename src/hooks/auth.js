import { useContext, createContext } from "react"
import apiAuth from "../api/Auth"
import useLocalState from "./useLocalState"

const authContext = createContext()

// Consumed by React components to access user/signin/signup/signout
// It's returning the values from useProvideAuth(), which are give to the context
// Basically a shortcut for doing const { user } = useContext(authContext) in consuming components
export const useAuth = () => {
    return useContext(authContext)
}

export const useProvideAuth = () => {
    const [user, setUser] = useLocalState(null, "user")

    const signin = async (data) => {
        const user = await apiAuth.signin(data)
        setUser(user)
        return user
    }

    const signup = async (data) => {
        const user = await apiAuth.signup(data)
        setUser(user)
        return user
    }

    const signout = async () => {
        await apiAuth.signout()
        setUser(null)
    }

    return {
        user,
        signin,
        signup,
        signout,
    }
}

export const ProvideAuth = ({ children }) => {
    const auth = useProvideAuth()
    return <authContext.Provider value={auth}>{children}</authContext.Provider>
}
