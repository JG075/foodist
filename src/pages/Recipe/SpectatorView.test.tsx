import User from "../../models/User"
import {
    addDescriptionink,
    adderInput,
    addImageLink,
    apiRecipeMock,
    checkbox,
    deleteImageButton,
    generateIngrediants,
    listItem,
    listItemDeleteButton,
    nameInput,
    progressBar,
    runCommonTests,
    servesInput,
    useAuthMock,
} from "../Recipe.test"
import setup, { setupWithMemoryRouter } from "../../testHelpers"
import SpectatorView from "./SpectatorView"
import Recipe from "../../models/Recipe"
import { screen, waitFor, within } from "@testing-library/react"
import Ingrediant from "../../models/Ingrediant"
import Qty from "../../lib/qty"

const setupLocalUser = async ({ recipe }: { recipe: Recipe }) => {
    if (recipe) {
        apiRecipeMock.getSingle.mockResolvedValue(recipe)
    }
    const mockUser = new User({ username: "Bob", email: "bobsemail@somehting.com" })
    useAuthMock.mockReturnValue({ user: mockUser })
    const setupResult = setupWithMemoryRouter(<SpectatorView recipe={recipe} />, {
        routerPath: `/users/Bob/recipes/foo123`,
        routePath: "/users/:username/recipes/:id",
    })
    await nameInput.find()
    return setupResult
}

// const setupApiTest = () => {
//     const mockUser = new User({ username: "John", email: "johnsemail@somehting.com" })
//     useAuthMock.mockReturnValue({ user: mockUser })
//     const setupResult = setupWithMemoryRouter(<SpectatorView />, {
//         routerPath: `/users/John/recipes/abc123`,
//         routePath: "/users/:username/recipes/:id",
//     })
//     return setupResult
// }

runCommonTests(setupLocalUser)

test("I do not see edit functions", async () => {
    const ingrediants = generateIngrediants(["Apples", 3], ["Limes", 2])
    const recipe = new Recipe({ ingrediants })
    await setupLocalUser({ recipe })
    expect(screen.getByRole("textbox")).toBeDisabled()
    expect(adderInput.query()).not.toBeInTheDocument()
    expect(listItemDeleteButton.query()).not.toBeInTheDocument()
    expect(servesInput.get()).toBeDisabled()
    expect(addImageLink.query()).not.toBeInTheDocument()
    expect(addDescriptionink.query()).not.toBeInTheDocument()
    await waitFor(() => expect(progressBar.query()).not.toBeInTheDocument())
})

test("If the list has an image, I don't see the delete button", async () => {
    const recipe = new Recipe({ imageUrl: "test-image.png" })
    await setupLocalUser({ recipe })
    await waitFor(() => expect(progressBar.query()).not.toBeInTheDocument())
    expect(deleteImageButton.query()).not.toBeInTheDocument()
})

test("If the recipe from the API has ingrediants checked, I see them unchecked", async () => {
    const ingrediants = generateIngrediants(["Apples", 3, true], ["Limes", 2, true])
    const recipe = new Recipe({ ingrediants })
    await setupLocalUser({ recipe })
    const listItems = await listItem.findAll()
    listItems.forEach((item) => {
        expect(within(item).getByRole("checkbox")).not.toBeChecked()
    })
})

test("If I check an ingrediant and then reload the page, I see the item is checked", async () => {
    const ingrediants = generateIngrediants(["Apples", 3], ["Limes", 2])
    const recipe = new Recipe({ ingrediants })
    const { user, unmount, localStorage } = await setupLocalUser({ recipe })
    const checkBoxes = await checkbox.findAll()
    await user.click(checkBoxes[0])
    unmount()
    setup(<SpectatorView recipe={recipe} />, { localStorage })
    const newCheckBoxes = await checkbox.findAll()
    expect(newCheckBoxes[newCheckBoxes.length - 1]).toBeChecked()
})

test("If the list from the API has changed, after having previously loaded the list, my changes are merged", async () => {
    const ingrediants = generateIngrediants(["Apples", 3], ["Limes", 2], ["Orange", 1])
    const recipe = new Recipe({ id: "test", name: "My recipe", ingrediants })
    const { user, unmount, localStorage } = await setupLocalUser({ recipe })
    const listItems = await listItem.findAll()
    const checkedListItem = listItems[0]
    await user.click(within(checkedListItem).getByRole("checkbox"))
    expect(nameInput.get()).toHaveValue(recipe.name)
    unmount()
    const newItem = new Ingrediant({
        id: "123",
        name: "pudding",
        qty: new Qty("20g"),
    })
    const newMockedRecipe = new Recipe({
        id: recipe.id,
        name: "My new name",
        ingrediants: [newItem, ingrediants[0], ingrediants[2]],
    })
    setup(<SpectatorView recipe={newMockedRecipe} />, { localStorage })
    const newListItems = await listItem.findAll()
    expect(nameInput.get()).toHaveValue(newMockedRecipe.name)
    expect(newListItems[0]).toHaveTextContent(newItem.name)
    expect(newListItems[2].textContent).toEqual(checkedListItem.textContent)
    expect(within(newListItems[2]).getByRole("checkbox")).toBeChecked()
    const removedItem = ingrediants[1]
    expect(screen.queryByText(removedItem.name)).not.toBeInTheDocument()
})

test("If there is no list name, then I see 'Unnamed recipe'", async () => {
    const recipe = new Recipe({})
    await setupLocalUser({ recipe })
    await waitFor(() => expect(nameInput.get()).toHaveValue("Unnamed recipe"))
})
