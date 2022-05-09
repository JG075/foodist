import { screen, waitFor, within, waitForElementToBeRemoved, fireEvent } from "@testing-library/react"
import axios from "axios"

import Signin from "./Signin"
import setup from "../testHelpers"
import { useAuth } from "../hooks/auth"
import User from "../models/User"

jest.mock("../api/Auth")
jest.mock("../hooks/auth")
jest.mock("axios")

const useAuthMock = useAuth as jest.Mock<ReturnType<typeof useAuth>>
const axiosMock = axios as jest.Mocked<typeof axios>

const email = "john@doe.com"
const password = "Applesauce1!"

const createUseAuthMockReturnValue = (user: User | null = null) => ({
    user,
    signin: jest.fn(),
    signup: jest.fn(),
    signout: jest.fn(),
})

const getLoginButton = () => screen.getByRole("button", { name: /sign in/i })
const getProgressBar = () => within(getLoginButton()).queryByRole("progressbar")

// fireEvent is used as per react-hook-form docs, userEvent results in act() warnings, see more (https://react-hook-form.com/advanced-usage#TestingForm)
const enterValidData = () => {
    fireEvent.input(screen.getByRole("textbox", { name: /email/i }), { target: { value: email } })
    fireEvent.input(screen.getByLabelText(/password/i), { target: { value: password } })
    fireEvent.submit(getLoginButton())
}

beforeEach(() => useAuthMock.mockReturnValue(createUseAuthMockReturnValue()))

test("If I submit with no form values I should see required errors", async () => {
    const useAuthMockReturnValue = createUseAuthMockReturnValue()
    useAuthMock.mockReturnValue(useAuthMockReturnValue)
    setup(<Signin />)
    fireEvent.submit(getLoginButton())
    expect(await screen.findByText("Email is required")).toBeInTheDocument()
    expect(screen.getByText("Password is required")).toBeInTheDocument()
    expect(useAuthMockReturnValue.signin).not.toBeCalled()
})

test("If I click Login then it should make an API request to login", async () => {
    const useAuthMockReturnValue = createUseAuthMockReturnValue()
    useAuthMock.mockReturnValue(useAuthMockReturnValue)
    setup(<Signin />)
    enterValidData()
    await waitFor(() => expect(useAuthMockReturnValue.signin).toBeCalledTimes(1))
    expect(useAuthMockReturnValue.signin).toBeCalledWith({
        email,
        password,
    })
})

test("If I click Login then I should see a Loading icon", async () => {
    const useAuthMockReturnValue = createUseAuthMockReturnValue()
    const res = new Promise(() => {})
    useAuthMockReturnValue.signin.mockImplementation(() => res)
    useAuthMock.mockReturnValue(useAuthMockReturnValue)
    setup(<Signin />)
    enterValidData()
    await waitFor(() => expect(getProgressBar()).toBeInTheDocument())
})

test("If the API returns an error I should see an error message and it is no longer loading", async () => {
    axiosMock.isAxiosError.mockImplementation(() => true)
    const err = {
        response: {
            status: 500,
        },
    }
    const useAuthMockReturnValue = createUseAuthMockReturnValue()
    const res = Promise.reject(err)
    useAuthMockReturnValue.signin.mockImplementation(() => res)
    useAuthMock.mockReturnValue(useAuthMockReturnValue)
    setup(<Signin />)
    enterValidData()
    expect(await screen.findByText("Sorry something went wrong.")).toBeInTheDocument()
    expect(getProgressBar()).not.toBeInTheDocument()
})

test("If the API returns a 403 error (not authorized), I should see a 'Incorrect username or password' message", async () => {
    axiosMock.isAxiosError.mockImplementation(() => true)
    const err = {
        response: {
            status: 403,
        },
    }
    const useAuthMockReturnValue = createUseAuthMockReturnValue()
    const res = Promise.reject(err)
    useAuthMockReturnValue.signin.mockImplementation(() => res)
    useAuthMock.mockReturnValue(useAuthMockReturnValue)
    setup(<Signin />)
    enterValidData()
    expect(await screen.findByText("Incorrect username or password.")).toBeInTheDocument()
    expect(getProgressBar()).not.toBeInTheDocument()
})

test("If my login is valid, I should be taken to the home page", async () => {
    const username = "John"
    let cb: any = () => {}
    const res = new Promise((resolve, reject) => {
        cb = resolve
    })
    const useAuthMockReturnValue = createUseAuthMockReturnValue()
    useAuthMockReturnValue.signin.mockImplementation(() => res)
    useAuthMock.mockReturnValue(useAuthMockReturnValue)
    setup(<Signin />)
    enterValidData()
    expect(await within(getLoginButton()).findByRole("progressbar")).toBeInTheDocument()
    cb({ user: { username } })
    await waitForElementToBeRemoved(() => getProgressBar())
    await waitFor(() => expect(window.location.pathname).toEqual("/"))
})
