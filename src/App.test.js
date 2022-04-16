import App from "./App"

import setup from "./testHelpers"
import { useAuth } from "./hooks/auth"
import { screen } from "@testing-library/react"

jest.mock("./hooks/auth")

beforeEach(() => useAuth.mockReturnValue({}))

test("If I am not logged in I should see a 'sign in' and 'sign up' link", async () => {
    setup(<App />)
    expect(screen.getByRole("link", { name: /sign up/i })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /sign in/i })).toBeInTheDocument()
})

test("If I am logged in I should see a 'sign out' link", async () => {
    useAuth.mockReturnValue({ user: {} })
    setup(<App />)
    expect(screen.getByRole("link", { name: /sign out/i })).toBeInTheDocument()
})

test("If click 'sign out' it should call the signout hook and then redirect me to the home page", async () => {
    const signoutMock = jest.fn()
    useAuth.mockReturnValue({ user: {}, signout: signoutMock })
    const { user } = setup(<App />)
    await user.click(screen.getByRole("link", { name: /sign out/i }))
    expect(signoutMock).toBeCalledTimes(1)
    expect(window.location.pathname).toEqual("/")
})
