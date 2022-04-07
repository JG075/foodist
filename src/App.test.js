import { render, within, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { BrowserRouter as Router } from "react-router-dom"
import { createMemoryHistory } from "history"

import App from "./App"
import IngrediantList from "./api/IngrediantList"

jest.mock("./api/IngrediantList")

const adderPlaceholderText = "Enter an ingrediant and quantity e.g. 2 lemons, mozzarella 50g"
const listNamePlaceHolderText = "Give your list a name"

const addItemToList = (user) => {
    return async (...args) => {
        for await (let text of args) {
            const inputElem = screen.getByPlaceholderText(adderPlaceholderText)
            await user.clear(inputElem)
            await user.type(inputElem, text)
            await user.click(screen.getByRole("button", { name: /enter/i }))
        }
        return Promise.resolve()
    }
}

const enterListName = (user) => {
    return async (listName) => {
        const nameInput = screen.getByPlaceholderText(listNamePlaceHolderText)
        return await user.type(nameInput, listName, { delay: 1 })
    }
}

const getListItems = () => screen.getAllByRole("listitem")
const getListNameInput = () => screen.getByPlaceholderText(listNamePlaceHolderText)
const getPublishButton = () => screen.getByText("Publish")

function setup(jsx) {
    const history = createMemoryHistory()
    const renderJsx = <Router history={history}>{jsx}</Router>
    return {
        user: userEvent.setup(),
        ...render(renderJsx),
    }
}

let localStorageMock = {}

beforeAll(() => {
    global.Storage.prototype.setItem = (key, value) => {
        localStorageMock[key] = value
    }
    global.Storage.prototype.getItem = (key) => {
        const value = localStorageMock[key]
        if (typeof value === "undefined") {
            return null
        }
        return value
    }
    global.fetch = jest.fn(() => {
        Promise.resolve()
    })
})

beforeEach(() => {
    localStorageMock = {}
})

test("I can add an ingrediant and it appears in the ingrediants list", async () => {
    const { user } = setup(<App />)
    await addItemToList(user)("2 limes")

    expect(screen.getAllByRole("listitem")).toHaveLength(1)

    const listItems = screen.getAllByRole("listitem")
    const lastItem = listItems[listItems.length - 1]
    expect(lastItem).toHaveTextContent("Limes")
    expect(lastItem).toHaveTextContent("2")
    expect(screen.getByPlaceholderText(adderPlaceholderText)).toHaveValue("")
})

test("If an item is already in the list a new item is added to the top", async () => {
    const { user } = setup(<App />)
    await addItemToList(user)("2 limes", "3 apples")

    expect(screen.getAllByRole("listitem")).toHaveLength(2)

    const listItems = screen.getAllByRole("listitem")
    const firstItem = listItems[0]
    expect(firstItem).toHaveTextContent("Apples")
    expect(firstItem).toHaveTextContent("3")
})

test("If I enter no ingrediant name I see an error message", async () => {
    const { user } = setup(<App />)
    await addItemToList(user)("20")

    const errMsg = "Please enter an ingrediant name and optionally a quantity."
    await screen.findByText(errMsg)

    await addItemToList(user)("20 lemons")
    expect(screen.queryByText(errMsg)).toBeNull()
})

test("I can delete an item from the list", async () => {
    const { user } = setup(<App />)
    await addItemToList(user)("2 limes", "3 apples")

    expect(getListItems()).toHaveLength(2)

    await user.click(screen.getAllByRole("button", { name: "delete" })[0])

    expect(getListItems()).toHaveLength(1)

    expect(getListItems()[0]).toHaveTextContent("Limes")
    expect(getListItems()[0]).toHaveTextContent("2")
})

test("I can check off an item on the list and it moves to the bottom with a completed appearance", async () => {
    const { user } = setup(<App />)
    await addItemToList(user)("2 limes", "3 apples")

    expect(getListItems()).toHaveLength(2)

    await user.click(screen.getAllByRole("checkbox")[0])

    expect(getListItems()[1]).toHaveTextContent("Apples")
    expect(screen.getAllByRole("checkbox")[1]).toBeChecked()
})

test("I can enter a name for the list", async () => {
    const { user } = setup(<App />)
    const inputText = "My baked lasagne"
    await enterListName(user)(inputText)
    expect(getListNameInput()).toHaveValue(inputText)
})

test("If I reload the page the information I have entered has been saved", async () => {
    const { user, unmount } = setup(<App />)
    const inputText = "My baked lasagne"
    await enterListName(user)(inputText)
    await addItemToList(user)("2 limes", "3 apples")

    expect(getListNameInput()).toHaveValue(inputText)
    expect(getListItems()).toHaveLength(2)

    unmount(<App />)
    setup(<App />)

    expect(getListNameInput()).toHaveValue(inputText)
    expect(getListItems()).toHaveLength(2)
})

test("If I click the Publish button, the Publish button will show a loading state", async () => {
    const { user } = setup(<App />)
    const fakeListId = "aB29dk24"
    const resp = {
        id: fakeListId,
    }
    IngrediantList.post.mockResolvedValue(resp)
    const inputText = "My baked lasagne"
    await enterListName(user)(inputText)
    await addItemToList(user)("2 limes", "3 apples")
    await user.click(getPublishButton())
    await waitFor(() => expect(getPublishButton()).toBeDisabled())
    within(getPublishButton()).getByRole("progressbar")
})

test("If I click the Publish button, I will be taken to the signup page if I am not logged in", async () => {
    const { user } = setup(<App />)
    const fakeListId = "aB29dk24"
    const resp = {
        id: fakeListId,
    }
    IngrediantList.post.mockResolvedValue(resp)
    const inputText = "My baked lasagne"
    await enterListName(user)(inputText)
    await addItemToList(user)("2 limes", "3 apples")
    await user.click(screen.getByText("Publish"))
    expect(global.window.location.pathname).toEqual(`/signup`)
})
