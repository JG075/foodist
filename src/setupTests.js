import "@testing-library/jest-dom"
import { render } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { BrowserRouter as Router, MemoryRouter, Route, Routes } from "react-router-dom"

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
        ...render(jsx),
    }
}

const defaultSetup = (jsx, options) => {
    const jsxWithRouter = <Router>{jsx}</Router>
    return setup(jsxWithRouter, options)
}

export const setupWithMemoryRouter = (jsx, { routerPath, routePath, ...options }) => {
    const jsxWithRouter = (
        <MemoryRouter initialEntries={[routerPath]}>
            <Routes>
                <Route path={routePath} element={jsx} />
            </Routes>
        </MemoryRouter>
    )
    return setup(jsxWithRouter, options)
}

export default defaultSetup
