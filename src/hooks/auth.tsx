import { useContext, createContext, ReactNode } from "react"
import apiAuth, { SignInModel, SignUpModel } from "../api/Auth"
import User from "../models/User"
import useLocalState from "./useLocalState"

export interface AuthContextInterface {
    user: User | null
    signin: (data: SignInModel) => Promise<User>
    signup: (data: SignUpModel) => Promise<User>
    signout: () => void
}

const authContext = createContext<AuthContextInterface | null>(null)

export const useProvideAuth = () => {
    const [user, setUser] = useLocalState(null, "user")

    const signin = async (data: SignInModel) => {
        const user = await apiAuth.signin(data)
        setUser(user)
        return user
    }

    const signup = async (data: SignUpModel) => {
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

// Consumed by React components to access user/signin/signup/signout
// It's returning the values from useProvideAuth(), which are give to the context
// Basically a shortcut for doing const { user } = useContext(authContext) in consuming components
export const useAuth = () => {
    return useContext(authContext) as AuthContextInterface
}

export const ProvideAuth = ({ children }: { children: ReactNode }) => {
    const auth = useProvideAuth()
    return <authContext.Provider value={auth}>{children}</authContext.Provider>
}
