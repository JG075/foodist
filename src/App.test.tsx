import App from "./App"

import setup from "./testHelpers"
import { useAuth } from "./hooks/auth"
import { screen } from "@testing-library/react"
import User from "./models/User"

jest.mock("./hooks/auth")

const useAuthMock = useAuth as jest.Mock<Partial<ReturnType<typeof useAuth>>>

test("If I am not logged in I should see a 'sign in' and 'sign up' link", async () => {
    useAuthMock.mockReturnValue({})
    setup(<App />)
    expect(screen.getByRole("link", { name: /sign up/i })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /sign in/i })).toBeInTheDocument()
})

test("If I am logged in I should see a 'sign out' link", async () => {
    const mockUser = new User({ username: "test", email: "test@test.com" })
    useAuthMock.mockReturnValue({ user: mockUser })
    setup(<App />)
    expect(screen.getByRole("link", { name: /sign out/i })).toBeInTheDocument()
})

test("If click 'sign out' it should call the signout hook and then redirect me to the home page", async () => {
    const mockUser = new User({ username: "test", email: "test@test.com" })
    const signOutMock = jest.fn()
    useAuthMock.mockReturnValue({ user: mockUser, signout: signOutMock })
    const { user } = setup(<App />)
    await user.click(screen.getByRole("link", { name: /sign out/i }))
    expect(signOutMock).toBeCalledTimes(1)
    expect(window.location.pathname).toEqual("/")
})
