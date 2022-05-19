import "@testing-library/jest-dom"
import { render, screen, Screen } from "@testing-library/react"
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

type matcherTypes = "Role" | "LabelText" | "PlaceholderText" | "TestId" | "Text"
export const queryFactory = <M extends matcherTypes>(
    {
        matcher,
        getElement = () => screen,
    }: {
        matcher: matcherTypes
        getElement?: any
    },
    ...args: [...Parameters<Screen[`getBy${M}`]>]
) => {
    return {
        // @ts-ignore
        get: (): ReturnType<Screen[`getBy${M}`]> => getElement()[`getBy${matcher}`](...args),
        // @ts-ignore
        find: async (): ReturnType<Screen[`findBy${M}`]> => await getElement()[`findBy${matcher}`](...args),
        // @ts-ignore
        query: (): ReturnType<Screen[`queryBy${M}`]> => getElement()[`queryBy${matcher}`](...args),
        // @ts-ignore
        getAll: (): ReturnType<Screen[`getAllBy${M}`]> => getElement()[`getAllBy${matcher}`](...args),
        // @ts-ignore
        findAll: async (): ReturnType<Screen[`findAllBy${M}`]> => await getElement()[`findAllBy${matcher}`](...args),
        // @ts-ignore
        queryAll: (): ReturnType<Screen[`queryAllBy${M}`]> => getElement()[`queryAllBy${matcher}`](...args),
    }
}

export default defaultSetup
