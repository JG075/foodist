import "@testing-library/jest-dom"
import { render } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { JSXElementConstructor, ReactElement } from "react"
import { BrowserRouter as Router, MemoryRouter, PathRouteProps, Route, Routes } from "react-router-dom"

export interface SetupOptions {
    localStorage?: { [key: string]: any }
}

function setup(jsx: ReactElement<any, string | JSXElementConstructor<any>>, options: SetupOptions = {}) {
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

const defaultSetup = (jsx: ReactElement<any, string | JSXElementConstructor<any>>, options?: SetupOptions) => {
    const jsxWithRouter = <Router>{jsx}</Router>
    return setup(jsxWithRouter, options)
}

export const setupWithMemoryRouter = (
    jsx: ReactElement<any, string | JSXElementConstructor<any>>,
    { routerPath, routePath, ...options }: { routerPath: string | Partial<Location>; routePath: PathRouteProps["path"] }
) => {
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
