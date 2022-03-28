import { render, waitFor, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import App from "./App"

// Creator tests

const placeholderText = "Enter an ingrediant and quantity e.g. 2 lemons, cheese 500g"

const addItemToList = (inputText) => {
    const inputElem = screen.getByPlaceholderText(placeholderText)
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
    const listItems = screen.getAllByRole("listitem")
    const firstItem = listItems[0]
    expect(firstItem).toHaveTextContent("Apples")
    expect(firstItem).toHaveTextContent("3")
})

test("If I enter an invalid unit type I see an error message", async () => {
    render(<App />)
    addItemToList("20foo carrots")
    expect(screen.getByText("You have entered an invalid measurement unit.")).not.toBeNull()
})

test("If I enter no ingrediant name I see an error message", async () => {
    render(<App />)
    addItemToList("20")
    expect(screen.getByText("Please enter an ingrediant name and optionally a quantity.")).not.toBeNull()
})
