import { prettyDOM, screen, waitFor, waitForElementToBeRemoved, within } from "@testing-library/react"
import debounce from "lodash/debounce"
import axios from "axios"

import setup, { SetupOptions, setupWithMemoryRouter } from "../testHelpers"
import ListMaker from "./ListMaker"
import { useAuth } from "../hooks/auth"
import apiRecipe from "../api/Recipe"
import apiImage from "../api/Image"
import ModeRecipe from "../models/Recipe"
import ModelIngrediant from "../models/Ingrediant"
import Qty from "../lib/qty"
import { UserEvent } from "@testing-library/user-event/dist/types/setup"
import User from "../models/User"
import Ingrediant from "../models/Ingrediant"
import Image from "../models/Image"

jest.mock("../hooks/auth")
jest.mock("../api/Recipe")
jest.mock("../api/Image")
jest.mock("lodash/debounce")
jest.mock("axios")

const apiImageMock = apiImage as jest.Mocked<typeof apiImage>
const apiRecipeMock = apiRecipe as jest.Mocked<typeof apiRecipe>
const useAuthMock = useAuth as jest.Mock<ReturnType<typeof useAuth>>
const debounceMock = debounce as jest.Mock<ReturnType<typeof debounce>>
const axiosMock = axios as jest.Mocked<typeof axios>

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

let mockRecipe: ModeRecipe
const mockRecipeAuthor = "John"

beforeEach(() => {
    debounceMock.mockImplementation((fn) => fn)
    useAuthMock.mockReturnValue(createUseAuthMockReturnValue())
    mockRecipe = new ModeRecipe({
        id: "cxd24fa",
        name: "My Ingrediant List",
        authorId: mockRecipeAuthor,
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
    apiRecipeMock.getSingle.mockResolvedValue(mockRecipe)
}

const setupOwnerUser = async () => {
    setupApiUsers()
    const mockUser = new User({ username: mockRecipeAuthor, email: "johnsemail@somehting.com" })
    useAuthMock.mockReturnValue(createUseAuthMockReturnValue(mockUser))
    const { user } = setup(<ListMaker />)
    await screen.findByPlaceholderText(adderPlaceholderText)
    return { user }
}

const setupRestrictedUser = async () => {
    setupApiUsers()
    const mockUser = new User({ username: "Bob", email: "johnsemail@somehting.com" })
    useAuthMock.mockReturnValue(createUseAuthMockReturnValue(mockUser))
    const { user } = setupWithMemoryRouter(<ListMaker />, {
        routerPath: `/users/Bob/recipes/${mockRecipe.id}`,
        routePath: "/users/:username/recipes/:id",
    })
    await screen.findByPlaceholderText(listNamePlaceHolderText)
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
                const originalQty = mockRecipe.ingrediants[i].qty
                expect(item).toHaveTextContent((originalQty * 2).toString())
            })
        }
    )

    test.each(testCases)(
        "As: %s: The 'Make for' amount is the same as the 'Serves' amount on load",
        async (label, setupFn) => {
            const expectedAmount = 8
            mockRecipe.serves = expectedAmount
            const mockLocalStorage = {
                recipe: JSON.stringify(mockRecipe.serialize()),
            }
            await setupFn({ localStorage: mockLocalStorage })
            await waitFor(() => expect(getMakeForInput()).toHaveValue(expectedAmount))
        }
    )

    test.each(testCases)("As: %s: If there is an image it's displayed", async (label, setupFn) => {
        const imageName = "test-image.png"
        mockRecipe.imageUrl = imageName
        const mockLocalStorage = {
            recipe: JSON.stringify(mockRecipe.serialize()),
        }
        await setupFn({ localStorage: mockLocalStorage })
        const imageBox = screen.getByLabelText("Image box")
        const imageElem = within(imageBox).getByRole("img")
        expect(imageElem).toHaveStyle(`background: url(${imageName})`)
    })

    test.each(testCases)("As: %s: If there is a description it's displayed", async (label, setupFn) => {
        const descriptionText = "A sample description"
        mockRecipe.description = descriptionText
        const mockLocalStorage = {
            recipe: JSON.stringify(mockRecipe.serialize()),
        }
        await setupFn({ localStorage: mockLocalStorage })
        expect(screen.getByPlaceholderText("Enter a description...")).toHaveValue(descriptionText)
    })
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
        mockRecipe.name = ""
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
            apiRecipeMock.getSingle.mockResolvedValue(mockRecipe)
            const { user } = await setupFn()
            await waitFor(() => expect(getServesInput()).toHaveValue(1))
            expect(getMakeForInput()).toHaveValue(1)
            const newServesAmount = 4
            await user.clear(getServesInput())
            await user.type(getServesInput(), newServesAmount.toString())
            await waitFor(() => expect(getMakeForInput()).toHaveValue(newServesAmount))
        }
    )

    test.each(testCases)(
        "As: %s: If click '+ Image' button, the image file input is triggered",
        async (label, setupFn) => {
            const { user } = await setupFn()
            const fileInputElem = screen.getByTestId("uploadImage")
            const eventHandler = jest.fn()
            fileInputElem.addEventListener("click", eventHandler)
            await user.click(screen.getByLabelText("Add image"))
            expect(eventHandler).toBeCalledTimes(1)
        }
    )

    test.each(testCases)(
        "As: %s: If I upload an image, I should see a loading icon and then the image",
        async (label, setupFn) => {
            let cb: any = () => {}
            apiImageMock.upload.mockImplementation(() => {
                return new Promise((resolve, reject) => {
                    cb = resolve
                })
            })
            const { user } = await setupFn()
            const fileInputElem = screen.getByTestId("uploadImage")
            const testFile = new File(["hello"], "hello.png", { type: "image/png" })
            await user.upload(fileInputElem, testFile)
            const imageBox = await screen.findByLabelText("Image box")
            expect(within(imageBox).getByRole("progressbar")).toBeInTheDocument()
            const imageUrl = "url/test.png"
            const image = new Image({ url: imageUrl })
            cb(image)
            await waitForElementToBeRemoved(() => within(imageBox).queryByRole("progressbar"))
            await waitFor(() => {
                const img = within(imageBox).getByRole("img")
                expect(img).toHaveStyle(`background: url(${imageUrl})`)
            })
        }
    )

    test.each(testCases)("As: %s: If there is an image, I don't see the '+ Image' link", async (label, setupFn) => {
        const imageName = "test-image.png"
        mockRecipe.imageUrl = imageName
        const mockLocalStorage = {
            recipe: JSON.stringify(mockRecipe.serialize()),
        }
        await setupFn({ localStorage: mockLocalStorage })
        expect(screen.queryByLabelText("Add image")).not.toBeInTheDocument()
    })

    test.each(testCases)(
        "As: %s: If I upload an image, and it fails, I see an error message",
        async (label, setupFn) => {
            axiosMock.isAxiosError.mockImplementation(() => true)
            const err = {
                response: {
                    status: 500,
                },
            }
            apiImageMock.upload.mockImplementation(() => Promise.reject(err))
            const { user } = await setupFn()
            const fileInputElem = screen.getByTestId("uploadImage")
            const testFile = new File(["hello"], "hello.png", { type: "image/png" })
            user.upload(fileInputElem, testFile)
            await waitFor(() => expect(screen.getByText("Sorry something went wrong.")))
        }
    )

    test.each(testCases)(
        "As: %s: If I click the delete icon over the image, the image is removed, and the '+ Image' link is re-displayed",
        async (label, setupFn) => {
            const imageName = "test-image.png"
            mockRecipe.imageUrl = imageName
            const mockLocalStorage = {
                recipe: JSON.stringify(mockRecipe.serialize()),
            }
            const { user } = await setupFn({ localStorage: mockLocalStorage })
            const button = screen.getByRole("button", {
                name: /delete image/i,
            })
            await user.click(button)
            await waitFor(() => expect(screen.queryByLabelText("Image box")).not.toBeInTheDocument())
        }
    )

    test.each(testCases)(
        "As: %s: If click '+ Description' button, the description input is displayed, and the button is removed",
        async (label, setupFn) => {
            const { user } = await setupFn()
            await user.click(screen.getByLabelText("Add description"))
            expect(screen.getByPlaceholderText("Enter a description...")).toBeInTheDocument()
            await waitFor(() => expect(screen.queryByLabelText("Add description")).not.toBeInTheDocument())
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
        expect(apiRecipeMock.getSingle).toBeCalledWith({ id: listId })
        await waitForElementToBeRemoved(screen.queryByRole("progressbar"))
    })

    test.each(testCases)(
        "As: %s: I see a loading indicator, while it is fetching the user's list, and it's removed when finished",
        async (label, setupFn) => {
            let cb = (val?: any) => {}
            const unresolvedPromise = new Promise<any[]>((resolve, reject) => {
                cb = resolve
            })
            apiRecipeMock.getAll.mockReturnValue(unresolvedPromise)
            setup(<ListMaker />)
            expect(await screen.findByRole("progressbar")).toBeInTheDocument()
            cb()
            await waitFor(() => expect(screen.queryByRole("progressbar")).not.toBeInTheDocument())
        }
    )

    test.each(testCases)("As: %s: If the list does not exist, I see a Not Found message", async (label, setupFn) => {
        apiRecipeMock.getSingle.mockResolvedValue(null)
        setup(<ListMaker />)
        const errMsg = "Not Found!"
        expect(await screen.findByText(errMsg)).toBeInTheDocument()
    })

    test.each(testCases)(
        "As: %s: If there was an error fetching the list, I see an error message",
        async (label, setupFn) => {
            apiRecipeMock.getSingle.mockRejectedValue({ response: { status: 500 } })
            setup(<ListMaker />)
            const errMsg = "Sorry, something went wrong."
            expect(await screen.findByText(errMsg)).toBeInTheDocument()
        }
    )

    test.each(testCases)("As: %s: The name of the list is displayed (if there is one)", async (label, setupFn) => {
        apiRecipeMock.getSingle.mockResolvedValue(mockRecipe)
        setup(<ListMaker />)
        await waitFor(() => expect(getListNameInput()).toHaveValue(mockRecipe.name))
    })

    test.each(testCases)("As: %s: If there is no list name, then I see 'Unnamed List'", async (label, setupFn) => {
        mockRecipe.name = ""
        apiRecipeMock.getSingle.mockResolvedValue(mockRecipe)
        setup(<ListMaker />)
        await waitFor(() => expect(getListNameInput()).toHaveValue("Unnamed list"))
    })

    test.each(testCases)("As: %s: If there are ingrediants I see a list of them", async (label, setupFn) => {
        mockRecipe.name = ""
        apiRecipeMock.getSingle.mockResolvedValue(mockRecipe)
        setup(<ListMaker />)
        const listItems = await screen.findAllByRole("listitem")
        expect(listItems).toHaveLength(mockRecipe.ingrediants.length)
        listItems.forEach((item, i) => {
            const ingrediantItem = mockRecipe.ingrediants[i]
            expect(item).toHaveTextContent(ingrediantItem.name)
        })
    })

    test.each(testCases)(
        "As: %s: If there are no ingrediants in a list then I see a message",
        async (label, setupFn) => {
            mockRecipe.ingrediants = []
            apiRecipeMock.getSingle.mockResolvedValue(mockRecipe)
            setup(<ListMaker />)
            const message = "No ingrediants added yet."
            expect(await screen.findByText(message)).toBeInTheDocument()
        }
    )

    test.each(testCases)("As: %s: I see the amount the recipe serves", async (label, setupFn) => {
        const servesAmount = 10
        mockRecipe.serves = servesAmount
        apiRecipeMock.getSingle.mockResolvedValue(mockRecipe)
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

        const imageUrl = "https://test.com/hello.png"
        const image = new Image({ url: imageUrl })
        apiImageMock.upload.mockImplementation(() => Promise.resolve(image))
        const fileInputElem = screen.getByTestId("uploadImage")
        const testFile = new File(["hello"], imageUrl, { type: "image/png" })
        user.upload(fileInputElem, testFile)
        await waitFor(() => {
            const imageBox = screen.getByLabelText("Image box")
            const img = within(imageBox).getByRole("img")
            expect(img).toHaveStyle(`background: url(${imageUrl})`)
        })

        await user.click(screen.getByLabelText("Add description"))
        const descriptionBox = await screen.findByPlaceholderText("Enter a description...")
        const descriptionText = "My description"
        await user.type(descriptionBox, descriptionText)

        unmount()
        setup(<ListMaker useLocalView />, { localStorage })

        expect(getListNameInput()).toHaveValue(inputText)
        expect(getListItems()).toHaveLength(2)
        expect(getServesInput()).toHaveValue(Number(servesAmount))

        const imageBox = screen.getByLabelText("Image box")
        const img = within(imageBox).getByRole("img")
        expect(img).toHaveStyle(`background: url(${imageUrl})`)

        const descriptionBoxWithText = screen.getByPlaceholderText("Enter a description...")
        expect(descriptionBoxWithText).toHaveValue(descriptionText)
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
        apiRecipeMock.getSingle.mockResolvedValue(mockRecipe)
        setup(<ListMaker />)
        expect(await screen.findByRole("textbox")).toBeDisabled()
        expect(screen.queryByPlaceholderText(adderPlaceholderText)).not.toBeInTheDocument()
        expect(screen.queryByRole("button", { name: "delete" })).not.toBeInTheDocument()
        expect(getServesInput()).toBeDisabled()
        expect(screen.queryByLabelText("Add image")).not.toBeInTheDocument()
        expect(screen.queryByLabelText("Add description")).not.toBeInTheDocument()
        await waitFor(() => expect(screen.queryByRole("progressbar")).not.toBeInTheDocument())
    })

    test("If the list has an image, I don't see the delete button", async () => {
        mockRecipe.imageUrl = "test.png"
        apiRecipeMock.getSingle.mockResolvedValue(mockRecipe)
        setup(<ListMaker />)
        await waitFor(() => expect(screen.queryByRole("progressbar")).not.toBeInTheDocument())
        expect(screen.queryByRole("button", { name: /delete image/i })).not.toBeInTheDocument()
    })

    test("If the recipe from the API has ingrediants checked, I see them unchecked", async () => {
        mockRecipe.ingrediants.forEach((i) => (i.checked = true))
        apiRecipeMock.getSingle.mockResolvedValue(mockRecipe)
        setup(<ListMaker />)
        const listItems = await screen.findAllByRole("listitem")
        listItems.forEach((item) => {
            expect(within(item).getByRole("checkbox")).not.toBeChecked()
        })
    })

    test("If I check an ingrediant and then reload the page, I see the item is checked", async () => {
        mockRecipe.ingrediants.forEach((i) => (i.checked = false))
        apiRecipeMock.getSingle.mockResolvedValue(mockRecipe)
        const { user, localStorage, unmount } = setup(<ListMaker />)
        const checkBoxes = await screen.findAllByRole("checkbox")
        await user.click(checkBoxes[0])
        unmount()
        setup(<ListMaker />, { localStorage })
        const newCheckBoxes = await screen.findAllByRole("checkbox")
        expect(newCheckBoxes[newCheckBoxes.length - 1]).toBeChecked()
    })

    test("If the list from the API has changed, after having previously loaded the list, my changes are merged", async () => {
        mockRecipe.ingrediants.forEach((i) => (i.checked = false))
        apiRecipeMock.getSingle.mockResolvedValue(mockRecipe)
        const { user, localStorage, unmount } = setup(<ListMaker />)
        const listItems = await screen.findAllByRole("listitem")
        const firstListItem = listItems[0]
        await user.click(within(firstListItem).getByRole("checkbox"))
        expect(getListNameInput()).toHaveValue(mockRecipe.name)
        unmount()
        const newMockedRecipe = Object.assign(Object.create(Object.getPrototypeOf(mockRecipe)), mockRecipe)
        newMockedRecipe.name = "My new name"
        const newItem = new Ingrediant({
            id: "123",
            name: "pudding",
            qty: new Qty("20g"),
            checked: false,
        })
        const removedItem = newMockedRecipe.ingrediants.pop()
        newMockedRecipe.ingrediants = [newItem, ...newMockedRecipe.ingrediants]
        apiRecipeMock.getSingle.mockResolvedValue(newMockedRecipe)
        setup(<ListMaker />, { localStorage })
        const newListItems = await screen.findAllByRole("listitem")
        expect(getListNameInput()).toHaveValue(newMockedRecipe.name)
        expect(newListItems[0]).toHaveTextContent(newItem.name)
        expect(newListItems[2].textContent).toEqual(firstListItem.textContent)
        expect(within(newListItems[2]).getByRole("checkbox")).toBeChecked()
        expect(screen.queryByText(removedItem.name)).not.toBeInTheDocument()
    })
})

describe("As a signed in user, viewing my own list", () => {
    const username = "Bob"
    beforeEach(() => {
        mockRecipe.authorId = username
        apiRecipeMock.getSingle.mockResolvedValue(mockRecipe)
        const mockUser = new User({ username: username, email: "johnsemail@somehting.com" })
        useAuthMock.mockReturnValue(createUseAuthMockReturnValue(mockUser))
    })

    test("I see edit functions", async () => {
        setupWithMemoryRouter(<ListMaker />, {
            routerPath: `/users/Bob/recipes/${mockRecipe.id}`,
            routePath: "/users/:username/recipes/:id",
        })
        expect(await screen.findByPlaceholderText(adderPlaceholderText)).toBeEnabled()
        expect(screen.getByPlaceholderText(adderPlaceholderText)).toBeInTheDocument()
        expect(within(screen.getAllByRole("listitem")[0]).getByRole("button", { name: "delete" })).toBeInTheDocument()
    })

    test("If I change the name the API is called with the updated list", async () => {
        mockRecipe.name = ""
        const { user } = setupWithMemoryRouter(<ListMaker />, {
            routerPath: `/users/Bob/recipes/${mockRecipe.id}`,
            routePath: "/users/:username/recipes/:id",
        })
        const newName = "New list name"
        await user.type(await screen.findByPlaceholderText(listNamePlaceHolderText), newName)
        expect(await screen.findByText("Saving", { exact: false })).toBeInTheDocument()
        const mockCalls = apiRecipeMock.patch.mock.calls
        const lastCall = mockCalls[mockCalls.length - 1][0]
        expect(lastCall.name).toEqual(newName)
        expect(await screen.findByText("Saved")).toBeInTheDocument()
    })

    test("If I add an item the API is called with the updated list", async () => {
        const { user } = setupWithMemoryRouter(<ListMaker />, {
            routerPath: `/users/Bob/recipes/${mockRecipe.id}`,
            routePath: "/users/:username/recipes/:id",
        })
        await addItemToList(user)("2 pears")
        expect(await screen.findByText("Saving", { exact: false })).toBeInTheDocument()
        const mockCalls = apiRecipeMock.patch.mock.calls
        const lastCall = mockCalls[mockCalls.length - 1][0]
        const addedIngrediant = lastCall.ingrediants[0]
        expect(addedIngrediant.name).toEqual("Pears")
        expect(addedIngrediant.qty.toString()).toEqual("2")
        expect(await screen.findByText("Saved")).toBeInTheDocument()
    })

    test("If I delete an item the API is called with the updated list", async () => {
        const { user } = setupWithMemoryRouter(<ListMaker />, {
            routerPath: `/users/Bob/recipes/${mockRecipe.id}`,
            routePath: "/users/:username/recipes/:id",
        })
        const deleteButtons = await screen.findAllByRole("button", { name: "delete" })
        await user.click(deleteButtons[0])
        expect(await screen.findByText("Saving", { exact: false })).toBeInTheDocument()
        const mockCalls = apiRecipeMock.patch.mock.calls
        const lastCall = mockCalls[mockCalls.length - 1][0]
        expect(lastCall.ingrediants.length).toEqual(2)
        expect(lastCall.ingrediants[0].name).toEqual("Limes")
        expect(lastCall.ingrediants[0].qty.toString()).toEqual("2")
        expect(await screen.findByText("Saved")).toBeInTheDocument()
    })

    test("If I check an item the API is called with the updated list", async () => {
        const { user } = setupWithMemoryRouter(<ListMaker />, {
            routerPath: `/users/Bob/recipes/${mockRecipe.id}`,
            routePath: "/users/:username/recipes/:id",
        })
        const checkBoxes = await screen.findAllByRole("checkbox")
        await user.click(checkBoxes[0])
        expect(await screen.findByText("Saving", { exact: false })).toBeInTheDocument()
        const mockCalls = apiRecipeMock.patch.mock.calls
        const lastCall = mockCalls[mockCalls.length - 1][0]
        const lastIngrediant = lastCall.ingrediants[lastCall.ingrediants.length - 1]
        expect(lastIngrediant.checked).toEqual(true)
        expect(await screen.findByText("Saved")).toBeInTheDocument()
    })

    test("If there is an error saving the list, I should see an error message", async () => {
        apiRecipeMock.patch.mockRejectedValue({ response: { status: 500 } })
        const { user } = setupWithMemoryRouter(<ListMaker />, {
            routerPath: `/users/Bob/recipes/${mockRecipe.id}`,
            routePath: "/users/:username/recipes/:id",
        })
        const checkBoxes = await screen.findAllByRole("checkbox")
        await user.click(checkBoxes[0])
        expect(await screen.findByText("Error saving")).toBeInTheDocument()
    })

    test("If I click the delete button, the API is called to delete the list, then I am redirected", async () => {
        const { user } = setupWithMemoryRouter(<ListMaker />, {
            routerPath: `/users/Bob/recipes/${mockRecipe.id}`,
            routePath: "/users/:username/recipes/:id",
        })
        const deleteListButton = await screen.findByLabelText("delete list")

        await user.click(deleteListButton)
        expect(await screen.findByText("Are you sure you want to delete this list?")).toBeInTheDocument()

        const confirmDeleteButton = screen.getByRole("button", { name: /delete/i })
        await user.click(confirmDeleteButton)

        expect(await within(confirmDeleteButton).findByRole("progressbar")).toBeInTheDocument()
        expect(apiRecipeMock.remove).toBeCalledWith(mockRecipe.id)
        const route = mockedUseNavigate.mock.calls[0][0]
        await waitFor(() => expect(route).toEqual("/"))
    })

    test("If there is an error deleting the list, I see an error message", async () => {
        const { user } = setupWithMemoryRouter(<ListMaker />, {
            routerPath: `/users/Bob/recipes/${mockRecipe.id}`,
            routePath: "/users/:username/recipes/:id",
        })
        apiRecipeMock.remove.mockRejectedValue({ response: { status: 500 } })
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
            routerPath: `/users/Bob/recipes/${mockRecipe.id}`,
            routePath: "/users/:username/recipes/:id",
        })
        await user.click(await screen.findByRole("button", { name: /^check all/i }))
        await waitFor(() => expect(apiRecipeMock.patch).toBeCalled())
        const mockCalls = apiRecipeMock.patch.mock.calls
        const lastCall = mockCalls[mockCalls.length - 1][0]
        lastCall.ingrediants.forEach((i: Ingrediant) => {
            expect(i.checked).toEqual(true)
        })
    })

    test("If I click 'Uncheck all' it checks all the items and  the API is called", async () => {
        mockRecipe.ingrediants.forEach((i) => (i.checked = true))
        const { user } = setupWithMemoryRouter(<ListMaker />, {
            routerPath: `/users/Bob/recipes/${mockRecipe.id}`,
            routePath: "/users/:username/recipes/:id",
        })
        await user.click(await screen.findByRole("button", { name: /uncheck all/i }))
        await waitFor(() => expect(apiRecipeMock.patch).toBeCalled())
        const mockCalls = apiRecipeMock.patch.mock.calls
        const lastCall = mockCalls[mockCalls.length - 1][0]
        lastCall.ingrediants.forEach((i: Ingrediant) => {
            expect(i.checked).toEqual(false)
        })
    })

    test("If I change the Serves amount the API is called", async () => {
        mockRecipe.ingrediants.forEach((i) => (i.checked = true))
        const { user } = setupWithMemoryRouter(<ListMaker />, {
            routerPath: `/users/Bob/recipes/${mockRecipe.id}`,
            routePath: "/users/:username/recipes/:id",
        })
        const servesAmount = "12"
        await user.clear(await screen.findByRole("spinbutton", { name: /serves/i }))
        await user.type(screen.getByRole("spinbutton", { name: /serves/i }), servesAmount)
        await waitFor(() => expect(apiRecipeMock.patch).toBeCalled())
        const mockCalls = apiRecipeMock.patch.mock.calls
        const lastCall = mockCalls[mockCalls.length - 1][0]
        expect(lastCall.serves.toString()).toEqual(servesAmount)
    })

    test("If I upload an image, and it succeeds, the API is called with an updated list", async () => {
        const image = new Image({ url: "url/test.png" })
        apiImageMock.upload.mockImplementation(() => Promise.resolve(image))
        const { user } = setupWithMemoryRouter(<ListMaker />, {
            routerPath: `/users/Bob/recipes/${mockRecipe.id}`,
            routePath: "/users/:username/recipes/:id",
        })
        const fileInputElem = await screen.findByTestId("uploadImage")
        const testFile = new File(["hello"], "hello.png", { type: "image/png" })
        await user.upload(fileInputElem, testFile)
        const imageBox = await screen.findByLabelText("Image box")
        expect(within(imageBox).getByRole("progressbar")).toBeInTheDocument()
        const call = apiRecipeMock.patch.mock.calls[0][0]
        await waitFor(() => expect(call.imageUrl).toEqual(image.url))
    })

    test("If I enter text into the description box, the API is called with an updated list", async () => {
        const { user } = setupWithMemoryRouter(<ListMaker />, {
            routerPath: `/users/Bob/recipes/${mockRecipe.id}`,
            routePath: "/users/:username/recipes/:id",
        })
        await user.click(await screen.findByLabelText("Add description"))
        const descriptionBox = screen.getByPlaceholderText("Enter a description...")
        const text = "My description"
        await user.type(descriptionBox, text)
        const mockCalls = apiRecipeMock.patch.mock.calls
        const lastCall = mockCalls[mockCalls.length - 1][0]
        await waitFor(() => expect(lastCall.description).toEqual(text))
    })
})
