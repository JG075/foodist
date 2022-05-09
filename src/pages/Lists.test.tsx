import { screen, waitFor, within } from "@testing-library/react"
import axios from "axios"

import apiIngrediantList from "../api/IngrediantList"
import Ingrediant from "../models/Ingrediant"
import ModelIngrediantList from "../models/IngrediantList"
import setup, { setupWithMemoryRouter } from "../testHelpers"
import Lists from "./Lists"
import Qty from "../lib/qty"
import IngrediantList from "../models/IngrediantList"
import User from "../models/User"

jest.mock("../api/IngrediantList")
jest.mock("axios")

const axiosMock = axios as jest.Mocked<typeof axios>

const listsMock = [
    new ModelIngrediantList({
        id: "List 1",
        authorId: "John",
        name: "My List 1",
        ingrediants: [
            new Ingrediant({
                name: "apple",
                qty: new Qty("1"),
            }),
            new Ingrediant({
                name: "pear",
                qty: new Qty("1"),
            }),
        ],
    }),
    new ModelIngrediantList({
        id: "List 2",
        authorId: "John",
        name: "My List 2",
        ingrediants: [
            new Ingrediant({
                name: "banana",
                qty: new Qty("4"),
            }),
            new Ingrediant({
                name: "peach",
                qty: new Qty("3"),
            }),
        ],
    }),
]

const getRecipeListButton = (finderFn = screen.getByRole) => finderFn("button", { name: /create recipe/i })

const testUser = new User({ username: "bob", email: "bob@test.com" })
const sharedTestCases = [[<Lists />], [<Lists user={testUser} />]]

describe("As any user", () => {
    test.each(sharedTestCases)("I see a loading indicator, while it is fetching the user's list", async (Component) => {
        const unresolvedPromise = new Promise((resolve, reject) => {})
        apiIngrediantList.getAll.mockReturnValue(unresolvedPromise)
        setup(Component)
        expect(await screen.findByRole("progressbar")).toBeInTheDocument()
    })

    test.each(sharedTestCases)(
        "I don't see a loading indicator, when it is done fetching the list",
        async (Component) => {
            apiIngrediantList.getAll.mockResolvedValue(listsMock)
            setup(Component)
            await waitFor(() => expect(screen.queryByRole("progressbar")).not.toBeInTheDocument())
        }
    )

    test.each(sharedTestCases)(
        "I see an error message if there is a problem requesting the user's list",
        async (Component) => {
            axiosMock.isAxiosError.mockImplementation(() => true)
            apiIngrediantList.getAll.mockRejectedValue({ response: { status: 500 } })
            setup(Component)
            const errMsg = "Sorry, something went wrong."
            expect(await screen.findByText(errMsg)).toBeInTheDocument()
        }
    )
})

describe("As a user viewing another user's list", () => {
    test("When I load the page, the ingrediantList api is only called with the username from the params", async () => {
        const username = "John"
        apiIngrediantList.getAll.mockImplementation(jest.fn())
        setupWithMemoryRouter(<Lists />, {
            routerPath: `/users/${username}/recipes`,
            routePath: "/users/:username/recipes",
        })
        await waitFor(() => expect(apiIngrediantList.getAll.mock.calls[0][0]).toMatchObject({ authorId: username }))
        expect(apiIngrediantList.getAll).toBeCalledTimes(1)
    })

    test("I see the title with the creator's username", async () => {
        // Prevent calling the API as we just want to test if the title is there
        apiIngrediantList.getAll.mockImplementation(() => "")
        setupWithMemoryRouter(<Lists />, { routerPath: "/users/John/recipes", routePath: "/users/:username/recipes" })
        expect(await screen.findByText("John's Lists")).toBeInTheDocument()
    })

    test("I see a 'User not found' message, if the user does not exist", async () => {
        axiosMock.isAxiosError.mockImplementation(() => true)
        apiIngrediantList.getAll.mockRejectedValue({ response: { status: 404 } })
        setup(<Lists />)
        const errMsg = "Sorry we couldn't find what you were looking for."
        expect(await screen.findByText(errMsg)).toBeInTheDocument()
    })

    test("If the user has no lists, I see some text that states this", async () => {
        apiIngrediantList.getAll.mockResolvedValue([])
        setup(<Lists />)
        const errMsg = "This user does not have any lists to show."
        expect(await screen.findByText(errMsg)).toBeInTheDocument()
        await waitFor(() => expect(screen.queryByRole("progressbar")).not.toBeInTheDocument())
    })

    test("If a list has no name I see 'Unnamed list' as it's name", async () => {
        apiIngrediantList.getAll.mockResolvedValue(listsMock)
        const listItem = new IngrediantList({
            id: "qwer23",
            name: "",
        })
        apiIngrediantList.getAll.mockResolvedValue([listItem])
        setup(<Lists />)
        expect(await screen.findByText("Unnamed list")).toBeInTheDocument()
    })

    test("The 'Create Recipe' button is not shown", async () => {
        setup(<Lists />)
        await waitFor(() => expect(getRecipeListButton(screen.queryByRole)).not.toBeInTheDocument())
    })

    test("I see each ingrediant list from the list returned by the API", async () => {
        apiIngrediantList.getAll.mockResolvedValue(listsMock)
        setupWithMemoryRouter(<Lists />, { routerPath: "/users/John/recipes", routePath: "/users/:username/recipes" })
        const listItems = await screen.findAllByRole("listitem")
        listsMock.forEach(async (item, index) => {
            const listItem = listItems[index]
            expect(listItem).toHaveTextContent(item.name)
            expect(screen.getAllByRole("link")[index]).toHaveAttribute("href", `/users/John/recipes/${item.id}`)
        })
    })
})

describe("As a logged in user viewing the home page (useAuthUser is enabled)", () => {
    test("When I load the page, the ingrediantList api is only called with the username from the params", async () => {
        apiIngrediantList.getAll.mockImplementation(jest.fn())
        setup(<Lists user={testUser} />)
        await waitFor(() =>
            expect(apiIngrediantList.getAll.mock.calls[0][0]).toMatchObject({ authorId: testUser.username })
        )
        expect(apiIngrediantList.getAll).toBeCalledTimes(1)
    })

    test("The title becomes 'My Recipes'", async () => {
        // Prevent calling the API as we just want to test if the title is there
        apiIngrediantList.getAll.mockImplementation(() => "")
        setup(<Lists user={testUser} />)
        expect(await screen.findByText("My Recipes")).toBeInTheDocument()
    })

    test("If I am logged in and I have no lists, I see some text that states this", async () => {
        apiIngrediantList.getAll.mockResolvedValue([])
        setup(<Lists user={testUser} />)
        const errMsg = "You don't have any lists to show. Make one!"
        expect(await screen.findByText(errMsg)).toBeInTheDocument()
        await waitFor(() => expect(screen.queryByRole("progressbar")).not.toBeInTheDocument())
    })

    test("If I click the 'Create List' button, I should see a loading icon", async () => {
        apiIngrediantList.getAll.mockResolvedValue([])
        const { user } = setup(<Lists user={testUser} />)
        await user.click(getRecipeListButton())
        expect(await within(getRecipeListButton()).findByRole("progressbar")).toBeInTheDocument()
    })

    test("If I click the 'Create List' button, the API to create a list should be called", async () => {
        apiIngrediantList.getAll.mockResolvedValue([])
        const { user } = setup(<Lists user={testUser} />)
        await user.click(getRecipeListButton())
        expect(apiIngrediantList.post).toBeCalledTimes(1)
        const emptyList = new ModelIngrediantList({ authorId: testUser.username })
        expect(apiIngrediantList.post.mock.calls[0][0]).toMatchObject(emptyList.serialize())
    })

    test("If I click the 'Create List' button, and the response is an errror, I should see an error message", async () => {
        axiosMock.isAxiosError.mockImplementation(() => true)
        apiIngrediantList.getAll.mockResolvedValue([])
        apiIngrediantList.post.mockRejectedValue({ response: { status: 500 } })
        const { user } = setup(<Lists user={testUser} />)
        await user.click(getRecipeListButton())
        const errMsg = "Sorry something went wrong."
        expect(await screen.findByText(errMsg)).toBeInTheDocument()
        expect(within(getRecipeListButton()).queryByRole("progressbar")).not.toBeInTheDocument()
    })

    test("If I click the 'Create List' button, and the response is successful, I should be taken to the list page", async () => {
        const listId = "ao230diwe"
        apiIngrediantList.getAll.mockResolvedValue([])
        apiIngrediantList.post.mockResolvedValue({ id: listId })
        const { user } = setup(<Lists user={testUser} />)
        await user.click(getRecipeListButton())
        await waitFor(() => expect(window.location.pathname).toEqual(`/users/${testUser.username}/recipes/${listId}`))
    })

    test("I see each ingrediant list from the list returned by the API", async () => {
        apiIngrediantList.getAll.mockResolvedValue(listsMock)
        setup(<Lists user={testUser} />)
        const listItems = await screen.findAllByRole("listitem")
        listsMock.forEach(async (item, index) => {
            const listItem = listItems[index]
            expect(listItem).toHaveTextContent(item.name)
            expect(screen.getAllByRole("link")[index]).toHaveAttribute(
                "href",
                `/users/${testUser.username}/recipes/${item.id}`
            )
        })
    })
})
