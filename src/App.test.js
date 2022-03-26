import { render, waitFor, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import App from "./App"

// Creator tests

test("I can add an ingrediant and it appears in the ingrediants list", async () => {
    render(<App />)
    const placeholderText =
        "Enter an ingrediant and quantity e.g. 2 lemons, cheese 500g"
    const inputElem = screen.getByPlaceholderText(placeholderText)
    userEvent.type(inputElem, "2 limes")
    userEvent.click(screen.getByRole("button", { name: /enter/i }))

    await waitFor(() => expect(screen.getAllByRole("listitem")).toHaveLength(1))

    const listItems = screen.getAllByRole("listitem")
    const lastItem = listItems[listItems.length - 1]
    expect(lastItem).toHaveTextContent("Limes")
    expect(lastItem).toHaveTextContent("2")
    expect(inputElem).toHaveValue("")
})

// test("If an item is already in the list a new item is added to the top", async () => {

// })
