import { screen, waitFor, act, within, waitForElementToBeRemoved, fireEvent } from "@testing-library/react"

import Signin from "./Signin"
import setup from "../testHelpers"
import { useAuth } from "../hooks/auth"

jest.mock("../api/Auth")
jest.mock("../hooks/auth")

const email = "john@doe.com"
const password = "Applesauce1!"

const getLoginButton = () => screen.getByRole("button", { name: /sign in/i })
const getProgressBar = () => within(getLoginButton()).queryByRole("progressbar")

// fireEvent is used as per react-hook-form docs, userEvent results in act() warnings, see more (https://react-hook-form.com/advanced-usage#TestingForm)
const enterValidData = () => {
    fireEvent.input(screen.getByRole("textbox", { name: /email/i }), { target: { value: email } })
    fireEvent.input(screen.getByLabelText(/password/i), { target: { value: password } })
    fireEvent.submit(getLoginButton())
}

beforeEach(() => useAuth.mockReturnValue({}))

test("If I submit with no form values I should see required errors", async () => {
    const signinMock = jest.fn()
    useAuth.mockReturnValue({ signin: signinMock })
    setup(<Signin />)
    fireEvent.submit(getLoginButton())
    expect(await screen.findByText("Email is required")).toBeInTheDocument()
    expect(screen.getByText("Password is required")).toBeInTheDocument()
    expect(signinMock).not.toBeCalled()
})

test("If I click Login then it should make an API request to login", async () => {
    const signinMock = jest.fn()
    useAuth.mockReturnValue({ signin: signinMock })
    setup(<Signin />)
    enterValidData()
    await waitFor(() => expect(signinMock).toBeCalledTimes(1))
    expect(signinMock).toBeCalledWith({
        email,
        password,
    })
})

test("If I click Login then I should see a Loading icon", async () => {
    const res = new Promise(() => {})
    useAuth.mockReturnValue({ signin: () => res })
    setup(<Signin />)
    enterValidData()
    await waitFor(() => expect(getProgressBar()).toBeInTheDocument())
})

test("If the API returns an error I should see an error message and it is no longer loading", async () => {
    const err = {
        response: {
            status: 500,
        },
    }
    useAuth.mockReturnValue({ signin: () => Promise.reject(err) })
    setup(<Signin />)
    enterValidData()
    expect(await screen.findByText("Sorry something went wrong.")).toBeInTheDocument()
    expect(getProgressBar()).not.toBeInTheDocument()
})

test("If the API returns a 403 error (not authorized), I should see a 'Incorrect username or password' message", async () => {
    const err = {
        response: {
            status: 403,
        },
    }
    useAuth.mockReturnValue({ signin: () => Promise.reject(err) })
    setup(<Signin />)
    enterValidData()
    expect(await screen.findByText("Incorrect username or password.")).toBeInTheDocument()
    expect(getProgressBar()).not.toBeInTheDocument()
})

test("If my login is valid, I should be taken to the home page", async () => {
    const username = "John"
    let cb
    const res = new Promise((resolve, reject) => {
        cb = resolve
    })
    useAuth.mockReturnValue({ signin: () => res })
    setup(<Signin />)
    enterValidData()
    expect(await within(getLoginButton()).findByRole("progressbar")).toBeInTheDocument()
    cb({ user: { username } })
    await waitForElementToBeRemoved(() => getProgressBar())
    await waitFor(() => expect(window.location.pathname).toEqual("/"))
})
