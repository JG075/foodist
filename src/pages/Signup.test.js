import { screen, waitFor, act as actComponent, within } from "@testing-library/react"

import setup from "../setupTests"
import Signup from "./Signup"
import ApiUser from "../api/User"
import ApiIngrediantList from "../api/IngrediantList"
import ModelIngrediantList from "../models/IngrediantList"
import ModelIngrediant from "../models/Ingrediant"
import Qty from "../lib/qty"

jest.mock("../api/User")
jest.mock("../api/IngrediantList")

const getUsernameInput = () => screen.getByRole("textbox", { name: /username/i })
const getEmailInput = () => screen.getByRole("textbox", { name: /email/i })
const getPasswordInput = () => screen.getByLabelText(/^password/i)
const getRepeatPasswordInput = () => screen.getByLabelText(/repeat password/i)
const getSubmitButton = () => screen.getByText("Submit")

const enterValidData = async (user) => {
    const username = "John"
    const email = "john@doe.com"
    const password = "Applesauce1!"
    await user.type(getUsernameInput(), username)
    await user.type(getEmailInput(), email)
    await user.type(getPasswordInput(), password)
    await user.type(getRepeatPasswordInput(), password)
    await actComponent(async () => {
        await user.click(getSubmitButton())
    })
}

const invalidUsernameMsg = "Username should only contain letters, numbers, and/or an underscore"

beforeEach(() => {
    ApiUser.post.mockResolvedValue(Promise.resolve({ response: {} }))
})

test("If I submit with no form values I should see required errors", async () => {
    const { user } = setup(<Signup />)
    await user.click(getSubmitButton())
    expect(await screen.findByText("Username is required")).toBeInTheDocument()
    expect(await screen.findByText("Email is required")).toBeInTheDocument()
    expect(await screen.findByText("Password is required")).toBeInTheDocument()
})

test("I should not be able to enter a username with spaces", async () => {
    const { user } = setup(<Signup />)
    await user.type(getUsernameInput(), "username with spaces")
    await actComponent(async () => {
        await user.click(getSubmitButton())
    })
    expect(await screen.findByText(invalidUsernameMsg)).toBeInTheDocument()
})

test("I should not be able to enter a username with symbols", async () => {
    const { user } = setup(<Signup />)
    await user.type(getUsernameInput(), "username&^%£%")
    await actComponent(async () => {
        await user.click(getSubmitButton())
    })
    expect(await screen.findByText(invalidUsernameMsg)).toBeInTheDocument()
})

test("I should not be able to enter a username longer than 30 characters", async () => {
    const { user } = setup(<Signup />)
    const username = "a".repeat(31)
    const expected = "a".repeat(30)
    await user.type(getUsernameInput(), username)
    await actComponent(async () => {
        await user.click(getSubmitButton())
    })
    expect(getUsernameInput()).toHaveValue(expected)
})

test("I should not see an error with a valid username", async () => {
    const { user } = setup(<Signup />)
    await user.type(getUsernameInput(), "username_test12345")
    await actComponent(async () => {
        await user.click(getSubmitButton())
    })
    await waitFor(() => expect(screen.queryByText(invalidUsernameMsg)).not.toBeInTheDocument())
})

test("I should not be able to enter an invalid email", async () => {
    setup(<Signup />)
    // Let browsers handle the validation on the f/e
    expect(screen.getByRole("textbox", { name: /email/i })).toHaveAttribute("type", "email")
})

test("I should not be able to enter a password with less than 8 characters", async () => {
    const { user } = setup(<Signup />)
    const password = "a".repeat(7)
    await user.type(getPasswordInput(), password)
    await actComponent(async () => {
        await user.click(getSubmitButton())
    })
    expect(getPasswordInput()).toHaveAttribute("aria-invalid", "true")
})

test("I should not be able to enter a password with no number", async () => {
    const { user } = setup(<Signup />)
    const password = "Applesauce"
    await user.type(getPasswordInput(), password)
    await actComponent(async () => {
        await user.click(getSubmitButton())
    })
    expect(getPasswordInput()).toHaveAttribute("aria-invalid", "true")
})

test("I should not be able to enter a password with no symbol", async () => {
    const { user } = setup(<Signup />)
    const password = "Applesauce1"
    await user.type(getPasswordInput(), password)
    await actComponent(async () => {
        await user.click(getSubmitButton())
    })
    expect(getPasswordInput()).toHaveAttribute("aria-invalid", "true")
})

test("I should be able to enter a valid password", async () => {
    const { user } = setup(<Signup />)
    const password = "Applesauce1!"
    await user.type(getPasswordInput(), password)
    await actComponent(async () => {
        await user.click(getSubmitButton())
    })
    expect(getPasswordInput()).not.toHaveAttribute("aria-invalid", "true")
})

test("I should not be able to submit without repeating my password", async () => {
    const { user } = setup(<Signup />)
    const username = "john"
    const email = "john@doe.com"
    const password = "Applesauce1!"
    await user.type(getUsernameInput(), username)
    await user.type(getEmailInput(), email)
    await user.type(getPasswordInput(), password)
    await actComponent(async () => {
        await user.click(getSubmitButton())
    })
    expect(await screen.findByText("Repeat password is required")).toBeInTheDocument()
})

test("I should not be able to submit if both passwords don't match", async () => {
    const { user } = setup(<Signup />)
    const username = "John"
    const email = "john@doe.com"
    const password = "Applesauce1!"
    const repeatPassword = "test"
    await user.type(getUsernameInput(), username)
    await user.type(getEmailInput(), email)
    await user.type(getPasswordInput(), password)
    await user.type(getRepeatPasswordInput(), repeatPassword)
    await actComponent(async () => {
        await user.click(getSubmitButton())
    })
    expect(await screen.findByText("Passwords do not match")).toBeInTheDocument()
})

test("I should not see an error if both passwords match", async () => {
    const { user } = setup(<Signup />)
    await enterValidData(user)
    const errMsg = "Passwords do not match"
    await waitFor(() => expect(screen.queryByText(errMsg)).not.toBeInTheDocument())
})

test("If I enter valid data I should see a loading icon", async () => {
    const { user } = setup(<Signup />)
    const res = new Promise(() => {})
    ApiUser.post.mockResolvedValue(res)
    await enterValidData(user)
    expect(getSubmitButton()).toHaveAttribute("disabled")
    expect(within(getSubmitButton()).getByRole("progressbar")).toBeInTheDocument()
})

test("If I enter valid data, once the request resolves, I should not see a loding icon", async () => {
    const { user } = setup(<Signup />)
    await enterValidData(user)
    await waitFor(() => expect(getSubmitButton()).not.toHaveAttribute("disabled"))
    expect(within(getSubmitButton()).queryByRole("progressbar")).not.toBeInTheDocument()
})

test("If I enter valid data it should make a post request", async () => {
    const { user } = setup(<Signup />)
    await enterValidData(user)
    expect(ApiUser.post).toBeCalledTimes(1)
    const { id, email, password } = ApiUser.post.mock.calls[0][0]
    expect(id).toEqual("John")
    expect(email).toEqual("john@doe.com")
    expect(password).toEqual("Applesauce1!")
})

test("If the username I entered is taken I should see a useful message", async () => {
    const { user } = setup(<Signup />)
    const response = {
        data: "Error: Insert failed, duplicate id",
        status: 500,
    }
    ApiUser.post.mockRejectedValue({ response })
    await enterValidData(user)
    const errMsg = "The username you have entered has already been taken"
    expect(screen.getByText(errMsg)).toBeInTheDocument()
})

test("If the server responded with an error a message should be displayed", async () => {
    const { user } = setup(<Signup />)
    ApiUser.post.mockRejectedValue({ response: { status: 500 } })
    await enterValidData(user)
    const errMsg = "Sorry something went wrong"
    expect(screen.getByText(errMsg)).toBeInTheDocument()
})

test("If I enter valid data I should be taken to my home page", async () => {
    const { user } = setup(<Signup />)
    ApiUser.post.mockResolvedValue(Promise.resolve({ id: "John" }))
    await enterValidData(user)
    // const route = mockedUseNavigate.mock.calls[0][0]
    await waitFor(() => expect(window.location.pathname).toEqual("/user/john/lists"))
})

test("If there is IngrediantList in the state it should set the authorId and make a post request", async () => {
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
    const { user } = setup(<Signup />, {
        localStorage: {
            "ingrediant-list": JSON.stringify(ingrediantList.serialize()),
        },
    })
    const authorId = "John"
    ApiUser.post.mockResolvedValue({ id: authorId })
    ApiIngrediantList.post.mockResolvedValue(Promise.resolve())
    await enterValidData(user)
    const arg = ApiIngrediantList.post.mock.calls[0][0]
    expect(arg.authorId).toEqual(authorId)
    ingrediantList.authorId = authorId
    expect(arg).toMatchObject(ingrediantList.serialize())
})
