import { screen, waitFor, waitForElementToBeRemoved, within } from "@testing-library/react"
import debounce from "lodash/debounce"

import setup, { SetupOptions, setupWithMemoryRouter } from "../testHelpers"
import ListMaker from "./ListMaker"
import { useAuth } from "../hooks/auth"
import apiIngrediantList from "../api/IngrediantList"
import ModeIngrediantList from "../models/IngrediantList"
import ModelIngrediant from "../models/Ingrediant"
import Qty from "../lib/qty"
import { UserEvent } from "@testing-library/user-event/dist/types/setup"
import User from "../models/User"
import Ingrediant from "../models/Ingrediant"

jest.mock("../hooks/auth")
jest.mock("../api/IngrediantList")
jest.mock("lodash/debounce")

const useAuthMock = useAuth as jest.Mock<ReturnType<typeof useAuth>>
const debounceMock = debounce as jest.Mock<ReturnType<typeof debounce>>

const createUseAuthMockReturnValue = (user: User | null = null) => ({
    user,
    signin: jest.fn(),
    signup: jest.fn(),
    signout: jest.fn(),
})

const mockedUseNavigate = jest.fn()
jest.mock("react-router-dom", () => {
    const originalModule = jest.requireActual("react-router-dom")
    return {
        __esModule: true,
        ...originalModule,
        useNavigate: () => mockedUseNavigate,
    }
})

const adderPlaceholderText = "Enter an ingrediant and quantity e.g. 2 lemons, mozzarella 50g"
const listNamePlaceHolderText = "Give your recipe a name"

const addItemToList = (user: UserEvent) => {
    return async (...args: string[]) => {
        for await (let text of args) {
            const inputElem = await screen.findByPlaceholderText(adderPlaceholderText)
            await user.clear(inputElem)
            await user.type(inputElem, text)
            await user.click(screen.getByRole("button", { name: /enter/i }))
        }
        return Promise.resolve()
    }
}

const enterListName = (user: UserEvent) => {
    return async (listName: string) => {
        const nameInput = screen.getByPlaceholderText(listNamePlaceHolderText)
        // @ts-ignore
        return await user.type(nameInput, listName, { delay: 1 })
    }
}

const getListItems = () => screen.getAllByRole("listitem")
const getListNameInput = () => screen.getByPlaceholderText(listNamePlaceHolderText)
const getServesInput = () => screen.getByRole("spinbutton", { name: /serves/i })
const getMakeForInput = () => screen.getByRole("spinbutton", { name: /make for/i })

let mockIngrediantList: ModeIngrediantList | null = null
const mockIngrediantListAuthor = "John"

beforeEach(() => {
    debounceMock.mockImplementation((fn) => fn)
    useAuthMock.mockReturnValue(createUseAuthMockReturnValue())
    mockIngrediantList = new ModeIngrediantList({
        id: "cxd24fa",
        name: "My Ingrediant List",
        authorId: mockIngrediantListAuthor,
        serves: 1,
        ingrediants: [
            new ModelIngrediant({
                name: "Apples",
                qty: new Qty("3"),
            }),
            new ModelIngrediant({
                name: "Limes",
                qty: new Qty("2"),
            }),
            new ModelIngrediant({
                name: "Orange",
                qty: new Qty("1"),
            }),
        ],
    })
})

const setupLocalUser = async (setupOptions: SetupOptions) => {
    const { user } = setup(<ListMaker useLocalView />, setupOptions)
    await addItemToList(user)("1 orange", "2 limes", "3 apples")
    return { user }
}

const setupApiUsers = () => {
    apiIngrediantList.getSingle.mockResolvedValue(mockIngrediantList)
}

const setupOwnerUser = async () => {
    setupApiUsers()
    const mockUser = new User({ username: mockIngrediantListAuthor, email: "johnsemail@somehting.com" })
    useAuthMock.mockReturnValue(createUseAuthMockReturnValue(mockUser))
    const { user } = setup(<ListMaker />)
    await screen.findByPlaceholderText(adderPlaceholderText)
    return { user }
}

const setupRestrictedUser = async () => {
    if (!mockIngrediantList) {
        throw Error("mockIngrediantList should not be null")
    }
    setupApiUsers()
    const mockUser = new User({ username: mockIngrediantListAuthor, email: "johnsemail@somehting.com" })
    useAuthMock.mockReturnValue(createUseAuthMockReturnValue(mockUser))
    const { user } = setupWithMemoryRouter(<ListMaker />, {
        routerPath: `/users/Bob/recipes/${mockIngrediantList.id}`,
        routePath: "/users/:username/recipes/:id",
    })
    await screen.findByPlaceholderText(adderPlaceholderText)
    return { user }
}

describe("As all users", () => {
    const testCases: [string, (...args: any[]) => Promise<{ user: UserEvent }>][] = [
        ["User not logged in viewing the index page", setupLocalUser],
        ["User logged in viewing his own list", setupOwnerUser],
        ["User (logged in or not), viewing someone elses list", setupRestrictedUser],
    ]

    test.each(testCases)(
        "As: %s: I can check off an item on the list and it moves to the bottom with a completed appearance",
        async (label, setupFn) => {
            const { user } = await setupFn()
            expect(getListItems()).toHaveLength(3)
            await user.click(screen.getAllByRole("checkbox")[0])
            expect(getListItems()[2]).toHaveTextContent("Apples")
            expect(screen.getAllByRole("checkbox")[2]).toBeChecked()
        }
    )

    test.each(testCases)(
        "As: %s: If I check off a second item it appears above the previously checked item",
        async (label, setupFn) => {
            const { user } = await setupFn()
            expect(getListItems()).toHaveLength(3)
            await user.click(screen.getAllByRole("checkbox")[0])
            await user.click(screen.getAllByRole("checkbox")[0])
            expect(getListItems()[0]).toHaveTextContent("Orange")
            expect(getListItems()[1]).toHaveTextContent("Limes")
            expect(screen.getAllByRole("checkbox")[1]).toBeChecked()
        }
    )

    test.each(testCases)("As: %s: If I uncheck an item it stays at the bottom of the list", async (label, setupFn) => {
        const { user } = await setupFn()
        expect(getListItems()).toHaveLength(3)
        await user.click(screen.getAllByRole("checkbox")[0])
        await user.click(screen.getAllByRole("checkbox")[2])
        expect(getListItems()[2]).toHaveTextContent("Apples")
        expect(screen.getAllByRole("checkbox")[2]).not.toBeChecked()
    })

    test.each(testCases)(
        "As: %s: If I uncheck an item, that has another checked item, it appears above the other checked item",
        async (label, setupFn) => {
            const { user } = await setupFn()
            expect(getListItems()).toHaveLength(3)
            await user.click(screen.getAllByRole("checkbox")[0])
            await user.click(screen.getAllByRole("checkbox")[1])
            await user.click(screen.getAllByRole("checkbox")[2])
            expect(getListItems()[1]).toHaveTextContent("Apples")
            expect(screen.getAllByRole("checkbox")[1]).not.toBeChecked()
        }
    )

    test.each(testCases)(
        "As: %s: If I click 'Check all' it checks all the items on the list",
        async (label, setupFn) => {
            const { user } = await setupFn()
            await user.click(screen.getByRole("button", { name: /^check all/i }))
            const checkBoxes = screen.getAllByRole("checkbox")
            checkBoxes.forEach((cb) => {
                expect(cb).toBeChecked()
            })
        }
    )

    test.each(testCases)(
        "As: %s: If I click 'Uncheck all' it unchecks all the items on the list",
        async (label, setupFn) => {
            const { user } = await setupFn()
            await user.click(screen.getByRole("button", { name: /uncheck all/i }))
            const checkBoxes = screen.getAllByRole("checkbox")
            checkBoxes.forEach((cb) => {
                expect(cb).not.toBeChecked()
            })
        }
    )

    test.each(testCases)(
        "As: %s: If I change the 'Make for' amount it shows the correct ingrediant values",
        async (label, setupFn) => {
            const { user } = await setupFn()
            await user.clear(getMakeForInput())
            const inputQty = 2
            await user.type(getMakeForInput(), inputQty.toString())
            const listItems = screen.getAllByRole("listitem")
            listItems.forEach((item, i) => {
                const originalQty = mockIngrediantList!.ingrediants[i].qty
                expect(item).toHaveTextContent((originalQty * 2).toString())
            })
        }
    )

    test.each(testCases)(
        "As: %s: The 'Make for' amount is the same as the 'Serves' amount on load",
        async (label, setupFn) => {
            const expectedAmount = 8
            mockIngrediantList!.serves = expectedAmount
            const mockLocalStorage = {
                "ingrediant-list": JSON.stringify(mockIngrediantList!.serialize()),
            }
            await setupFn({ localStorage: mockLocalStorage })
            await waitFor(() => expect(getMakeForInput()).toHaveValue(expectedAmount))
        }
    )
})

describe("As users with edit privileges", () => {
    const testCases: [string, (...args: any[]) => Promise<{ user: UserEvent }>][] = [
        ["User not logged in viewing the index page", setupLocalUser],
        ["User logged in viewing his own list", setupOwnerUser],
    ]

    test.each(testCases)(
        "As: %s: I can add an ingrediant and it appears in the ingrediants list",
        async (label, setupFn) => {
            const { user } = await setupFn()
            await addItemToList(user)("3 cherries")

            expect(screen.getAllByRole("listitem")).toHaveLength(4)

            const listItems = screen.getAllByRole("listitem")
            const firstItem = listItems[0]
            expect(firstItem).toHaveTextContent("Cherries")
            expect(firstItem).toHaveTextContent("3")
            expect(screen.getByPlaceholderText(adderPlaceholderText)).toHaveValue("")
        }
    )

    test.each(testCases)("As: %s: If I enter no ingrediant name I see an error message", async (label, setupFn) => {
        const { user } = await setupFn()
        await addItemToList(user)("20")

        const errMsg = "Please enter an ingrediant name and optionally a quantity."
        await screen.findByText(errMsg)

        await addItemToList(user)("20 lemons")
        expect(screen.queryByText(errMsg)).toBeNull()
    })

    test.each(testCases)("As: %s: I can delete an item from the list", async (label, setupFn) => {
        const { user } = await setupFn()
        expect(getListItems()).toHaveLength(3)

        await user.click(screen.getAllByRole("button", { name: "delete" })[0])

        await waitFor(() => expect(getListItems()).toHaveLength(2))
        expect(getListItems()[0]).toHaveTextContent("Limes")
        expect(getListItems()[0]).toHaveTextContent("2")
    })

    test.each(testCases)("As: %s: I can enter a name for the list", async (label, setupFn) => {
        mockIngrediantList!.name = ""
        const { user } = await setupFn()
        const inputText = "My baked lasagne"
        await enterListName(user)(inputText)
        expect(getListNameInput()).toHaveValue(inputText)
    })

    test.each(testCases)("As: %s: I can enter the amount the recipe serves", async (label, setupFn) => {
        const { user } = await setupFn()
        const serveAmount = 30
        await user.clear(getServesInput())
        await user.type(getServesInput(), serveAmount.toString())
        expect(getServesInput()).toHaveValue(serveAmount)
    })

    test.each(testCases)(
        "As: %s: If I change the Serves amount, the 'Make for' quantity also changes",
        async (label, setupFn) => {
            apiIngrediantList.getSingle.mockResolvedValue(mockIngrediantList)
            const { user } = await setupFn()
            await waitFor(() => expect(getServesInput()).toHaveValue(1))
            expect(getMakeForInput()).toHaveValue(1)
            const newServesAmount = 4
            await user.clear(getServesInput())
            await user.type(getServesInput(), newServesAmount.toString())
            await waitFor(() => expect(getMakeForInput()).toHaveValue(newServesAmount))
        }
    )
})

describe("As users that get the list from the API", () => {
    const testCases = [
        ["User logged in viewing his own list", setupOwnerUser],
        ["User (logged in or not), viewing someone elses list", setupRestrictedUser],
    ]

    test.each(testCases)("As: %s: The api is called with the id of the list", async (label, setupFn) => {
        const listId = "sfd0iw02"
        setupWithMemoryRouter(<ListMaker />, {
            routerPath: `/users/John/recipes/${listId}`,
            routePath: "/users/:username/recipes/:id",
        })
        expect(apiIngrediantList.getSingle).toBeCalledWith({ id: listId })
        await waitForElementToBeRemoved(screen.queryByRole("progressbar"))
    })

    test.each(testCases)(
        "As: %s: I see a loading indicator, while it is fetching the user's list, and it's removed when finished",
        async (label, setupFn) => {
            let cb = (val?: any) => {}
            const unresolvedPromise = new Promise((resolve, reject) => {
                cb = resolve
            })
            apiIngrediantList.getAll.mockReturnValue(unresolvedPromise)
            setup(<ListMaker />)
            expect(await screen.findByRole("progressbar")).toBeInTheDocument()
            cb()
            await waitFor(() => expect(screen.queryByRole("progressbar")).not.toBeInTheDocument())
        }
    )

    test.each(testCases)("As: %s: If the list does not exist, I see a Not Found message", async (label, setupFn) => {
        apiIngrediantList.getSingle.mockResolvedValue(null)
        setup(<ListMaker />)
        const errMsg = "Not Found!"
        expect(await screen.findByText(errMsg)).toBeInTheDocument()
    })

    test.each(testCases)(
        "As: %s: If there was an error fetching the list, I see an error message",
        async (label, setupFn) => {
            apiIngrediantList.getSingle.mockRejectedValue({ response: { status: 500 } })
            setup(<ListMaker />)
            const errMsg = "Sorry, something went wrong."
            expect(await screen.findByText(errMsg)).toBeInTheDocument()
        }
    )

    test.each(testCases)("As: %s: The name of the list is displayed (if there is one)", async (label, setupFn) => {
        apiIngrediantList.getSingle.mockResolvedValue(mockIngrediantList)
        setup(<ListMaker />)
        await waitFor(() => expect(getListNameInput()).toHaveValue(mockIngrediantList!.name))
    })

    test.each(testCases)("As: %s: If there is no list name, then I see 'Unnamed List'", async (label, setupFn) => {
        mockIngrediantList!.name = ""
        apiIngrediantList.getSingle.mockResolvedValue(mockIngrediantList)
        setup(<ListMaker />)
        await waitFor(() => expect(getListNameInput()).toHaveValue("Unnamed list"))
    })

    test.each(testCases)("As: %s: If there are ingrediants I see a list of them", async (label, setupFn) => {
        mockIngrediantList!.name = ""
        apiIngrediantList.getSingle.mockResolvedValue(mockIngrediantList)
        setup(<ListMaker />)
        const listItems = await screen.findAllByRole("listitem")
        expect(listItems).toHaveLength(mockIngrediantList!.ingrediants.length)
        listItems.forEach((item, i) => {
            const ingrediantItem = mockIngrediantList!.ingrediants[i]
            expect(item).toHaveTextContent(ingrediantItem.name)
        })
    })

    test.each(testCases)(
        "As: %s: If there are no ingrediants in a list then I see a message",
        async (label, setupFn) => {
            mockIngrediantList!.ingrediants = []
            apiIngrediantList.getSingle.mockResolvedValue(mockIngrediantList)
            setup(<ListMaker />)
            const message = "No ingrediants added yet."
            expect(await screen.findByText(message)).toBeInTheDocument()
        }
    )

    test.each(testCases)("As: %s: I see the amount the recipe serves", async (label, setupFn) => {
        const servesAmount = 10
        mockIngrediantList!.serves = servesAmount
        apiIngrediantList.getSingle.mockResolvedValue(mockIngrediantList)
        setup(<ListMaker />)
        await waitFor(() => expect(getServesInput()).toHaveValue(servesAmount))
    })
})

describe("As a not logged in user viewing the index page", () => {
    test("If I reload the page the information I have entered has been saved", async () => {
        const { user, unmount, localStorage } = setup(<ListMaker useLocalView />)
        const inputText = "My baked lasagne"
        await enterListName(user)(inputText)
        await addItemToList(user)("2 limes", "3 apples")
        const servesAmount = "12"
        await user.clear(getServesInput())
        await user.type(getServesInput(), servesAmount)

        expect(getListNameInput()).toHaveValue(inputText)
        expect(getListItems()).toHaveLength(2)

        unmount()
        setup(<ListMaker useLocalView />, { localStorage })

        expect(getListNameInput()).toHaveValue(inputText)
        expect(getListItems()).toHaveLength(2)
        expect(getServesInput()).toHaveValue(Number(servesAmount))
    })

    test("If I click the Publish button, I will be taken to the signup page if I am not logged in", async () => {
        const { user } = setup(<ListMaker useLocalView />)
        const inputText = "My baked lasagne"
        await enterListName(user)(inputText)
        await addItemToList(user)("2 limes", "3 apples")
        await user.click(screen.getByRole("button", { name: /publish/i }))
        const route = mockedUseNavigate.mock.calls[0][0]
        expect(route).toEqual("/signup")
    })
})

describe("As a user, viewing a another user's list", () => {
    test("I do not see edit functions", async () => {
        apiIngrediantList.getSingle.mockResolvedValue(mockIngrediantList)
        setup(<ListMaker />)
        expect(await screen.findByRole("textbox")).toBeDisabled()
        expect(screen.queryByPlaceholderText(adderPlaceholderText)).not.toBeInTheDocument()
        expect(screen.queryByRole("button", { name: "delete" })).not.toBeInTheDocument()
        expect(getServesInput()).toBeDisabled()
        await waitFor(() => expect(screen.queryByRole("progressbar")).not.toBeInTheDocument())
    })
})

describe("As a signed in user, viewing my own list", () => {
    const username = "Bob"
    beforeEach(() => {
        mockIngrediantList!.authorId = username
        apiIngrediantList.getSingle.mockResolvedValue(mockIngrediantList)
        const mockUser = new User({ username: username, email: "johnsemail@somehting.com" })
        useAuthMock.mockReturnValue(createUseAuthMockReturnValue(mockUser))
    })

    test("I see edit functions", async () => {
        setupWithMemoryRouter(<ListMaker />, {
            routerPath: `/users/Bob/recipes/${mockIngrediantList!.id}`,
            routePath: "/users/:username/recipes/:id",
        })
        expect(await screen.findByPlaceholderText(adderPlaceholderText)).toBeEnabled()
        expect(screen.getByPlaceholderText(adderPlaceholderText)).toBeInTheDocument()
        expect(within(screen.getAllByRole("listitem")[0]).getByRole("button", { name: "delete" })).toBeInTheDocument()
    })

    test("If I change the name the API is called with the updated list", async () => {
        mockIngrediantList!.name = ""
        const { user } = setupWithMemoryRouter(<ListMaker />, {
            routerPath: `/users/Bob/recipes/${mockIngrediantList!.id}`,
            routePath: "/users/:username/recipes/:id",
        })
        const newName = "New list name"
        await user.type(await screen.findByPlaceholderText(listNamePlaceHolderText), newName)
        expect(await screen.findByText("Saving", { exact: false })).toBeInTheDocument()
        const mockCalls = apiIngrediantList.patch.mock.calls
        const lastCall = mockCalls[mockCalls.length - 1][0]
        expect(lastCall.name).toEqual(newName)
        expect(await screen.findByText("Saved")).toBeInTheDocument()
    })

    test("If I add an item the API is called with the updated list", async () => {
        const { user } = setupWithMemoryRouter(<ListMaker />, {
            routerPath: `/users/Bob/recipes/${mockIngrediantList!.id}`,
            routePath: "/users/:username/recipes/:id",
        })
        await addItemToList(user)("2 pears")
        expect(await screen.findByText("Saving", { exact: false })).toBeInTheDocument()
        const mockCalls = apiIngrediantList.patch.mock.calls
        const lastCall = mockCalls[mockCalls.length - 1][0]
        const addedIngrediant = lastCall.ingrediants[0]
        expect(addedIngrediant.name).toEqual("Pears")
        expect(addedIngrediant.qty.toString()).toEqual("2")
        expect(await screen.findByText("Saved")).toBeInTheDocument()
    })

    test("If I delete an item the API is called with the updated list", async () => {
        const { user } = setupWithMemoryRouter(<ListMaker />, {
            routerPath: `/users/Bob/recipes/${mockIngrediantList!.id}`,
            routePath: "/users/:username/recipes/:id",
        })
        const deleteButtons = await screen.findAllByRole("button", { name: "delete" })
        await user.click(deleteButtons[0])
        expect(await screen.findByText("Saving", { exact: false })).toBeInTheDocument()
        const mockCalls = apiIngrediantList.patch.mock.calls
        const lastCall = mockCalls[mockCalls.length - 1][0]
        expect(lastCall.ingrediants.length).toEqual(2)
        expect(lastCall.ingrediants[0].name).toEqual("Limes")
        expect(lastCall.ingrediants[0].qty.toString()).toEqual("2")
        expect(await screen.findByText("Saved")).toBeInTheDocument()
    })

    test("If I check an item the API is called with the updated list", async () => {
        const { user } = setupWithMemoryRouter(<ListMaker />, {
            routerPath: `/users/Bob/recipes/${mockIngrediantList!.id}`,
            routePath: "/users/:username/recipes/:id",
        })
        const checkBoxes = await screen.findAllByRole("checkbox")
        await user.click(checkBoxes[0])
        expect(await screen.findByText("Saving", { exact: false })).toBeInTheDocument()
        const mockCalls = apiIngrediantList.patch.mock.calls
        const lastCall = mockCalls[mockCalls.length - 1][0]
        const lastIngrediant = lastCall.ingrediants[lastCall.ingrediants.length - 1]
        expect(lastIngrediant.checked).toEqual(true)
        expect(await screen.findByText("Saved")).toBeInTheDocument()
    })

    test("If there is an error saving the list, I should see an error message", async () => {
        apiIngrediantList.patch.mockRejectedValue({ response: { status: 500 } })
        const { user } = setupWithMemoryRouter(<ListMaker />, {
            routerPath: `/users/Bob/recipes/${mockIngrediantList!.id}`,
            routePath: "/users/:username/recipes/:id",
        })
        const checkBoxes = await screen.findAllByRole("checkbox")
        await user.click(checkBoxes[0])
        expect(await screen.findByText("Error saving")).toBeInTheDocument()
    })

    test("If I click the delete button, the API is called to delete the list, then I am redirected", async () => {
        const { user } = setupWithMemoryRouter(<ListMaker />, {
            routerPath: `/users/Bob/recipes/${mockIngrediantList!.id}`,
            routePath: "/users/:username/recipes/:id",
        })
        const deleteListButton = await screen.findByLabelText("delete list")

        await user.click(deleteListButton)
        expect(await screen.findByText("Are you sure you want to delete this list?")).toBeInTheDocument()

        const confirmDeleteButton = screen.getByRole("button", { name: /delete/i })
        await user.click(confirmDeleteButton)

        expect(await within(confirmDeleteButton).findByRole("progressbar")).toBeInTheDocument()
        expect(apiIngrediantList.remove).toBeCalledWith(mockIngrediantList!.id)
        const route = mockedUseNavigate.mock.calls[0][0]
        await waitFor(() => expect(route).toEqual("/"))
    })

    test("If there is an error deleting the list, I see an error message", async () => {
        const { user } = setupWithMemoryRouter(<ListMaker />, {
            routerPath: `/users/Bob/recipes/${mockIngrediantList!.id}`,
            routePath: "/users/:username/recipes/:id",
        })
        apiIngrediantList.remove.mockRejectedValue({ response: { status: 500 } })
        const deleteListButton = await screen.findByLabelText("delete list")

        await user.click(deleteListButton)
        expect(await screen.findByText("Are you sure you want to delete this list?")).toBeInTheDocument()

        const confirmDeleteButton = screen.getByRole("button", { name: /delete/i })
        await user.click(confirmDeleteButton)

        expect(await within(confirmDeleteButton).findByRole("progressbar")).toBeInTheDocument()
        expect(await screen.findByText("Sorry something went wrong.")).toBeInTheDocument()
        expect(within(confirmDeleteButton).queryByRole("progressbar")).not.toBeInTheDocument()
    })

    test("If I click 'Check all' it checks all the items and  the API is called", async () => {
        const { user } = setupWithMemoryRouter(<ListMaker />, {
            routerPath: `/users/Bob/recipes/${mockIngrediantList!.id}`,
            routePath: "/users/:username/recipes/:id",
        })
        await user.click(await screen.findByRole("button", { name: /^check all/i }))
        await waitFor(() => expect(apiIngrediantList.patch).toBeCalled())
        const mockCalls = apiIngrediantList.patch.mock.calls
        const lastCall = mockCalls[mockCalls.length - 1][0]
        lastCall.ingrediants.forEach((i: Ingrediant) => {
            expect(i.checked).toEqual(true)
        })
    })

    test("If I click 'Uncheck all' it checks all the items and  the API is called", async () => {
        mockIngrediantList!.ingrediants.forEach((i) => (i.checked = true))
        const { user } = setupWithMemoryRouter(<ListMaker />, {
            routerPath: `/users/Bob/recipes/${mockIngrediantList!.id}`,
            routePath: "/users/:username/recipes/:id",
        })
        await user.click(await screen.findByRole("button", { name: /uncheck all/i }))
        await waitFor(() => expect(apiIngrediantList.patch).toBeCalled())
        const mockCalls = apiIngrediantList.patch.mock.calls
        const lastCall = mockCalls[mockCalls.length - 1][0]
        lastCall.ingrediants.forEach((i: Ingrediant) => {
            expect(i.checked).toEqual(false)
        })
    })

    test("If I change the Serves amount the API is called", async () => {
        mockIngrediantList!.ingrediants.forEach((i) => (i.checked = true))
        const { user } = setupWithMemoryRouter(<ListMaker />, {
            routerPath: `/users/Bob/recipes/${mockIngrediantList!.id}`,
            routePath: "/users/:username/recipes/:id",
        })
        const servesAmount = "12"
        await user.clear(await screen.findByRole("spinbutton", { name: /serves/i }))
        await user.type(screen.getByRole("spinbutton", { name: /serves/i }), servesAmount)
        await waitFor(() => expect(apiIngrediantList.patch).toBeCalled())
        const mockCalls = apiIngrediantList.patch.mock.calls
        const lastCall = mockCalls[mockCalls.length - 1][0]
        expect(lastCall.serves.toString()).toEqual(servesAmount)
    })
})
