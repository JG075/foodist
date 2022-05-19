import { screen, waitFor, waitForElementToBeRemoved, within } from "@testing-library/react"
import axios from "axios"

import setup, { queryFactory, SetupOptions, setupWithMemoryRouter } from "../testHelpers"
import Recipe from "./Recipe"
import apiRecipe from "../api/Recipe"
import apiImage from "../api/Image"
import ModeRecipe from "../models/Recipe"
import ModelIngrediant from "../models/Ingrediant"
import Qty from "../lib/qty"
import { UserEvent } from "@testing-library/user-event/dist/types/setup"
import User from "../models/User"
import Ingrediant from "../models/Ingrediant"
import Image from "../models/Image"
import { useAuth } from "../hooks/auth"

jest.mock("../hooks/auth")
jest.mock("../api/Recipe")
jest.mock("../api/Image")
jest.mock("axios")

const apiImageMock = apiImage as jest.Mocked<typeof apiImage>
const apiRecipeMock = apiRecipe as jest.Mocked<typeof apiRecipe>
const useAuthMock = useAuth as jest.Mock<Partial<ReturnType<typeof useAuth>>>
const axiosMock = axios as jest.Mocked<typeof axios>

const mockedUseNavigate = jest.fn()
jest.mock("react-router-dom", () => {
    const originalModule = jest.requireActual("react-router-dom")
    return {
        __esModule: true,
        ...originalModule,
        useNavigate: () => mockedUseNavigate,
    }
})

const listItem = queryFactory({ matcher: "Role" }, "listitem")
const listItemDeleteButton = queryFactory({ matcher: "Role" }, "button", { name: "delete" })
const nameInput = queryFactory({ matcher: "PlaceholderText" }, "Give your recipe a name")
const servesInput = queryFactory({ matcher: "Role" }, "spinbutton", { name: /serves/i })
const makeForInput = queryFactory({ matcher: "Role" }, "spinbutton", { name: /make for/i })
const adderInput = queryFactory(
    { matcher: "PlaceholderText" },
    "Enter an ingrediant and quantity e.g. 2 lemons, mozzarella 50g"
)
const checkbox = queryFactory({ matcher: "Role" }, "checkbox")
const checkAllButton = queryFactory({ matcher: "Role" }, "button", { name: /^check all/i })
const unCheckAllButton = queryFactory({ matcher: "Role" }, "button", { name: /uncheck all/i })
const imageBox = queryFactory({ matcher: "LabelText" }, "Image box")
const uploadImage = queryFactory({ matcher: "TestId" }, "uploadImage")
const addImageLink = queryFactory({ matcher: "LabelText" }, "Add image")
const addDescriptionink = queryFactory({ matcher: "LabelText" }, "Add description")
const progressBar = queryFactory({ matcher: "Role" }, "progressbar")
const descriptionInput = queryFactory({ matcher: "PlaceholderText" }, "Enter a description...")
const savingText = queryFactory({ matcher: "Text" }, "Saving", { exact: false })
const savedText = queryFactory({ matcher: "Text" }, "Saved")
const deleteImageButton = queryFactory({ matcher: "Role" }, "button", { name: /delete image/i })
const deleteRecipeButton = queryFactory({ matcher: "LabelText" }, "delete recipe")
const confirmDeleteButton = queryFactory({ matcher: "Role" }, "button", { name: /delete/i })
const confirmDeleteRecipeText = queryFactory({ matcher: "Text" }, "Are you sure you want to delete this recipe?")

const addItemToList = (user: UserEvent) => {
    return async (...args: string[]) => {
        for await (let text of args) {
            const inputElem = await adderInput.find()
            await user.clear(inputElem)
            await user.type(inputElem, text)
            await user.click(screen.getByRole("button", { name: /enter/i }))
        }
        return Promise.resolve()
    }
}

const enterListName = (user: UserEvent) => {
    return async (listName: string) => {
        // @ts-ignore
        return await user.type(nameInput.get(), listName, { delay: 1 })
    }
}

let mockRecipe: ModeRecipe
const mockRecipeAuthor = "John"

beforeEach(() => {
    useAuthMock.mockReturnValue({})
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
    const { user } = setup(<Recipe useLocalView />, setupOptions)
    await addItemToList(user)("1 orange", "2 limes", "3 apples")
    return { user }
}

const setupApiUsers = () => {
    apiRecipeMock.getSingle.mockResolvedValue(mockRecipe)
}

const setupOwnerUser = async () => {
    setupApiUsers()
    const mockUser = new User({ username: mockRecipeAuthor, email: "johnsemail@somehting.com" })
    useAuthMock.mockReturnValue({ user: mockUser })
    const { user } = setup(<Recipe />)
    await adderInput.find()
    return { user }
}

const setupRestrictedUser = async () => {
    setupApiUsers()
    const mockUser = new User({ username: "Bob", email: "johnsemail@somehting.com" })
    useAuthMock.mockReturnValue({ user: mockUser })
    const { user } = setupWithMemoryRouter(<Recipe />, {
        routerPath: `/users/Bob/recipes/${mockRecipe.id}`,
        routePath: "/users/:username/recipes/:id",
    })
    await nameInput.find()
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
            expect(listItem.getAll()).toHaveLength(3)
            await user.click(checkbox.getAll()[0])
            expect(listItem.getAll()[2]).toHaveTextContent("Apples")
            expect(checkbox.getAll()[2]).toBeChecked()
        }
    )

    test.each(testCases)(
        "As: %s: If I check off a second item it appears above the previously checked item",
        async (label, setupFn) => {
            const { user } = await setupFn()
            expect(listItem.getAll()).toHaveLength(3)
            await user.click(checkbox.getAll()[0])
            await user.click(checkbox.getAll()[0])
            expect(listItem.getAll()[0]).toHaveTextContent("Orange")
            expect(listItem.getAll()[1]).toHaveTextContent("Limes")
            expect(checkbox.getAll()[1]).toBeChecked()
        }
    )

    test.each(testCases)("As: %s: If I uncheck an item it stays at the bottom of the list", async (label, setupFn) => {
        const { user } = await setupFn()
        expect(listItem.getAll()).toHaveLength(3)
        await user.click(checkbox.getAll()[0])
        await user.click(checkbox.getAll()[2])
        expect(listItem.getAll()[2]).toHaveTextContent("Apples")
        expect(checkbox.getAll()[2]).not.toBeChecked()
    })

    test.each(testCases)(
        "As: %s: If I uncheck an item, that has another checked item, it appears above the other checked item",
        async (label, setupFn) => {
            const { user } = await setupFn()
            expect(listItem.getAll()).toHaveLength(3)
            await user.click(checkbox.getAll()[0])
            await user.click(checkbox.getAll()[1])
            await user.click(checkbox.getAll()[2])
            expect(listItem.getAll()[1]).toHaveTextContent("Apples")
            expect(checkbox.getAll()[1]).not.toBeChecked()
        }
    )

    test.each(testCases)(
        "As: %s: If I click 'Check all' it checks all the items on the list",
        async (label, setupFn) => {
            const { user } = await setupFn()
            await user.click(checkAllButton.get())
            const checkBoxes = checkbox.getAll()
            checkBoxes.forEach((cb) => {
                expect(cb).toBeChecked()
            })
        }
    )

    test.each(testCases)(
        "As: %s: If I click 'Uncheck all' it unchecks all the items on the list",
        async (label, setupFn) => {
            const { user } = await setupFn()
            await user.click(unCheckAllButton.get())
            const checkBoxes = checkbox.getAll()
            checkBoxes.forEach((cb) => {
                expect(cb).not.toBeChecked()
            })
        }
    )

    test.each(testCases)(
        "As: %s: If I change the 'Make for' amount it shows the correct ingrediant values",
        async (label, setupFn) => {
            const { user } = await setupFn()
            await user.clear(makeForInput.get())
            const inputQty = 2
            await user.type(makeForInput.get(), inputQty.toString())
            listItem.getAll().forEach((item, i) => {
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
            await waitFor(() => expect(makeForInput.get()).toHaveValue(expectedAmount))
        }
    )

    test.each(testCases)("As: %s: If there is an image it's displayed", async (label, setupFn) => {
        const imageName = "test-image.png"
        mockRecipe.imageUrl = imageName
        const mockLocalStorage = {
            recipe: JSON.stringify(mockRecipe.serialize()),
        }
        await setupFn({ localStorage: mockLocalStorage })
        const imageElem = within(imageBox.get()).getByRole("img")
        expect(imageElem).toHaveStyle(`background: url(${imageName})`)
    })

    test.each(testCases)("As: %s: If there is a description it's displayed", async (label, setupFn) => {
        const descriptionText = "A sample description"
        mockRecipe.description = descriptionText
        const mockLocalStorage = {
            recipe: JSON.stringify(mockRecipe.serialize()),
        }
        await setupFn({ localStorage: mockLocalStorage })
        expect(descriptionInput.get()).toHaveValue(descriptionText)
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
            const listItems = listItem.getAll()
            expect(listItems).toHaveLength(4)
            const firstItem = listItems[0]
            expect(firstItem).toHaveTextContent("Cherries")
            expect(firstItem).toHaveTextContent("3")
            expect(adderInput.get()).toHaveValue("")
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
        expect(listItem.getAll()).toHaveLength(3)
        await user.click(listItemDeleteButton.getAll()[0])
        await waitFor(() => expect(listItem.getAll()).toHaveLength(2))
        expect(listItem.getAll()[0]).toHaveTextContent("Limes")
        expect(listItem.getAll()[0]).toHaveTextContent("2")
    })

    test.each(testCases)("As: %s: I can enter a name for the list", async (label, setupFn) => {
        mockRecipe.name = ""
        const { user } = await setupFn()
        const inputText = "My baked lasagne"
        await enterListName(user)(inputText)
        expect(nameInput.get()).toHaveValue(inputText)
    })

    test.each(testCases)("As: %s: I can enter the amount the recipe serves", async (label, setupFn) => {
        const { user } = await setupFn()
        const serveAmount = 30
        await user.clear(servesInput.get())
        await user.type(servesInput.get(), serveAmount.toString())
        expect(servesInput.get()).toHaveValue(serveAmount)
    })

    test.each(testCases)(
        "As: %s: If I change the Serves amount, the 'Make for' quantity also changes",
        async (label, setupFn) => {
            apiRecipeMock.getSingle.mockResolvedValue(mockRecipe)
            const { user } = await setupFn()
            await waitFor(() => expect(servesInput.get()).toHaveValue(1))
            expect(makeForInput.get()).toHaveValue(1)
            const newServesAmount = 4
            await user.clear(servesInput.get())
            await user.type(servesInput.get(), newServesAmount.toString())
            await waitFor(() => expect(makeForInput.get()).toHaveValue(newServesAmount))
        }
    )

    test.each(testCases)(
        "As: %s: If click '+ Image' button, the image file input is triggered",
        async (label, setupFn) => {
            const { user } = await setupFn()
            const fileInputElem = uploadImage.get()
            const eventHandler = jest.fn()
            fileInputElem.addEventListener("click", eventHandler)
            await user.click(addImageLink.get())
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
            const fileInputElem = uploadImage.get()
            const testFile = new File(["hello"], "hello.png", { type: "image/png" })
            await user.upload(fileInputElem, testFile)
            const imageBoxElem = await imageBox.find()
            expect(within(imageBoxElem).getByRole("progressbar")).toBeInTheDocument()
            const imageUrl = "url/test.png"
            const image = new Image({ url: imageUrl })
            cb(image)
            await waitForElementToBeRemoved(() => within(imageBoxElem).queryByRole("progressbar"))
            await waitFor(() => {
                const img = within(imageBoxElem).getByRole("img")
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
        expect(addImageLink.query()).not.toBeInTheDocument()
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
            const fileInputElem = uploadImage.get()
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
            const button = deleteImageButton.get()
            await user.click(button)
            await waitFor(() => expect(imageBox.query()).not.toBeInTheDocument())
        }
    )

    test.each(testCases)(
        "As: %s: If click '+ Description' button, the description input is displayed, and the button is removed",
        async (label, setupFn) => {
            const { user } = await setupFn()
            await user.click(addDescriptionink.get())
            expect(descriptionInput.get()).toBeInTheDocument()
            await waitFor(() => expect(addDescriptionink.query()).not.toBeInTheDocument())
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
        setupWithMemoryRouter(<Recipe />, {
            routerPath: `/users/John/recipes/${listId}`,
            routePath: "/users/:username/recipes/:id",
        })
        expect(apiRecipeMock.getSingle).toBeCalledWith({ id: listId })
        await waitForElementToBeRemoved(progressBar.query())
    })

    test.each(testCases)(
        "As: %s: I see a loading indicator, while it is fetching the user's list, and it's removed when finished",
        async (label, setupFn) => {
            let cb = (val?: any) => {}
            const unresolvedPromise = new Promise<any[]>((resolve, reject) => {
                cb = resolve
            })
            apiRecipeMock.getAll.mockReturnValue(unresolvedPromise)
            setup(<Recipe />)
            expect(await progressBar.find()).toBeInTheDocument()
            cb()
            await waitFor(() => expect(progressBar.query()).not.toBeInTheDocument())
        }
    )

    test.each(testCases)("As: %s: If the list does not exist, I see a Not Found message", async (label, setupFn) => {
        apiRecipeMock.getSingle.mockResolvedValue(null)
        setup(<Recipe />)
        const errMsg = "Not Found!"
        expect(await screen.findByText(errMsg)).toBeInTheDocument()
    })

    test.each(testCases)(
        "As: %s: If there was an error fetching the list, I see an error message",
        async (label, setupFn) => {
            apiRecipeMock.getSingle.mockRejectedValue({ response: { status: 500 } })
            setup(<Recipe />)
            const errMsg = "Sorry, something went wrong."
            expect(await screen.findByText(errMsg)).toBeInTheDocument()
        }
    )

    test.each(testCases)("As: %s: The name of the list is displayed (if there is one)", async (label, setupFn) => {
        apiRecipeMock.getSingle.mockResolvedValue(mockRecipe)
        setup(<Recipe />)
        await waitFor(() => expect(nameInput.get()).toHaveValue(mockRecipe.name))
    })

    test.each(testCases)("As: %s: If there is no list name, then I see 'Unnamed List'", async (label, setupFn) => {
        mockRecipe.name = ""
        apiRecipeMock.getSingle.mockResolvedValue(mockRecipe)
        setup(<Recipe />)
        await waitFor(() => expect(nameInput.get()).toHaveValue("Unnamed list"))
    })

    test.each(testCases)("As: %s: If there are ingrediants I see a list of them", async (label, setupFn) => {
        mockRecipe.name = ""
        apiRecipeMock.getSingle.mockResolvedValue(mockRecipe)
        setup(<Recipe />)
        const listItems = await listItem.findAll()
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
            setup(<Recipe />)
            const message = "No ingrediants added yet."
            expect(await screen.findByText(message)).toBeInTheDocument()
        }
    )

    test.each(testCases)("As: %s: I see the amount the recipe serves", async (label, setupFn) => {
        const servesAmount = 10
        mockRecipe.serves = servesAmount
        apiRecipeMock.getSingle.mockResolvedValue(mockRecipe)
        setup(<Recipe />)
        await waitFor(() => expect(servesInput.get()).toHaveValue(servesAmount))
    })
})

describe("As a not logged in user viewing the index page", () => {
    test("If I reload the page the information I have entered has been saved", async () => {
        const { user, unmount, localStorage } = setup(<Recipe useLocalView />)
        const inputText = "My baked lasagne"
        await enterListName(user)(inputText)
        await addItemToList(user)("2 limes", "3 apples")
        const servesAmount = "12"
        await user.clear(servesInput.get())
        await user.type(servesInput.get(), servesAmount)

        expect(nameInput.get()).toHaveValue(inputText)
        expect(listItem.getAll()).toHaveLength(2)

        const imageUrl = "https://test.com/hello.png"
        const image = new Image({ url: imageUrl })
        apiImageMock.upload.mockImplementation(() => Promise.resolve(image))
        const fileInputElem = uploadImage.get()
        const testFile = new File(["hello"], imageUrl, { type: "image/png" })
        user.upload(fileInputElem, testFile)
        await waitFor(() => {
            const img = within(imageBox.get()).getByRole("img")
            expect(img).toHaveStyle(`background: url(${imageUrl})`)
        })

        await user.click(addDescriptionink.get())
        const descriptionBox = await descriptionInput.find()
        const descriptionText = "My description"
        await user.type(descriptionBox, descriptionText)

        unmount()
        setup(<Recipe useLocalView />, { localStorage })

        expect(nameInput.get()).toHaveValue(inputText)
        expect(listItem.getAll()).toHaveLength(2)
        expect(servesInput.get()).toHaveValue(Number(servesAmount))

        const img = within(imageBox.get()).getByRole("img")
        expect(img).toHaveStyle(`background: url(${imageUrl})`)

        const descriptionBoxWithText = descriptionInput.get()
        expect(descriptionBoxWithText).toHaveValue(descriptionText)
    })

    test("If I click the Publish button, I will be taken to the signup page if I am not logged in", async () => {
        const { user } = setup(<Recipe useLocalView />)
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
        setup(<Recipe />)
        expect(await screen.findByRole("textbox")).toBeDisabled()
        expect(adderInput.query()).not.toBeInTheDocument()
        expect(listItemDeleteButton.query()).not.toBeInTheDocument()
        expect(servesInput.get()).toBeDisabled()
        expect(addImageLink.query()).not.toBeInTheDocument()
        expect(addDescriptionink.query()).not.toBeInTheDocument()
        await waitFor(() => expect(progressBar.query()).not.toBeInTheDocument())
    })

    test("If the list has an image, I don't see the delete button", async () => {
        mockRecipe.imageUrl = "test.png"
        apiRecipeMock.getSingle.mockResolvedValue(mockRecipe)
        setup(<Recipe />)
        await waitFor(() => expect(progressBar.query()).not.toBeInTheDocument())
        expect(deleteImageButton.query()).not.toBeInTheDocument()
    })

    test("If the recipe from the API has ingrediants checked, I see them unchecked", async () => {
        mockRecipe.ingrediants.forEach((i) => (i.checked = true))
        apiRecipeMock.getSingle.mockResolvedValue(mockRecipe)
        setup(<Recipe />)
        const listItems = await listItem.findAll()
        listItems.forEach((item) => {
            expect(within(item).getByRole("checkbox")).not.toBeChecked()
        })
    })

    test("If I check an ingrediant and then reload the page, I see the item is checked", async () => {
        mockRecipe.ingrediants.forEach((i) => (i.checked = false))
        apiRecipeMock.getSingle.mockResolvedValue(mockRecipe)
        const { user, localStorage, unmount } = setup(<Recipe />)
        const checkBoxes = await checkbox.findAll()
        await user.click(checkBoxes[0])
        unmount()
        setup(<Recipe />, { localStorage })
        const newCheckBoxes = await checkbox.findAll()
        expect(newCheckBoxes[newCheckBoxes.length - 1]).toBeChecked()
    })

    test("If the list from the API has changed, after having previously loaded the list, my changes are merged", async () => {
        mockRecipe.ingrediants.forEach((i) => (i.checked = false))
        apiRecipeMock.getSingle.mockResolvedValue(mockRecipe)
        const { user, localStorage, unmount } = setup(<Recipe />)
        const listItems = await listItem.findAll()
        const firstListItem = listItems[0]
        await user.click(within(firstListItem).getByRole("checkbox"))
        expect(nameInput.get()).toHaveValue(mockRecipe.name)
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
        setup(<Recipe />, { localStorage })
        const newListItems = await listItem.findAll()
        expect(nameInput.get()).toHaveValue(newMockedRecipe.name)
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
        useAuthMock.mockReturnValue({ user: mockUser })
    })

    test("I see edit functions", async () => {
        setupWithMemoryRouter(<Recipe />, {
            routerPath: `/users/Bob/recipes/${mockRecipe.id}`,
            routePath: "/users/:username/recipes/:id",
        })
        expect(await adderInput.find()).toBeEnabled()
        expect(adderInput.get()).toBeInTheDocument()
        expect(listItemDeleteButton.getAll()[0]).toBeInTheDocument()
    })

    test("If I change the name the API is called with the updated list", async () => {
        mockRecipe.name = ""
        const { user } = setupWithMemoryRouter(<Recipe />, {
            routerPath: `/users/Bob/recipes/${mockRecipe.id}`,
            routePath: "/users/:username/recipes/:id",
        })
        const newName = "New list name"
        await user.type(await nameInput.find(), newName)
        expect(await savingText.find()).toBeInTheDocument()
        const mockCalls = apiRecipeMock.patch.mock.calls
        const lastCall = mockCalls[mockCalls.length - 1][0]
        expect(lastCall.name).toEqual(newName)
        expect(await savedText.find()).toBeInTheDocument()
    })

    test("If I add an item the API is called with the updated list", async () => {
        const { user } = setupWithMemoryRouter(<Recipe />, {
            routerPath: `/users/Bob/recipes/${mockRecipe.id}`,
            routePath: "/users/:username/recipes/:id",
        })
        await addItemToList(user)("2 pears")
        expect(await savingText.find()).toBeInTheDocument()
        const mockCalls = apiRecipeMock.patch.mock.calls
        const lastCall = mockCalls[mockCalls.length - 1][0]
        const addedIngrediant = lastCall.ingrediants[0]
        expect(addedIngrediant.name).toEqual("Pears")
        expect(addedIngrediant.qty.toString()).toEqual("2")
        expect(await savedText.find()).toBeInTheDocument()
    })

    test("If I delete an item the API is called with the updated list", async () => {
        const { user } = setupWithMemoryRouter(<Recipe />, {
            routerPath: `/users/Bob/recipes/${mockRecipe.id}`,
            routePath: "/users/:username/recipes/:id",
        })
        const deleteButtons = await listItemDeleteButton.findAll()
        await user.click(deleteButtons[0])
        expect(await savingText.find()).toBeInTheDocument()
        const mockCalls = apiRecipeMock.patch.mock.calls
        const lastCall = mockCalls[mockCalls.length - 1][0]
        expect(lastCall.ingrediants.length).toEqual(2)
        expect(lastCall.ingrediants[0].name).toEqual("Limes")
        expect(lastCall.ingrediants[0].qty.toString()).toEqual("2")
        expect(await savedText.find()).toBeInTheDocument()
    })

    test("If I check an item the API is called with the updated list", async () => {
        const { user } = setupWithMemoryRouter(<Recipe />, {
            routerPath: `/users/Bob/recipes/${mockRecipe.id}`,
            routePath: "/users/:username/recipes/:id",
        })
        const checkBoxes = await checkbox.findAll()
        await user.click(checkBoxes[0])
        expect(await savingText.find()).toBeInTheDocument()
        const mockCalls = apiRecipeMock.patch.mock.calls
        const lastCall = mockCalls[mockCalls.length - 1][0]
        const lastIngrediant = lastCall.ingrediants[lastCall.ingrediants.length - 1]
        expect(lastIngrediant.checked).toEqual(true)
        expect(await savedText.find()).toBeInTheDocument()
    })

    test("If there is an error saving the list, I should see an error message", async () => {
        apiRecipeMock.patch.mockRejectedValue({ response: { status: 500 } })
        const { user } = setupWithMemoryRouter(<Recipe />, {
            routerPath: `/users/Bob/recipes/${mockRecipe.id}`,
            routePath: "/users/:username/recipes/:id",
        })
        const checkBoxes = await checkbox.findAll()
        await user.click(checkBoxes[0])
        expect(await screen.findByText("Error saving")).toBeInTheDocument()
    })

    test("If I click the delete button, the API is called to delete the list, then I am redirected", async () => {
        const { user } = setupWithMemoryRouter(<Recipe />, {
            routerPath: `/users/Bob/recipes/${mockRecipe.id}`,
            routePath: "/users/:username/recipes/:id",
        })
        const deleteRecipeButtonElem = await deleteRecipeButton.find()
        await user.click(deleteRecipeButtonElem)
        expect(await confirmDeleteRecipeText.find()).toBeInTheDocument()
        const confirmDeleteButtonElem = confirmDeleteButton.get()
        await user.click(confirmDeleteButtonElem)
        expect(await within(confirmDeleteButtonElem).findByRole("progressbar")).toBeInTheDocument()
        expect(apiRecipeMock.remove).toBeCalledWith(mockRecipe.id)
        const route = mockedUseNavigate.mock.calls[0][0]
        await waitFor(() => expect(route).toEqual("/"))
    })

    test("If there is an error deleting the list, I see an error message", async () => {
        const { user } = setupWithMemoryRouter(<Recipe />, {
            routerPath: `/users/Bob/recipes/${mockRecipe.id}`,
            routePath: "/users/:username/recipes/:id",
        })
        apiRecipeMock.remove.mockRejectedValue({ response: { status: 500 } })
        const deleteRecipeButtonElem = await deleteRecipeButton.find()
        await user.click(deleteRecipeButtonElem)
        expect(await confirmDeleteRecipeText.find()).toBeInTheDocument()
        const confirmDeleteButtonElem = confirmDeleteButton.get()
        await user.click(confirmDeleteButtonElem)
        expect(await within(confirmDeleteButtonElem).findByRole("progressbar")).toBeInTheDocument()
        expect(await screen.findByText("Sorry something went wrong.")).toBeInTheDocument()
        expect(within(confirmDeleteButtonElem).queryByRole("progressbar")).not.toBeInTheDocument()
    })

    test("If I click 'Check all' it checks all the items and  the API is called", async () => {
        const { user } = setupWithMemoryRouter(<Recipe />, {
            routerPath: `/users/Bob/recipes/${mockRecipe.id}`,
            routePath: "/users/:username/recipes/:id",
        })
        await user.click(await checkAllButton.find())
        await waitFor(() => expect(apiRecipeMock.patch).toBeCalled())
        const mockCalls = apiRecipeMock.patch.mock.calls
        const lastCall = mockCalls[mockCalls.length - 1][0]
        lastCall.ingrediants.forEach((i: Ingrediant) => {
            expect(i.checked).toEqual(true)
        })
    })

    test("If I click 'Uncheck all' it checks all the items and  the API is called", async () => {
        mockRecipe.ingrediants.forEach((i) => (i.checked = true))
        const { user } = setupWithMemoryRouter(<Recipe />, {
            routerPath: `/users/Bob/recipes/${mockRecipe.id}`,
            routePath: "/users/:username/recipes/:id",
        })
        await user.click(await unCheckAllButton.find())
        await waitFor(() => expect(apiRecipeMock.patch).toBeCalled())
        const mockCalls = apiRecipeMock.patch.mock.calls
        const lastCall = mockCalls[mockCalls.length - 1][0]
        lastCall.ingrediants.forEach((i: Ingrediant) => {
            expect(i.checked).toEqual(false)
        })
    })

    test("If I change the Serves amount the API is called", async () => {
        mockRecipe.ingrediants.forEach((i) => (i.checked = true))
        const { user } = setupWithMemoryRouter(<Recipe />, {
            routerPath: `/users/Bob/recipes/${mockRecipe.id}`,
            routePath: "/users/:username/recipes/:id",
        })
        const servesAmount = "12"
        await user.clear(await servesInput.find())
        await user.type(servesInput.get(), servesAmount)
        await waitFor(() => expect(apiRecipeMock.patch).toBeCalled())
        const mockCalls = apiRecipeMock.patch.mock.calls
        const lastCall = mockCalls[mockCalls.length - 1][0]
        expect(lastCall.serves.toString()).toEqual(servesAmount)
    })

    test("If I upload an image, and it succeeds, the API is called with an updated list", async () => {
        const image = new Image({ url: "url/test.png" })
        apiImageMock.upload.mockImplementation(() => Promise.resolve(image))
        const { user } = setupWithMemoryRouter(<Recipe />, {
            routerPath: `/users/Bob/recipes/${mockRecipe.id}`,
            routePath: "/users/:username/recipes/:id",
        })
        const fileInputElem = await uploadImage.find()
        const testFile = new File(["hello"], "hello.png", { type: "image/png" })
        await user.upload(fileInputElem, testFile)
        const imageBoxElem = await imageBox.find()
        expect(within(imageBoxElem).getByRole("progressbar")).toBeInTheDocument()
        const call = apiRecipeMock.patch.mock.calls[0][0]
        await waitFor(() => expect(call.imageUrl).toEqual(image.url))
    })

    test("If I enter text into the description box, the API is called with an updated list", async () => {
        const { user } = setupWithMemoryRouter(<Recipe />, {
            routerPath: `/users/Bob/recipes/${mockRecipe.id}`,
            routePath: "/users/:username/recipes/:id",
        })
        await user.click(await addDescriptionink.find())
        const descriptionBox = descriptionInput.get()
        const text = "My description"
        await user.type(descriptionBox, text)
        const mockCalls = apiRecipeMock.patch.mock.calls
        const lastCall = mockCalls[mockCalls.length - 1][0]
        await waitFor(() => expect(lastCall.description).toEqual(text))
    })
})
