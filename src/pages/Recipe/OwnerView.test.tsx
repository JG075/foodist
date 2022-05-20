import { screen, waitFor, within } from "@testing-library/react"

import User from "../../models/User"
import {
    adderInput,
    apiRecipeMock,
    checkbox,
    confirmDeleteButton,
    confirmDeleteRecipeText,
    deleteRecipeButton,
    generateIngrediants,
    mockedUseNavigate,
    runCommonTests,
    runEditTests,
    useAuthMock,
} from "../Recipe.test"
import setup from "../../testHelpers"
import OwnerView from "./OwnerView"
import Recipe from "../../models/Recipe"

const setupOwnerUser = async ({ recipe }: { recipe: Recipe }) => {
    const mockUser = new User({ username: "John", email: "johnsemail@somehting.com" })
    useAuthMock.mockReturnValue({ user: mockUser })
    const setupResult = setup(<OwnerView recipe={recipe} />)
    await adderInput.find()
    return setupResult
}

const assertChangeFn = (cb: (recipe: Recipe) => void) => {
    const mockCalls = apiRecipeMock.patch.mock.calls
    const lastCall = mockCalls[mockCalls.length - 1][0] as Recipe
    cb(lastCall)
}

runCommonTests(setupOwnerUser)
runEditTests(setupOwnerUser, assertChangeFn)

test("If there is an error saving the list, I should see an error message", async () => {
    apiRecipeMock.patch.mockRejectedValue({ response: { status: 500 } })
    const ingrediants = generateIngrediants(["Apples", 3], ["Limes", 2])
    const recipe = new Recipe({ ingrediants })
    const { user } = await setupOwnerUser({ recipe })
    const checkBoxes = await checkbox.findAll()
    await user.click(checkBoxes[0])
    expect(await screen.findByText("Error saving")).toBeInTheDocument()
})

test("If I click the delete button, the API is called to delete the list, then I am redirected", async () => {
    const recipe = new Recipe({ id: "abc" })
    const { user } = await setupOwnerUser({ recipe })
    const deleteRecipeButtonElem = await deleteRecipeButton.find()
    await user.click(deleteRecipeButtonElem)
    expect(await confirmDeleteRecipeText.find()).toBeInTheDocument()
    const confirmDeleteButtonElem = confirmDeleteButton.get()
    await user.click(confirmDeleteButtonElem)
    expect(await within(confirmDeleteButtonElem).findByRole("progressbar")).toBeInTheDocument()
    expect(apiRecipeMock.remove).toBeCalledWith(recipe.id)
    const route = mockedUseNavigate.mock.calls[0][0]
    await waitFor(() => expect(route).toEqual("/"))
})

test("If there is an error deleting the list, I see an error message", async () => {
    const recipe = new Recipe({})
    const { user } = await setupOwnerUser({ recipe })
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
