import { screen, waitFor, within, fireEvent, waitForElementToBeRemoved } from "@testing-library/react"
import axios from "axios"

import setup, { queryFactory } from "../testHelpers"
import Signup from "./Signup"
import { useAuth } from "../hooks/auth"
import apiRecipe from "../api/Recipe"
import ModelRecipe from "../models/Recipe"
import ModelIngrediant from "../models/Ingrediant"
import Qty from "../lib/qty"
import { SignUpModel } from "../api/Auth"
import User from "../models/User"

jest.mock("../api/Recipe")
jest.mock("../hooks/auth")
jest.mock("axios")

const apiRecipeMock = apiRecipe as jest.Mocked<typeof apiRecipe>
const useAuthMock = useAuth as jest.Mock<Partial<ReturnType<typeof useAuth>>>
const axiosMock = axios as jest.Mocked<typeof axios>

const userNameInput = queryFactory({ matcher: "Role" }, "textbox", { name: /username/i })
const emailInput = queryFactory({ matcher: "Role" }, "textbox", { name: /email/i })
const passwordInput = queryFactory({ matcher: "LabelText" }, /^password/i)
const repeatPasswordInput = queryFactory({ matcher: "LabelText" }, /repeat password/i)
const submitButton = queryFactory({ matcher: "Role" }, "button", { name: /sign up/i })

const username = "John"
const email = "john@doe.com"
const password = "Applesauce1!"

// fireEvent is used as per react-hook-form docs, userEvent results in act() warnings, see more (https://react-hook-form.com/advanced-usage#TestingForm)
const enterValidData = () => {
    fireEvent.input(userNameInput.get(), { target: { value: username } })
    fireEvent.input(emailInput.get(), { target: { value: email } })
    fireEvent.input(passwordInput.get(), { target: { value: password } })
    fireEvent.input(repeatPasswordInput.get(), { target: { value: password } })
    fireEvent.submit(submitButton.get())
}

const invalidUsernameMsg = "Username should only contain letters, numbers, and/or an underscore"

beforeEach(() => {
    useAuthMock.mockReturnValue({ signup: jest.fn() })
})

test("If I submit with no form values I should see required errors", async () => {
    setup(<Signup />)
    fireEvent.click(submitButton.get())
    expect(await screen.findByText("Username is required")).toBeInTheDocument()
    expect(screen.getByText("Email is required")).toBeInTheDocument()
    expect(screen.getByText("Password is required")).toBeInTheDocument()
})

test("I should not be able to enter a username with spaces", async () => {
    setup(<Signup />)
    fireEvent.input(userNameInput.get(), { target: { value: "username with spaces" } })
    fireEvent.click(submitButton.get())
    expect(await screen.findByText(invalidUsernameMsg)).toBeInTheDocument()
})

test("I should not be able to enter a username with symbols", async () => {
    setup(<Signup />)
    fireEvent.input(userNameInput.get(), { target: { value: "username&^%£%" } })
    fireEvent.click(submitButton.get())
    expect(await screen.findByText(invalidUsernameMsg)).toBeInTheDocument()
})

test("I should not be able to enter a username longer than 30 characters", async () => {
    setup(<Signup />)
    expect(userNameInput.get()).toHaveAttribute("maxlength", "30")
})

test("I should not see an error with a valid username", async () => {
    setup(<Signup />)
    const username = "username_test12345"
    fireEvent.input(userNameInput.get(), { target: { value: username } })
    fireEvent.click(submitButton.get())
    // This is needed to wait for the form to be updated before making assertions
    expect(await screen.findByText("Password is required")).toBeInTheDocument()
    expect(screen.queryByText(invalidUsernameMsg)).not.toBeInTheDocument()
})

test("I should not be able to enter an invalid email", async () => {
    setup(<Signup />)
    // Let browsers handle the validation on the f/e
    expect(screen.getByRole("textbox", { name: /email/i })).toHaveAttribute("type", "email")
})

test("I should not be able to enter a password with less than 8 characters", async () => {
    setup(<Signup />)
    const password = "a".repeat(7)
    fireEvent.input(passwordInput.get(), { target: { value: password } })
    fireEvent.click(submitButton.get())
    await waitFor(() => expect(passwordInput.get()).toHaveAttribute("aria-invalid", "true"))
})

test("I should not be able to enter a password with no number", async () => {
    setup(<Signup />)
    const password = "Applesauce"
    fireEvent.input(passwordInput.get(), { target: { value: password } })
    fireEvent.click(submitButton.get())
    await waitFor(() => expect(passwordInput.get()).toHaveAttribute("aria-invalid", "true"))
})

test("I should not be able to enter a password with no symbol", async () => {
    setup(<Signup />)
    const password = "Applesauce1"
    fireEvent.input(passwordInput.get(), { target: { value: password } })
    fireEvent.click(submitButton.get())
    await waitFor(() => expect(passwordInput.get()).toHaveAttribute("aria-invalid", "true"))
})

test("I should be able to enter a valid password", async () => {
    setup(<Signup />)
    const password = "Applesauce1!"
    fireEvent.input(passwordInput.get(), { target: { value: password } })
    fireEvent.click(submitButton.get())
    // This is needed to wait for the form to be updated before making assertions
    expect(await screen.findByText("Username is required")).toBeInTheDocument()
    await waitFor(() => expect(passwordInput.get()).not.toHaveAttribute("aria-invalid", "true"))
})

test("I should not be able to submit without repeating my password", async () => {
    setup(<Signup />)
    fireEvent.input(userNameInput.get(), { target: { value: username } })
    fireEvent.input(emailInput.get(), { target: { value: email } })
    fireEvent.input(passwordInput.get(), { target: { value: password } })
    fireEvent.click(submitButton.get())
    expect(await screen.findByText("Repeat password is required")).toBeInTheDocument()
})

test("I should not be able to submit if both passwords don't match", async () => {
    setup(<Signup />)
    const repeatPassword = "test"
    fireEvent.input(userNameInput.get(), { target: { value: username } })
    fireEvent.input(emailInput.get(), { target: { value: email } })
    fireEvent.input(passwordInput.get(), { target: { value: password } })
    fireEvent.input(repeatPasswordInput.get(), { target: { value: repeatPassword } })
    fireEvent.click(submitButton.get())
    expect(await screen.findByText("Passwords do not match")).toBeInTheDocument()
})

test("I should not see an error if both passwords match", async () => {
    setup(<Signup />)
    const password = "Applesauce1"
    fireEvent.input(passwordInput.get(), { target: { value: password } })
    fireEvent.input(repeatPasswordInput.get(), { target: { value: password } })
    fireEvent.click(submitButton.get())
    const errMsg = "Passwords do not match"
    // This is needed to wait for the form to be updated before making assertions
    expect(await screen.findByText("Username is required")).toBeInTheDocument()
    await waitFor(() => expect(screen.queryByText(errMsg)).not.toBeInTheDocument())
})

test("If I enter valid data I should see a loading icon", async () => {
    let resolveCb: any = () => {}
    const res = new Promise<User>((resolve, reject) => {
        resolveCb = resolve
    })
    const signupMock = jest.fn(() => res)
    useAuthMock.mockReturnValue({ signup: signupMock })
    setup(<Signup />)
    enterValidData()
    await waitFor(() => expect(submitButton.get()).toHaveAttribute("disabled"))
    expect(within(submitButton.get()).getByRole("progressbar")).toBeInTheDocument()
    resolveCb()
    await waitForElementToBeRemoved(() => within(submitButton.get()).queryByRole("progressbar"))
})

test("If I enter valid data it should make a post request", async () => {
    const res = Promise.resolve({})
    const signupMock = jest.fn<any, [SignUpModel]>(() => res)
    useAuthMock.mockReturnValue({ signup: signupMock })
    setup(<Signup />)
    enterValidData()
    await waitFor(() => expect(signupMock).toBeCalledTimes(1))
    const arg = signupMock.mock.calls[0][0]
    expect(arg.username).toEqual(username)
    expect(arg.email).toEqual(email)
    expect(arg.password).toEqual(password)
})

test("If the username I entered is taken I should see a useful message", async () => {
    axiosMock.isAxiosError.mockImplementation(() => true)
    const res = Promise.reject({
        response: {
            data: "Duplicate username",
            status: 403,
        },
    })
    const signupMock = jest.fn(() => res)
    useAuthMock.mockReturnValue({ signup: signupMock })
    setup(<Signup />)
    enterValidData()
    const errMsg = "The username you have entered has already been taken"
    expect(await screen.findByText(errMsg)).toBeInTheDocument()
})

test("If the email I entered is taken I should see a useful message", async () => {
    axiosMock.isAxiosError.mockImplementation(() => true)
    const res = Promise.reject({
        response: {
            data: "Duplicate email",
            status: 403,
        },
    })
    const signupMock = jest.fn(() => res)
    useAuthMock.mockReturnValue({ signup: signupMock })
    setup(<Signup />)
    enterValidData()
    const errMsg = "The email you have entered has already been taken"
    expect(await screen.findByText(errMsg)).toBeInTheDocument()
})

test("If the server responded with an error a message should be displayed", async () => {
    axiosMock.isAxiosError.mockImplementation(() => true)
    const res = Promise.reject({ response: { status: 404 } })
    const signupMock = jest.fn(() => res)
    useAuthMock.mockReturnValue({ signup: signupMock })
    setup(<Signup />)
    enterValidData()
    const errMsg = "Sorry something went wrong"
    expect(await screen.findByText(errMsg)).toBeInTheDocument()
})

test("If I enter valid data I should be taken to my home page", async () => {
    let resolveCb: any = () => {}
    const res = new Promise<User>((resolve, reject) => {
        resolveCb = resolve
    })
    const signupMock = jest.fn(() => res)
    useAuthMock.mockReturnValue({ signup: signupMock })
    setup(<Signup />)
    enterValidData()
    await waitFor(() => expect(submitButton.get()).toHaveAttribute("disabled"))
    resolveCb({ username })
    await waitForElementToBeRemoved(() => within(submitButton.get()).queryByRole("progressbar"))
    expect(window.location.pathname).toEqual("/")
})

test("If there is Recipe in the state it should set the authorId and make a post request", async () => {
    const authorId = "John"
    const res = Promise.resolve<User>(new User({ username: authorId, email: "" }))
    const signupMock = jest.fn(() => res)
    useAuthMock.mockReturnValue({ signup: signupMock })
    const recipe = new ModelRecipe({
        name: "fruit recipe",
        ingrediants: [
            new ModelIngrediant({
                name: "apples",
                qty: new Qty("1"),
            }),
            new ModelIngrediant({
                name: "pears",
                qty: new Qty("10"),
            }),
        ],
    })
    setup(<Signup />, {
        localStorage: {
            recipe: JSON.stringify(recipe.serialize()),
        },
    })
    apiRecipeMock.post.mockResolvedValue(Promise.resolve({}))
    enterValidData()
    let arg
    await waitFor(() => {
        arg = apiRecipeMock.post.mock.calls[0][0]
        expect(arg.authorId).toEqual(authorId)
    })
    recipe.authorId = authorId
    expect(arg).toMatchObject(recipe)
    await waitFor(() => expect(window.location.pathname).toEqual("/"))
})
