import App from "./App"

import setup from "./testHelpers"
import { useAuth } from "./hooks/auth"
import { screen } from "@testing-library/react"
import User from "./models/User"

jest.mock("./hooks/auth")

const useAuthMock = useAuth as jest.Mock<ReturnType<typeof useAuth>>

const createUseAuthMockReturnValue = (user: User | null = null) => ({
    user,
    signin: jest.fn(),
    signup: jest.fn(),
    signout: jest.fn(),
})

beforeEach(() => useAuthMock.mockReturnValue(createUseAuthMockReturnValue()))

test("If I am not logged in I should see a 'sign in' and 'sign up' link", async () => {
    setup(<App />)
    expect(screen.getByRole("link", { name: /sign up/i })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /sign in/i })).toBeInTheDocument()
})

test("If I am logged in I should see a 'sign out' link", async () => {
    const mockUser = new User({ username: "test", email: "test@test.com" })
    useAuthMock.mockReturnValue(createUseAuthMockReturnValue(mockUser))
    setup(<App />)
    expect(screen.getByRole("link", { name: /sign out/i })).toBeInTheDocument()
})

test("If click 'sign out' it should call the signout hook and then redirect me to the home page", async () => {
    const mockUser = new User({ username: "test", email: "test@test.com" })
    const useAuthMockReturnValue = createUseAuthMockReturnValue(mockUser)
    useAuthMock.mockReturnValue(useAuthMockReturnValue)
    const { user } = setup(<App />)
    await user.click(screen.getByRole("link", { name: /sign out/i }))
    expect(useAuthMockReturnValue.signout).toBeCalledTimes(1)
    expect(window.location.pathname).toEqual("/")
})
