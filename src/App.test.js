import { render, waitFor, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import App from "./App"

import { completedStyle } from "./components/IngrediantItem"

// Creator tests

const placeholderText = "Enter an ingrediant and quantity e.g. 2 lemons, mozzarella 50g"

const addItemToList = (inputText) => {
    const inputElem = screen.getByPlaceholderText(placeholderText)
    userEvent.clear(inputElem)
    userEvent.type(inputElem, inputText)
    userEvent.click(screen.getByRole("button", { name: /enter/i }))
    return addItemToList
}

test("I can add an ingrediant and it appears in the ingrediants list", async () => {
    render(<App />)
    addItemToList("2 limes")

    await waitFor(() => expect(screen.getAllByRole("listitem")).toHaveLength(1))

    const listItems = screen.getAllByRole("listitem")
    const lastItem = listItems[listItems.length - 1]
    expect(lastItem).toHaveTextContent("Limes")
    expect(lastItem).toHaveTextContent("2")
    expect(screen.getByPlaceholderText(placeholderText)).toHaveValue("")
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
    const getListItems = () => screen.getAllByRole("listitem")

    await waitFor(() => expect(getListItems()).toHaveLength(2))

    userEvent.click(screen.getAllByRole("button", { name: "delete" })[0])

    await waitFor(() => expect(getListItems()).toHaveLength(1))

    expect(getListItems()[0]).toHaveTextContent("Limes")
    expect(getListItems()[0]).toHaveTextContent("2")
})

test("I can check off an item on the list and it moves to the bottom with a completed appearance", async () => {
    render(<App />)
    addItemToList("2 limes")("3 apples")
    const getListItems = () => screen.getAllByRole("listitem")

    await waitFor(() => expect(getListItems()).toHaveLength(2))

    userEvent.click(screen.getAllByRole("checkbox")[0])

    await waitFor(() => expect(getListItems()[1]).toHaveTextContent("Apples"))
    expect(screen.getAllByRole("checkbox")[1]).toBeChecked()
})
