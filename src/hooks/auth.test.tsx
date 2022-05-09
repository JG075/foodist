import { screen } from "@testing-library/react"

import setup from "../testHelpers"
import { useAuth, ProvideAuth } from "./auth"
import useLocalState from "./useLocalState"
import { useImmer } from "use-immer"
import ModelUser from "../models/User"
import apiAuth, { SignInModel, SignUpModel } from "../api/Auth"

jest.mock("../api/Auth")
jest.mock("./useLocalState")

const mockedApiAuth = {
    signin: apiAuth.signin as jest.Mock<ReturnType<typeof apiAuth.signin>>,
    signup: apiAuth.signup as jest.Mock<ReturnType<typeof apiAuth.signup>>,
    signout: apiAuth.signout as jest.Mock<ReturnType<typeof apiAuth.signout>>,
}
const mockedUseLocalState = useLocalState as jest.Mock<ReturnType<typeof useLocalState>>

const NoAuthComponent = () => {
    const auth = useAuth()
    if (!auth) {
        return null
    }
    const { user } = auth
    return <div>{user && <div>{user.username}</div>}</div>
}

const SigninComponent = ({ data }: { data: SignInModel }) => {
    const auth = useAuth()
    if (!auth) {
        return null
    }
    const { signin, user } = auth
    const handleSignin = async () => await signin(data)
    return (
        <div>
            {user && <div>{user.username}</div>}
            <button onClick={handleSignin}>sign in</button>
        </div>
    )
}

const SignoutComponent = () => {
    const auth = useAuth()
    if (!auth) {
        return null
    }
    const { signout, user } = auth
    const handleSignout = async () => await signout()
    return (
        <div>
            {user && <div>{user.username}</div>}
            <button onClick={handleSignout}>sign out</button>
        </div>
    )
}

const SignupComponent = ({ data }: { data: SignUpModel }) => {
    const auth = useAuth()
    if (!auth) {
        return null
    }
    const { signup, user } = auth
    const handleSignup = async () => await signup(data)
    return (
        <div>
            {user && <div>{user.username}</div>}
            <button onClick={handleSignup}>sign up</button>
        </div>
    )
}

const userMock = new ModelUser({
    username: "test_username",
    email: "test@gmail.com",
})

test("It calls useLocalState with null and 'user' as the key", () => {
    mockedUseLocalState.mockImplementation(useImmer)
    setup(
        <ProvideAuth>
            <NoAuthComponent />
        </ProvideAuth>
    )
    expect(useLocalState).toBeCalledWith(null, "user")
    expect(screen.queryByText(userMock.username)).not.toBeInTheDocument()
})

test("The signin function calls the auth API and sets the user in the state", async () => {
    mockedUseLocalState.mockImplementation(useImmer)
    mockedApiAuth.signin.mockResolvedValue(userMock)
    const data = {
        username: "test",
        password: "pass",
        email: "testemail",
    }
    const { user } = setup(
        <ProvideAuth>
            <SigninComponent data={data} />
        </ProvideAuth>
    )
    await user.click(screen.getByText("sign in"))
    expect(mockedApiAuth.signin).toBeCalledWith(data)
    expect(await screen.findByText(userMock.username)).toBeInTheDocument()
})

test("The signout function calls the auth API and sets the user in the state to null", async () => {
    mockedUseLocalState.mockImplementation(useImmer)
    mockedApiAuth.signout.mockResolvedValue({})
    const { user } = setup(
        <ProvideAuth>
            <SignoutComponent />
        </ProvideAuth>
    )
    await user.click(screen.getByText("sign out"))
    expect(mockedApiAuth.signout).toBeCalled()
    expect(screen.queryByText(userMock.username)).not.toBeInTheDocument()
})

test("The signup function calls the auth API and sets the users in the state", async () => {
    mockedUseLocalState.mockImplementation(useImmer)
    mockedApiAuth.signup.mockResolvedValue(userMock)
    const data = {
        username: "test",
        password: "pass",
        email: "testemail",
    }
    const { user } = setup(
        <ProvideAuth>
            <SignupComponent data={data} />
        </ProvideAuth>
    )
    await user.click(screen.getByText("sign up"))
    expect(mockedApiAuth.signup).toBeCalledWith(data)
    expect(await screen.findByText(userMock.username)).toBeInTheDocument()
})
