import { screen, waitFor, within, waitForElementToBeRemoved, fireEvent } from "@testing-library/react"
import axios from "axios"

import Signin from "./Signin"
import setup, { queryFactory } from "../testHelpers"
import { useAuth } from "../hooks/auth"
import User from "../models/User"

jest.mock("../api/Auth")
jest.mock("../hooks/auth")
jest.mock("axios")

const useAuthMock = useAuth as jest.Mock<Partial<ReturnType<typeof useAuth>>>
const axiosMock = axios as jest.Mocked<typeof axios>

const email = "john@doe.com"
const password = "Applesauce1!"

const loginButton = queryFactory({ matcher: "Role" }, "button", { name: /sign in/i })
const progressBar = queryFactory({ matcher: "Role", getElement: () => within(loginButton.get()) }, "progressbar")

// fireEvent is used as per react-hook-form docs, userEvent results in act() warnings, see more (https://react-hook-form.com/advanced-usage#TestingForm)
const enterValidData = () => {
    fireEvent.input(screen.getByRole("textbox", { name: /email/i }), { target: { value: email } })
    fireEvent.input(screen.getByLabelText(/password/i), { target: { value: password } })
    fireEvent.submit(loginButton.get())
}

test("If I submit with no form values I should see required errors", async () => {
    const signinMock = jest.fn()
    useAuthMock.mockReturnValue({ signin: signinMock })
    setup(<Signin />)
    fireEvent.submit(loginButton.get())
    expect(await screen.findByText("Email is required")).toBeInTheDocument()
    expect(screen.getByText("Password is required")).toBeInTheDocument()
    expect(signinMock).not.toBeCalled()
})

test("If I click Login then it should make an API request to login", async () => {
    const signinMock = jest.fn()
    useAuthMock.mockReturnValue({ signin: signinMock })
    setup(<Signin />)
    enterValidData()
    await waitFor(() => expect(signinMock).toBeCalledTimes(1))
    expect(signinMock).toBeCalledWith({
        email,
        password,
    })
})

test("If I click Login then I should see a Loading icon", async () => {
    const res = new Promise<User>(() => {})
    const signinMock = jest.fn(() => res)
    useAuthMock.mockReturnValue({ signin: signinMock })
    setup(<Signin />)
    enterValidData()
    await waitFor(() => expect(progressBar.query()).toBeInTheDocument())
})

test("If the API returns an error I should see an error message and it is no longer loading", async () => {
    axiosMock.isAxiosError.mockImplementation(() => true)
    const err = {
        response: {
            status: 500,
        },
    }
    const signinMock = jest.fn(() => res)
    useAuthMock.mockReturnValue({ signin: signinMock })
    const res = Promise.reject(err)
    setup(<Signin />)
    enterValidData()
    expect(await screen.findByText("Sorry something went wrong.")).toBeInTheDocument()
    expect(progressBar.query()).not.toBeInTheDocument()
})

test("If the API returns a 403 error (not authorized), I should see a 'Incorrect username or password' message", async () => {
    axiosMock.isAxiosError.mockImplementation(() => true)
    const err = {
        response: {
            status: 403,
        },
    }
    const res = Promise.reject(err)
    const signinMock = jest.fn(() => res)
    useAuthMock.mockReturnValue({ signin: signinMock })
    setup(<Signin />)
    enterValidData()
    expect(await screen.findByText("Incorrect username or password.")).toBeInTheDocument()
    expect(progressBar.query()).not.toBeInTheDocument()
})

test("If my login is valid, I should be taken to the home page", async () => {
    const username = "John"
    let cb: any = () => {}
    const res = new Promise<User>((resolve, reject) => {
        cb = resolve
    })
    const signinMock = jest.fn(() => res)
    useAuthMock.mockReturnValue({ signin: signinMock })
    setup(<Signin />)
    enterValidData()
    expect(await progressBar.find()).toBeInTheDocument()
    cb({ user: { username } })
    await waitForElementToBeRemoved(() => progressBar.query())
    await waitFor(() => expect(window.location.pathname).toEqual("/"))
})
