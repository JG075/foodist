import { screen, waitFor, within, fireEvent, waitForElementToBeRemoved } from "@testing-library/react"
import axios from "axios"

import setup from "../testHelpers"
import Signup from "./Signup"
import { useAuth } from "../hooks/auth"
import apiIngrediantList from "../api/IngrediantList"
import ModelIngrediantList from "../models/IngrediantList"
import ModelIngrediant from "../models/Ingrediant"
import Qty from "../lib/qty"
import User from "../models/User"

jest.mock("../api/IngrediantList")
jest.mock("../hooks/auth")
jest.mock("axios")

const apiIngrediantListMock = apiIngrediantList as jest.Mocked<typeof apiIngrediantList>
const useAuthMock = useAuth as jest.Mock<ReturnType<typeof useAuth>>
const axiosMock = axios as jest.Mocked<typeof axios>

const createUseAuthMockReturnValue = (user: User | null = null) => ({
    user,
    signin: jest.fn(),
    signup: jest.fn(),
    signout: jest.fn(),
})

const getUsernameInput = () => screen.getByRole("textbox", { name: /username/i })
const getEmailInput = () => screen.getByRole("textbox", { name: /email/i })
const getPasswordInput = () => screen.getByLabelText(/^password/i)
const getRepeatPasswordInput = () => screen.getByLabelText(/repeat password/i)
const getSubmitButton = () => screen.getByRole("button", { name: /sign up/i })

const username = "John"
const email = "john@doe.com"
const password = "Applesauce1!"

// fireEvent is used as per react-hook-form docs, userEvent results in act() warnings, see more (https://react-hook-form.com/advanced-usage#TestingForm)
const enterValidData = () => {
    fireEvent.input(getUsernameInput(), { target: { value: username } })
    fireEvent.input(getEmailInput(), { target: { value: email } })
    fireEvent.input(getPasswordInput(), { target: { value: password } })
    fireEvent.input(getRepeatPasswordInput(), { target: { value: password } })
    fireEvent.submit(getSubmitButton())
}

const invalidUsernameMsg = "Username should only contain letters, numbers, and/or an underscore"

beforeEach(() => useAuthMock.mockReturnValue(createUseAuthMockReturnValue()))

test("If I submit with no form values I should see required errors", async () => {
    setup(<Signup />)
    fireEvent.click(getSubmitButton())
    expect(await screen.findByText("Username is required")).toBeInTheDocument()
    expect(screen.getByText("Email is required")).toBeInTheDocument()
    expect(screen.getByText("Password is required")).toBeInTheDocument()
})

test("I should not be able to enter a username with spaces", async () => {
    setup(<Signup />)
    fireEvent.input(getUsernameInput(), { target: { value: "username with spaces" } })
    fireEvent.click(getSubmitButton())
    expect(await screen.findByText(invalidUsernameMsg)).toBeInTheDocument()
})

test("I should not be able to enter a username with symbols", async () => {
    setup(<Signup />)
    fireEvent.input(getUsernameInput(), { target: { value: "username&^%£%" } })
    fireEvent.click(getSubmitButton())
    expect(await screen.findByText(invalidUsernameMsg)).toBeInTheDocument()
})

test("I should not be able to enter a username longer than 30 characters", async () => {
    setup(<Signup />)
    expect(getUsernameInput()).toHaveAttribute("maxlength", "30")
})

test("I should not see an error with a valid username", async () => {
    setup(<Signup />)
    const username = "username_test12345"
    fireEvent.input(getUsernameInput(), { target: { value: username } })
    fireEvent.click(getSubmitButton())
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
    fireEvent.input(getPasswordInput(), { target: { value: password } })
    fireEvent.click(getSubmitButton())
    await waitFor(() => expect(getPasswordInput()).toHaveAttribute("aria-invalid", "true"))
})

test("I should not be able to enter a password with no number", async () => {
    setup(<Signup />)
    const password = "Applesauce"
    fireEvent.input(getPasswordInput(), { target: { value: password } })
    fireEvent.click(getSubmitButton())
    await waitFor(() => expect(getPasswordInput()).toHaveAttribute("aria-invalid", "true"))
})

test("I should not be able to enter a password with no symbol", async () => {
    setup(<Signup />)
    const password = "Applesauce1"
    fireEvent.input(getPasswordInput(), { target: { value: password } })
    fireEvent.click(getSubmitButton())
    await waitFor(() => expect(getPasswordInput()).toHaveAttribute("aria-invalid", "true"))
})

test("I should be able to enter a valid password", async () => {
    setup(<Signup />)
    const password = "Applesauce1!"
    fireEvent.input(getPasswordInput(), { target: { value: password } })
    fireEvent.click(getSubmitButton())
    // This is needed to wait for the form to be updated before making assertions
    expect(await screen.findByText("Username is required")).toBeInTheDocument()
    await waitFor(() => expect(getPasswordInput()).not.toHaveAttribute("aria-invalid", "true"))
})

test("I should not be able to submit without repeating my password", async () => {
    setup(<Signup />)
    fireEvent.input(getUsernameInput(), { target: { value: username } })
    fireEvent.input(getEmailInput(), { target: { value: email } })
    fireEvent.input(getPasswordInput(), { target: { value: password } })
    fireEvent.click(getSubmitButton())
    expect(await screen.findByText("Repeat password is required")).toBeInTheDocument()
})

test("I should not be able to submit if both passwords don't match", async () => {
    setup(<Signup />)
    const repeatPassword = "test"
    fireEvent.input(getUsernameInput(), { target: { value: username } })
    fireEvent.input(getEmailInput(), { target: { value: email } })
    fireEvent.input(getPasswordInput(), { target: { value: password } })
    fireEvent.input(getRepeatPasswordInput(), { target: { value: repeatPassword } })
    fireEvent.click(getSubmitButton())
    expect(await screen.findByText("Passwords do not match")).toBeInTheDocument()
})

test("I should not see an error if both passwords match", async () => {
    setup(<Signup />)
    const password = "Applesauce1"
    fireEvent.input(getPasswordInput(), { target: { value: password } })
    fireEvent.input(getRepeatPasswordInput(), { target: { value: password } })
    fireEvent.click(getSubmitButton())
    const errMsg = "Passwords do not match"
    // This is needed to wait for the form to be updated before making assertions
    expect(await screen.findByText("Username is required")).toBeInTheDocument()
    await waitFor(() => expect(screen.queryByText(errMsg)).not.toBeInTheDocument())
})

test("If I enter valid data I should see a loading icon", async () => {
    let resolveCb: any = () => {}
    const res = new Promise((resolve, reject) => {
        resolveCb = resolve
    })
    const useAuthMockReturnValue = createUseAuthMockReturnValue()
    useAuthMockReturnValue.signup.mockImplementation(() => res)
    useAuthMock.mockReturnValue(useAuthMockReturnValue)
    setup(<Signup />)
    enterValidData()
    await waitFor(() => expect(getSubmitButton()).toHaveAttribute("disabled"))
    expect(within(getSubmitButton()).getByRole("progressbar")).toBeInTheDocument()
    resolveCb()
    await waitForElementToBeRemoved(() => within(getSubmitButton()).queryByRole("progressbar"))
})

test("If I enter valid data it should make a post request", async () => {
    const res = Promise.resolve({})
    const useAuthMockReturnValue = createUseAuthMockReturnValue()
    useAuthMockReturnValue.signup.mockImplementation(() => res)
    useAuthMock.mockReturnValue(useAuthMockReturnValue)
    setup(<Signup />)
    enterValidData()
    await waitFor(() => expect(useAuthMockReturnValue.signup).toBeCalledTimes(1))
    const returned = useAuthMockReturnValue.signup.mock.calls[0][0]
    expect(returned.username).toEqual(username)
    expect(returned.email).toEqual(email)
    expect(returned.password).toEqual(password)
})

test("If the username I entered is taken I should see a useful message", async () => {
    axiosMock.isAxiosError.mockImplementation(() => true)
    const res = Promise.reject({
        response: {
            data: "Duplicate username",
            status: 403,
        },
    })
    const useAuthMockReturnValue = createUseAuthMockReturnValue()
    useAuthMockReturnValue.signup.mockImplementation(() => res)
    useAuthMock.mockReturnValue(useAuthMockReturnValue)
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
    const useAuthMockReturnValue = createUseAuthMockReturnValue()
    useAuthMockReturnValue.signup.mockImplementation(() => res)
    useAuthMock.mockReturnValue(useAuthMockReturnValue)
    setup(<Signup />)
    enterValidData()
    const errMsg = "The email you have entered has already been taken"
    expect(await screen.findByText(errMsg)).toBeInTheDocument()
})

test("If the server responded with an error a message should be displayed", async () => {
    axiosMock.isAxiosError.mockImplementation(() => true)
    const res = Promise.reject({ response: { status: 404 } })
    const useAuthMockReturnValue = createUseAuthMockReturnValue()
    useAuthMockReturnValue.signup.mockImplementation(() => res)
    useAuthMock.mockReturnValue(useAuthMockReturnValue)
    setup(<Signup />)
    enterValidData()
    const errMsg = "Sorry something went wrong"
    expect(await screen.findByText(errMsg)).toBeInTheDocument()
})

test("If I enter valid data I should be taken to my home page", async () => {
    let resolveCb: any = () => {}
    const res = new Promise((resolve, reject) => {
        resolveCb = resolve
    })
    const useAuthMockReturnValue = createUseAuthMockReturnValue()
    useAuthMockReturnValue.signup.mockImplementation(() => res)
    useAuthMock.mockReturnValue(useAuthMockReturnValue)
    setup(<Signup />)
    enterValidData()
    await waitFor(() => expect(getSubmitButton()).toHaveAttribute("disabled"))
    resolveCb({ username })
    await waitForElementToBeRemoved(() => within(getSubmitButton()).queryByRole("progressbar"))
    expect(window.location.pathname).toEqual("/")
})

test("If there is IngrediantList in the state it should set the authorId and make a post request", async () => {
    const authorId = "John"
    const res = Promise.resolve({ username: authorId })
    const useAuthMockReturnValue = createUseAuthMockReturnValue()
    useAuthMockReturnValue.signup.mockImplementation(() => res)
    useAuthMock.mockReturnValue(useAuthMockReturnValue)
    const ingrediantList = new ModelIngrediantList({
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
            "ingrediant-list": JSON.stringify(ingrediantList.serialize()),
        },
    })
    apiIngrediantListMock.post.mockResolvedValue(Promise.resolve({}))
    enterValidData()
    let arg
    await waitFor(() => {
        arg = apiIngrediantListMock.post.mock.calls[0][0]
        expect(arg.authorId).toEqual(authorId)
    })
    ingrediantList.authorId = authorId
    expect(arg).toMatchObject(ingrediantList)
    await waitFor(() => expect(window.location.pathname).toEqual("/"))
})
