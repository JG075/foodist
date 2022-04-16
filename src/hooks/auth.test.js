import { screen } from "@testing-library/react"

import setup from "../testHelpers"
import apiAuth from "../api/Auth"
import { useAuth, ProvideAuth } from "./auth"
import useLocalState from "./useLocalState"
import { useImmer } from "./useImmer"
import ModelUser from "../models/User"

jest.mock("../api/Auth")
jest.mock("./useLocalState")

const TestComponent = ({ data }) => {
    const { signin, signout, signup, user } = useAuth()

    const handleSignin = async () => await signin(data)
    const handleSignout = async () => await signout()
    const handleSignup = async () => await signup(data)

    return (
        <div>
            {user && <div>{user.username}</div>}
            <button onClick={handleSignin}>sign in</button>
            <button onClick={handleSignout}>sign out</button>
            <button onClick={handleSignup}>sign up</button>
        </div>
    )
}

const userMock = new ModelUser({
    username: "test_username",
    email: "test@gmail.com",
})

test("It calls useLocalState with null and 'user' as the key", () => {
    useLocalState.mockImplementation(useImmer)
    setup(
        <ProvideAuth>
            <TestComponent />
        </ProvideAuth>
    )
    expect(useLocalState).toBeCalledWith(null, "user")
    expect(screen.queryByText(userMock.username)).not.toBeInTheDocument()
})

test("The signin function calls the auth API and sets the user in the state", async () => {
    useLocalState.mockImplementation(useImmer)
    apiAuth.signin.mockResolvedValue(userMock)
    const data = {
        username: "test",
        password: "pass",
    }
    const { user } = setup(
        <ProvideAuth>
            <TestComponent data={data} />
        </ProvideAuth>
    )
    await user.click(screen.getByText("sign in"))
    expect(apiAuth.signin).toBeCalledWith(data)
    expect(await screen.findByText(userMock.username)).toBeInTheDocument()
})

test("The signout function calls the auth API and sets the user in the state to null", async () => {
    useLocalState.mockImplementation(useImmer)
    apiAuth.signout.mockResolvedValue({})
    const { user } = setup(
        <ProvideAuth>
            <TestComponent />
        </ProvideAuth>
    )
    await user.click(screen.getByText("sign out"))
    expect(apiAuth.signout).toBeCalled()
    expect(screen.queryByText(userMock.username)).not.toBeInTheDocument()
})

test("The signup function calls the auth API and sets the users in the state", async () => {
    useLocalState.mockImplementation(useImmer)
    apiAuth.signup.mockResolvedValue(userMock)
    const data = {
        username: "test",
        password: "pass",
    }
    const { user } = setup(
        <ProvideAuth>
            <TestComponent data={data} />
        </ProvideAuth>
    )
    await user.click(screen.getByText("sign up"))
    expect(apiAuth.signup).toBeCalledWith(data)
    expect(await screen.findByText(userMock.username)).toBeInTheDocument()
})
