import { render, waitFor, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import App from "./App"

const adderPlaceholderText = "Enter an ingrediant and quantity e.g. 2 lemons, mozzarella 50g"
const listNamePlaceHolderText = "Give your list a name"

const addItemToList = (inputText) => {
    const inputElem = screen.getByPlaceholderText(adderPlaceholderText)
    userEvent.clear(inputElem)
    userEvent.type(inputElem, inputText)
    userEvent.click(screen.getByRole("button", { name: /enter/i }))
    return addItemToList
}

const enterListName = (listName) => {
    const getNameInput = () => screen.getByPlaceholderText(listNamePlaceHolderText)
    userEvent.type(getNameInput(), listName)
}

const getListItems = () => screen.getAllByRole("listitem")

const getListNameInput = () => screen.getByPlaceholderText(listNamePlaceHolderText)

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
    render(<App />)
    addItemToList("2 limes")

    await waitFor(() => expect(screen.getAllByRole("listitem")).toHaveLength(1))

    const listItems = screen.getAllByRole("listitem")
    const lastItem = listItems[listItems.length - 1]
    expect(lastItem).toHaveTextContent("Limes")
    expect(lastItem).toHaveTextContent("2")
    expect(screen.getByPlaceholderText(adderPlaceholderText)).toHaveValue("")
})

test("If an item is already in the list a new item is added to the top", async () => {
    render(<App />)
    addItemToList("2 limes")("3 apples")

    await waitFor(() => expect(screen.getAllByRole("listitem")).toHaveLength(2))

    const listItems = screen.getAllByRole("listitem")
    const firstItem = listItems[0]
    expect(firstItem).toHaveTextContent("Apples")
    expect(firstItem).toHaveTextContent("3")
})

test("If I enter an invalid unit type I see an error message", async () => {
    render(<App />)
    addItemToList("20foo carrots")
    const errMsg = "You have entered an invalid measurement unit."
    await waitFor(() => {
        expect(screen.getByText(errMsg)).not.toBeNull()
    })
    addItemToList("20g carrots")
    await waitFor(() => {
        expect(screen.queryByText(errMsg)).toBeNull()
    })
})

test("If I enter no ingrediant name I see an error message", async () => {
    render(<App />)
    addItemToList("20")
    const errMsg = "Please enter an ingrediant name and optionally a quantity."
    await waitFor(() => {
        expect(screen.getByText(errMsg)).not.toBeNull()
    })
    addItemToList("20 lemons")
    await waitFor(() => {
        expect(screen.queryByText(errMsg)).toBeNull()
    })
})

test("I can delete an item from the list", async () => {
    render(<App />)
    addItemToList("2 limes")("3 apples")

    await waitFor(() => expect(getListItems()).toHaveLength(2))

    userEvent.click(screen.getAllByRole("button", { name: "delete" })[0])

    await waitFor(() => expect(getListItems()).toHaveLength(1))

    expect(getListItems()[0]).toHaveTextContent("Limes")
    expect(getListItems()[0]).toHaveTextContent("2")
})

test("I can check off an item on the list and it moves to the bottom with a completed appearance", async () => {
    render(<App />)
    addItemToList("2 limes")("3 apples")

    await waitFor(() => expect(getListItems()).toHaveLength(2))

    userEvent.click(screen.getAllByRole("checkbox")[0])

    await waitFor(() => expect(getListItems()[1]).toHaveTextContent("Apples"))
    expect(screen.getAllByRole("checkbox")[1]).toBeChecked()
})

test("I can enter a name for the list", async () => {
    render(<App />)
    const inputText = "My baked lasagne"
    enterListName(inputText)
    await waitFor(() => expect(getListNameInput()).toHaveValue(inputText))
})

test("If I reload the page the information I have entered has been saved", async () => {
    const { unmount } = render(<App />)
    const inputText = "My baked lasagne"
    enterListName(inputText)
    addItemToList("2 limes")("3 apples")
    await waitFor(() => expect(getListNameInput()).toHaveValue(inputText))
    expect(getListItems()).toHaveLength(2)
    unmount(<App />)
    render(<App />)
    await waitFor(() => expect(getListNameInput()).toHaveValue(inputText))
    expect(getListItems()).toHaveLength(2)
})
