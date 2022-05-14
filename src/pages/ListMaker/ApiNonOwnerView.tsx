import { useEffect, useRef } from "react"
import { produce } from "immer"
import { useImmer } from "use-immer"

import Ingrediant from "../../models/Ingrediant"
import Recipe from "../../models/Recipe"
import List from "./Components/List"
import Name from "./Components/Name"
import Serves from "./Components/Serves"
import useLocalState from "../../hooks/useLocalState"
import { mergeWith, omit } from "lodash"
import PageState, { PageStates } from "../../components/PageState"
import Extras from "./Components/Extras"

interface ApiNonOwnerViewProps {
    recipe: Recipe
}

const ApiNonOwnerView = ({ recipe }: ApiNonOwnerViewProps) => {
    const [makeForQty, setMakeForQty] = useImmer<null | number>(null)
    const localStorageKey = recipe ? `recipe-${recipe?.id}` : ""
    const [localList, setLocalList] = useLocalState<null | Recipe>(null, localStorageKey, Recipe)
    const [pageState, setPageState] = useImmer(PageStates.ISFETCHING)
    const hasCreateLocalList = useRef(false)

    useEffect(() => {
        if (hasCreateLocalList.current) {
            return
        }
        if (!localList) {
            const localCopy = produce(recipe, ({ ingrediants }: { ingrediants: Ingrediant[] }) => {
                ingrediants.forEach((i) => {
                    i.checked = false
                })
            })
            setLocalList(localCopy)
        } else {
            const mergedCopy = produce(localList, (draft) => {
                const newItems: Ingrediant[] = recipe.ingrediants
                    .filter((i) => !localList.ingrediants.find((li) => li.id === i.id))
                    .map((i) => {
                        i.checked = false
                        return i
                    })
                draft.ingrediants.unshift(...newItems)

                const removedItems = draft.ingrediants.filter((i) => !recipe.ingrediants.find((li) => li.id === i.id))
                removedItems.forEach((i) => {
                    draft.ingrediants.splice(
                        draft.ingrediants.findIndex((li) => li.id === i.id),
                        1
                    )
                })

                const merged = mergeWith(draft, omit(recipe, "ingrediants"))
                return merged
            })
            setLocalList(mergedCopy)
        }
        setPageState(PageStates.READY)
        hasCreateLocalList.current = true
    }, [recipe, localList, setLocalList, setPageState])

    const onListChange = (recipe: Recipe) => {
        setLocalList(recipe)
    }

    const handleMakeForChange = (value: number) => {
        setMakeForQty(value)
    }

    return (
        <PageState pageState={pageState}>
            {localList && (
                <>
                    <Name recipe={localList} />
                    <Extras recipe={recipe} />
                    <Serves recipe={localList} />
                    <List
                        recipe={localList}
                        onChange={onListChange}
                        makeForQty={makeForQty}
                        onMakeForChange={handleMakeForChange}
                    />
                </>
            )}
        </PageState>
    )
}

export default ApiNonOwnerView
