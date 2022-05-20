import {
    addItemToList,
    enterListName,
    mockedUseNavigate,
    nameInput,
    publishButton,
    runCommonTests,
    runEditTests,
} from "../Recipe.test"
import setup from "../../testHelpers"
import LocalView from "./LocalView"
import Recipe from "../../models/Recipe"

let localStorageMock: { [key: string]: any }

const setupLocalUser = async (options: { recipe?: Recipe } = {}) => {
    const initialLocalStorage = { recipe: options.recipe ? JSON.stringify(options.recipe) : null }
    const setupResult = setup(<LocalView />, { localStorage: initialLocalStorage })
    localStorageMock = setupResult.localStorage
    return setupResult
}

const assertChangeFn = (cb: (recipe: Recipe) => void) => {
    cb(JSON.parse(localStorageMock.recipe))
}

runCommonTests(setupLocalUser)
runEditTests(setupLocalUser, assertChangeFn)

test("If I reload the page the information I have entered has been saved", async () => {
    const { user, unmount, localStorage } = await setupLocalUser()
    const inputText = "My baked lasagne"
    await enterListName(user)(inputText)
    unmount()
    setup(<LocalView />, { localStorage })
    expect(nameInput.get()).toHaveValue(inputText)
})

test("If I click the Publish button, I will be taken to the signup page if I am not logged in", async () => {
    const { user } = await setupLocalUser()
    const inputText = "My baked lasagne"
    await enterListName(user)(inputText)
    await addItemToList(user)("2 limes", "3 apples")
    await user.click(publishButton.get())
    const route = mockedUseNavigate.mock.calls[0][0]
    expect(route).toEqual("/signup")
})
