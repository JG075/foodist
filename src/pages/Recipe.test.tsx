import { screen, waitFor, waitForElementToBeRemoved, within } from "@testing-library/react"
import { UserEvent } from "@testing-library/user-event/dist/types/setup"
import axios from "axios"

import { queryFactory, setupWithMemoryRouter } from "../testHelpers"
import apiRecipe from "../api/Recipe"
import apiImage from "../api/Image"
import RecipeModel from "../models/Recipe"
import Qty from "../lib/qty"
import Ingrediant from "../models/Ingrediant"
import Image from "../models/Image"
import { useAuth } from "../hooks/auth"
import Recipe from "./Recipe"
import User from "../models/User"

jest.mock("../hooks/auth")
jest.mock("../api/Recipe")
jest.mock("../api/Image")
jest.mock("axios")

export const apiImageMock = apiImage as jest.Mocked<typeof apiImage>
export const apiRecipeMock = apiRecipe as jest.Mocked<typeof apiRecipe>
export const useAuthMock = useAuth as jest.Mock<Partial<ReturnType<typeof useAuth>>>
export const axiosMock = axios as jest.Mocked<typeof axios>

export const mockedUseNavigate = jest.fn()
jest.mock("react-router-dom", () => {
    const originalModule = jest.requireActual("react-router-dom")
    return {
        __esModule: true,
        ...originalModule,
        useNavigate: () => mockedUseNavigate,
    }
})

export const listItem = queryFactory({ matcher: "Role" }, "listitem")
export const listItemDeleteButton = queryFactory({ matcher: "Role" }, "button", { name: "delete" })
export const nameInput = queryFactory({ matcher: "PlaceholderText" }, "Give your recipe a name")
export const servesInput = queryFactory({ matcher: "Role" }, "spinbutton", { name: /serves/i })
export const makeForInput = queryFactory({ matcher: "Role" }, "spinbutton", { name: /make for/i })
export const adderInput = queryFactory(
    { matcher: "PlaceholderText" },
    "Enter an ingrediant and quantity e.g. 2 lemons, mozzarella 50g"
)
export const checkbox = queryFactory({ matcher: "Role" }, "checkbox")
export const checkAllButton = queryFactory({ matcher: "Role" }, "button", { name: /^check all/i })
export const unCheckAllButton = queryFactory({ matcher: "Role" }, "button", { name: /uncheck all/i })
export const imageBox = queryFactory({ matcher: "LabelText" }, "Image box")
export const uploadImage = queryFactory({ matcher: "TestId" }, "uploadImage")
export const addImageLink = queryFactory({ matcher: "LabelText" }, "Add image")
export const addDescriptionink = queryFactory({ matcher: "LabelText" }, "Add description")
export const progressBar = queryFactory({ matcher: "Role" }, "progressbar")
export const descriptionInput = queryFactory({ matcher: "PlaceholderText" }, "Enter a description...")
export const savingText = queryFactory({ matcher: "Text" }, "Saving", { exact: false })
export const savedText = queryFactory({ matcher: "Text" }, "Saved")
export const deleteImageButton = queryFactory({ matcher: "Role" }, "button", { name: /delete image/i })
export const deleteRecipeButton = queryFactory({ matcher: "LabelText" }, "delete recipe")
export const confirmDeleteButton = queryFactory({ matcher: "Role" }, "button", { name: /delete/i })
export const confirmDeleteRecipeText = queryFactory({ matcher: "Text" }, "Are you sure you want to delete this recipe?")
export const publishButton = queryFactory({ matcher: "Role" }, "button", { name: /publish/i })

export const addItemToList = (user: UserEvent) => {
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

export const enterListName = (user: UserEvent) => {
    return async (listName: string) => {
        // @ts-ignore
        return await user.type(nameInput.get(), listName, { delay: 1 })
    }
}

export const generateIngrediants = (...args: [string, number, boolean?][]) => {
    return args.map(([name, qty, checked]) => new Ingrediant({ name, qty: new Qty(qty.toString()), checked }))
}

export const runCommonTests = (setupFn: ({ recipe }: { recipe: RecipeModel }) => Promise<{ user: UserEvent }>) => {
    describe("Common tests", () => {
        test("The name of the list is displayed (if there is one)", async () => {
            const recipe = new RecipeModel({ name: "My Recipe" })
            await setupFn({ recipe })
            expect(nameInput.get()).toHaveValue(recipe.name)
        })

        test("If there are ingrediants I see a list of them", async () => {
            const ingrediants = generateIngrediants(["Apples", 3], ["Limes", 2])
            const recipe = new RecipeModel({ ingrediants })
            await setupFn({ recipe })
            const listItems = await listItem.findAll()
            expect(listItems).toHaveLength(recipe.ingrediants.length)
            listItems.forEach((item, i) => {
                const ingrediantItem = recipe.ingrediants[i]
                expect(item).toHaveTextContent(ingrediantItem.name)
            })
        })

        test("If there are no ingrediants in a list then I see a message", async () => {
            const recipe = new RecipeModel({})
            await setupFn({ recipe })
            const message = "No ingrediants added yet."
            expect(screen.getByText(message)).toBeInTheDocument()
        })

        test("I see the amount the recipe serves", async () => {
            const recipe = new RecipeModel({ serves: 10 })
            await setupFn({ recipe })
            expect(servesInput.get()).toHaveValue(recipe.serves)
        })

        test("I can check off an item on the list and it moves to the bottom with a completed appearance", async () => {
            const ingrediants = generateIngrediants(["Apples", 3], ["Limes", 2], ["Orange", 1])
            const recipe = new RecipeModel({ ingrediants })
            const { user } = await setupFn({ recipe })
            expect(listItem.getAll()).toHaveLength(ingrediants.length)
            await user.click(checkbox.getAll()[0])
            expect(listItem.getAll()[2]).toHaveTextContent("Apples")
            expect(checkbox.getAll()[2]).toBeChecked()
        })

        test("If I check off a second item it appears above the previously checked item", async () => {
            const ingrediants = generateIngrediants(["Apples", 3], ["Limes", 2], ["Orange", 1])
            const recipe = new RecipeModel({ ingrediants })
            const { user } = await setupFn({ recipe })
            expect(listItem.getAll()).toHaveLength(ingrediants.length)
            await user.click(checkbox.getAll()[0])
            await user.click(checkbox.getAll()[0])
            expect(listItem.getAll()[0]).toHaveTextContent("Orange")
            expect(listItem.getAll()[1]).toHaveTextContent("Limes")
            expect(checkbox.getAll()[1]).toBeChecked()
        })

        test("If I uncheck an item it stays at the bottom of the list", async () => {
            const ingrediants = generateIngrediants(["Apples", 3], ["Limes", 2], ["Orange", 1])
            const recipe = new RecipeModel({ ingrediants })
            const { user } = await setupFn({ recipe })
            expect(listItem.getAll()).toHaveLength(ingrediants.length)
            await user.click(checkbox.getAll()[0])
            await user.click(checkbox.getAll()[2])
            expect(listItem.getAll()[2]).toHaveTextContent("Apples")
            expect(checkbox.getAll()[2]).not.toBeChecked()
        })

        test("If I uncheck an item, that has another checked item, it appears above the other checked item", async () => {
            const ingrediants = generateIngrediants(["Apples", 3], ["Limes", 2], ["Orange", 1])
            const recipe = new RecipeModel({ ingrediants })
            const { user } = await setupFn({ recipe })
            expect(listItem.getAll()).toHaveLength(3)
            await user.click(checkbox.getAll()[0])
            await user.click(checkbox.getAll()[1])
            await user.click(checkbox.getAll()[2])
            expect(listItem.getAll()[1]).toHaveTextContent("Apples")
            expect(checkbox.getAll()[1]).not.toBeChecked()
        })

        test("If I click 'Check all' it checks all the items on the list", async () => {
            const ingrediants = generateIngrediants(["Apples", 3], ["Limes", 2], ["Orange", 1])
            const recipe = new RecipeModel({ ingrediants })
            const { user } = await setupFn({ recipe })
            await user.click(checkAllButton.get())
            const checkBoxes = checkbox.getAll()
            checkBoxes.forEach((cb) => {
                expect(cb).toBeChecked()
            })
        })

        test("If I click 'Uncheck all' it unchecks all the items on the list", async () => {
            const ingrediants = generateIngrediants(["Apples", 3, true], ["Limes", 2, true], ["Orange", 1, true])
            const recipe = new RecipeModel({ ingrediants })
            const { user } = await setupFn({ recipe })
            await user.click(unCheckAllButton.get())
            const checkBoxes = checkbox.getAll()
            checkBoxes.forEach((cb) => {
                expect(cb).not.toBeChecked()
            })
        })

        test("If I change the 'Make for' amount it shows the correct ingrediant values", async () => {
            const ingrediants = generateIngrediants(["Apples", 3], ["Limes", 2], ["Orange", 1])
            const recipe = new RecipeModel({ ingrediants })
            const { user } = await setupFn({ recipe })
            await user.clear(makeForInput.get())
            const inputQty = 2
            await user.type(makeForInput.get(), inputQty.toString())
            listItem.getAll().forEach((item, i) => {
                const originalQty = recipe.ingrediants[i].qty
                expect(item).toHaveTextContent((originalQty * 2).toString())
            })
        })

        test("The 'Make for' amount is the same as the 'Serves' amount on load", async () => {
            const ingrediants = generateIngrediants(["Apples", 3], ["Limes", 2], ["Orange", 1])
            const recipe = new RecipeModel({ serves: 8, ingrediants })
            await setupFn({ recipe })
            expect(makeForInput.get()).toHaveValue(recipe.serves)
        })

        test("If there is an image it's displayed", async () => {
            const recipe = new RecipeModel({ imageUrl: "test-image.png" })
            await setupFn({ recipe })
            const imageElem = within(imageBox.get()).getByRole("img")
            expect(imageElem).toHaveStyle(`background: url(${recipe.imageUrl})`)
        })

        test("If there is a description it's displayed", async () => {
            const recipe = new RecipeModel({ description: "My description text" })
            await setupFn({ recipe })
            expect(descriptionInput.get()).toHaveValue(recipe.description)
        })
    })
}

export const runEditTests = (
    setupFn: ({ recipe }: { recipe: RecipeModel }) => Promise<{ user: UserEvent }>,
    assertChangeFn: (fn: (recipe: RecipeModel) => void) => void
) => {
    describe("Edit tests", () => {
        test("I can add an ingrediant and it appears in the ingrediants list", async () => {
            const recipe = new RecipeModel({})
            const { user } = await setupFn({ recipe })
            await addItemToList(user)("3 cherries")
            const listItems = await listItem.findAll()
            expect(listItems).toHaveLength(1)
            const firstItem = listItems[0]
            expect(firstItem).toHaveTextContent("Cherries")
            expect(firstItem).toHaveTextContent("3")
            expect(adderInput.get()).toHaveValue("")
            assertChangeFn((recipe) => expect(recipe.ingrediants[0].name).toEqual("Cherries"))
        })

        test("If I enter no ingrediant name I see an error message", async () => {
            const recipe = new RecipeModel({})
            const { user } = await setupFn({ recipe })
            await addItemToList(user)("20")
            const errMsg = "Please enter an ingrediant name and optionally a quantity."
            await screen.findByText(errMsg)
            await addItemToList(user)("20 lemons")
            expect(screen.queryByText(errMsg)).toBeNull()
        })

        test("I can delete an item from the list", async () => {
            const ingrediants = generateIngrediants(["Apples", 3], ["Limes", 2], ["Orange", 1])
            const recipe = new RecipeModel({ ingrediants })
            const { user } = await setupFn({ recipe })
            expect(listItem.getAll()).toHaveLength(3)
            await user.click(listItemDeleteButton.getAll()[0])
            await waitFor(() => expect(listItem.getAll()).toHaveLength(2))
            expect(listItem.getAll()[0]).toHaveTextContent("Limes")
            expect(listItem.getAll()[0]).toHaveTextContent("2")
            assertChangeFn((recipe) => {
                expect(recipe.ingrediants.length).toEqual(2)
                expect(recipe.ingrediants[0].name).toEqual("Limes")
            })
        })

        test("I can enter a name for the recipe", async () => {
            const recipe = new RecipeModel({})
            const { user } = await setupFn({ recipe })
            const inputText = "My baked lasagne"
            await enterListName(user)(inputText)
            expect(nameInput.get()).toHaveValue(inputText)
            assertChangeFn((recipe) => {
                expect(recipe.name).toEqual(inputText)
            })
        })

        test("I can enter the amount the recipe serves", async () => {
            const recipe = new RecipeModel({})
            const { user } = await setupFn({ recipe })
            const serveAmount = 30
            await user.clear(servesInput.get())
            await user.type(servesInput.get(), serveAmount.toString())
            expect(servesInput.get()).toHaveValue(serveAmount)
            assertChangeFn((recipe) => {
                expect(recipe.serves).toEqual(serveAmount)
            })
        })

        test("If I change the Serves amount, the 'Make for' quantity also changes", async () => {
            const ingrediants = generateIngrediants(["Apples", 3], ["Limes", 2], ["Orange", 1])
            const recipe = new RecipeModel({ serves: 1, ingrediants })
            const { user } = await setupFn({ recipe })
            const newServesAmount = 4
            await user.clear(servesInput.get())
            await user.type(servesInput.get(), newServesAmount.toString())
            await waitFor(() => expect(makeForInput.get()).toHaveValue(newServesAmount))
        })

        test("If click '+ Image' button, the image file input is triggered", async () => {
            const recipe = new RecipeModel({})
            const { user } = await setupFn({ recipe })
            const fileInputElem = uploadImage.get()
            const eventHandler = jest.fn()
            fileInputElem.addEventListener("click", eventHandler)
            await user.click(addImageLink.get())
            expect(eventHandler).toBeCalledTimes(1)
        })

        test("If I upload an image, I should see a loading icon and then the image", async () => {
            let cb: any = () => {}
            apiImageMock.upload.mockImplementation(() => {
                return new Promise((resolve, reject) => {
                    cb = resolve
                })
            })
            const recipe = new RecipeModel({})
            const { user } = await setupFn({ recipe })
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
            assertChangeFn((recipe) => {
                expect(recipe.imageUrl).toEqual(imageUrl)
            })
        })

        test("If there is an image, I don't see the '+ Image' link", async () => {
            const recipe = new RecipeModel({ imageUrl: "test-image.png" })
            await setupFn({ recipe })
            expect(addImageLink.query()).not.toBeInTheDocument()
        })

        test("If I upload an image, and it fails, I see an error message", async () => {
            axiosMock.isAxiosError.mockImplementation(() => true)
            const err = {
                response: {
                    status: 500,
                },
            }
            apiImageMock.upload.mockImplementation(() => Promise.reject(err))
            const recipe = new RecipeModel({})
            const { user } = await setupFn({ recipe })
            const fileInputElem = uploadImage.get()
            const testFile = new File(["hello"], "hello.png", { type: "image/png" })
            user.upload(fileInputElem, testFile)
            await waitFor(() => expect(screen.getByText("Sorry something went wrong.")))
        })

        test("If I click the delete icon over the image, the image is removed, and the '+ Image' link is re-displayed", async () => {
            const recipe = new RecipeModel({ imageUrl: "test-image.png" })
            const { user } = await setupFn({ recipe })
            const button = deleteImageButton.get()
            await user.click(button)
            await waitFor(() => expect(imageBox.query()).not.toBeInTheDocument())
            assertChangeFn((recipe) => {
                expect(recipe.imageUrl).toEqual("")
            })
        })

        test("If click '+ Description' button, the description input is displayed, and the button is removed", async () => {
            const recipe = new RecipeModel({})
            const { user } = await setupFn({ recipe })
            await user.click(addDescriptionink.get())
            expect(descriptionInput.get()).toBeInTheDocument()
            await waitFor(() => expect(addDescriptionink.query()).not.toBeInTheDocument())
        })
    })
}

describe("API tests", () => {
    beforeEach(() => useAuthMock.mockReturnValue({}))

    test("The api is called with the id of the list", async () => {
        setupWithMemoryRouter(<Recipe />, {
            routerPath: `/users/John/recipes/abc123`,
            routePath: "/users/:username/recipes/:id",
        })
        expect(apiRecipeMock.getSingle).toBeCalledWith({ id: "abc123" })
        await waitForElementToBeRemoved(progressBar.query())
    })

    test("I see a loading indicator, while it is fetching the user's list, and it's removed when finished", async () => {
        let cb = (val?: any) => {}
        const unresolvedPromise = new Promise<any[]>((resolve, reject) => {
            cb = resolve
        })
        apiRecipeMock.getAll.mockReturnValue(unresolvedPromise)
        setupWithMemoryRouter(<Recipe />, {
            routerPath: `/users/John/recipes/abc123`,
            routePath: "/users/:username/recipes/:id",
        })
        expect(await progressBar.find()).toBeInTheDocument()
        cb()
        await waitFor(() => expect(progressBar.query()).not.toBeInTheDocument())
    })

    test("If the list does not exist, I see a Not Found message", async () => {
        apiRecipeMock.getSingle.mockResolvedValue(null)
        setupWithMemoryRouter(<Recipe />, {
            routerPath: `/users/John/recipes/abc123`,
            routePath: "/users/:username/recipes/:id",
        })
        const errMsg = "Not Found!"
        expect(await screen.findByText(errMsg)).toBeInTheDocument()
    })

    test("If there was an error fetching the list, I see an error message", async () => {
        apiRecipeMock.getSingle.mockRejectedValue({ response: { status: 500 } })
        setupWithMemoryRouter(<Recipe />, {
            routerPath: `/users/John/recipes/abc123`,
            routePath: "/users/:username/recipes/:id",
        })
        const errMsg = "Sorry, something went wrong."
        expect(await screen.findByText(errMsg)).toBeInTheDocument()
    })

    test("If I own the list, I see the 'Owner view'", async () => {
        const RecipeComponent = require("./Recipe").default
        const res = Promise.resolve(new RecipeModel({ authorId: "John" }))
        useAuthMock.mockReturnValue({ user: new User({ username: "John", email: "" }) })
        apiRecipeMock.getSingle.mockReturnValue(res)
        setupWithMemoryRouter(<RecipeComponent />, {
            routerPath: `/users/John/recipes/abc123`,
            routePath: "/users/:username/recipes/:id",
        })
        expect(await savedText.find()).toBeInTheDocument()
    })

    test("If I don't own the list, I see the 'Spectator view'", async () => {
        const RecipeComponent = require("./Recipe").default
        const res = Promise.resolve(new RecipeModel({ authorId: "Bob" }))
        useAuthMock.mockReturnValue({ user: new User({ username: "John", email: "" }) })
        apiRecipeMock.getSingle.mockReturnValue(res)
        setupWithMemoryRouter(<RecipeComponent />, {
            routerPath: `/users/John/recipes/abc123`,
            routePath: "/users/:username/recipes/:id",
        })
        await nameInput.find()
        expect(savedText.query()).not.toBeInTheDocument()
    })
})
