import { screen, waitFor, act as actComponent, within } from "@testing-library/react"

import apiIngrediantList from "../api/IngrediantList"
import Ingrediant from "../models/Ingrediant"
import ModelIngrediantList from "../models/IngrediantList"
import setup, { setupWithMemoryRouter } from "../testHelpers"
import Lists from "./Lists"
import Qty from "../lib/qty"
import { useAuth } from "../hooks/auth"

jest.mock("../api/IngrediantList")
jest.mock("../hooks/auth")

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

beforeEach(() => useAuth.mockReturnValue({}))

test("I see the title with the creator's username", async () => {
    // Prevent calling the API as we just want to test if the title is there
    apiIngrediantList.getAll.mockImplementation(() => "")
    setupWithMemoryRouter(<Lists />, { routerPath: "/users/John/lists", routePath: "/users/:username/lists" })
    expect(await screen.findByText("John's Lists")).toBeInTheDocument()
})

test("If I am logged in, the title becomes 'My Lists'", async () => {
    useAuth.mockReturnValue({ user: { username: "Bob" } })
    // Prevent calling the API as we just want to test if the title is there
    apiIngrediantList.getAll.mockImplementation(() => "")
    setup(<Lists />)
    expect(await screen.findByText("My Lists")).toBeInTheDocument()
})

test("When I load the page, the ingrediantList api is only called once", async () => {
    apiIngrediantList.getAll.mockImplementation(jest.fn())
    setup(<Lists />)
    await waitFor(() => expect(apiIngrediantList.getAll).toBeCalledTimes(1))
})

test("I see a loading indicator, while it is fetching the user's list", async () => {
    const unresolvedPromise = new Promise((resolve, reject) => {})
    apiIngrediantList.getAll.mockReturnValue(unresolvedPromise)
    setup(<Lists />)
    expect(await screen.findByRole("progressbar")).toBeInTheDocument()
})

test("I don't see a loading indicator, when it is done fetching the list", async () => {
    apiIngrediantList.getAll.mockResolvedValue(listsMock)
    setup(<Lists />)
    await waitFor(() => expect(screen.queryByRole("progressbar")).not.toBeInTheDocument())
})

test("I see a 'User not found' message, if the user does not exist", async () => {
    apiIngrediantList.getAll.mockRejectedValue({ response: { status: 404 } })
    setup(<Lists />)
    const errMsg = "Sorry the user was not found."
    expect(await screen.findByText(errMsg)).toBeInTheDocument()
})

test("I see an error message if there is a problem requesting the user's list", async () => {
    apiIngrediantList.getAll.mockRejectedValue({ response: { status: 500 } })
    setup(<Lists />)
    const errMsg = "Sorry something went wrong."
    expect(await screen.findByText(errMsg)).toBeInTheDocument()
})

test("If the user has no lists, I see some text that states this", async () => {
    apiIngrediantList.getAll.mockResolvedValue([])
    setup(<Lists />)
    const errMsg = "This user does not have any lists to show."
    expect(await screen.findByText(errMsg)).toBeInTheDocument()
    await waitFor(() => expect(screen.queryByRole("progressbar")).not.toBeInTheDocument())
})

test("If I am logged in and I have no lists, I see some text that states this", async () => {
    useAuth.mockReturnValue({ user: { username: "Bob" } })
    apiIngrediantList.getAll.mockResolvedValue([])
    setup(<Lists />)
    const errMsg = "You don't have any lists to show. Make one!"
    expect(await screen.findByText(errMsg)).toBeInTheDocument()
    await waitFor(() => expect(screen.queryByRole("progressbar")).not.toBeInTheDocument())
})

const table = listsMock.map((item, index) => [item, index])
test.each(table)("I see each ingrediant list from the list returned by the API", async (list, index) => {
    apiIngrediantList.getAll.mockResolvedValue(listsMock)
    setupWithMemoryRouter(<Lists />, { routerPath: "/users/John/lists", routePath: "/users/:username/lists" })
    const listItems = await screen.findAllByRole("listitem")
    const listItem = listItems[index]
    expect(listItem).toHaveTextContent(list.id)
    expect(screen.getAllByRole("link")[index]).toHaveAttribute("href", `/users/John/lists/${list.id}`)
})
