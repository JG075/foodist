import { render, waitFor, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import App from "./App"

// Creator tests

test("I can add an ingrediant and it appears in the ingrediant list", async () => {
    render(<App />)
    const ingrediantName = "2 limes"
    const placeholderText =
        "Enter an ingrediant and quantity e.g. 2 lemons, cheese 500g"
    const inputElem = screen.getByPlaceholderText(placeholderText)
    userEvent.type(inputElem, ingrediantName)
    userEvent.click(screen.getByRole("button", { name: /enter/i }))
    await waitFor(() => {
        expect(screen.getByText(ingrediantName)).not.toBeNull()
    })
    expect(inputElem).toHaveValue("")
})
