import "@testing-library/jest-dom"
import { render } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { BrowserRouter as Router } from "react-router-dom"

function setup(jsx, options = {}) {
    const { localStorage = {} } = options
    global.Storage.prototype.setItem = (key, value) => {
        localStorage[key] = value
    }
    global.Storage.prototype.getItem = (key) => {
        const value = localStorage[key]
        if (typeof value === "undefined") {
            return null
        }
        return value
    }
    return {
        user: userEvent.setup(),
        localStorage,
        ...render(<Router>{jsx}</Router>),
    }
}

export default setup
