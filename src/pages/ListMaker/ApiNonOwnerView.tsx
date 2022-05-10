import { useEffect, useRef } from "react"
import { produce } from "immer"
import { useImmer } from "use-immer"

import Ingrediant from "../../models/Ingrediant"
import IngrediantList from "../../models/IngrediantList"
import List from "./Components/List"
import Name from "./Components/Name"
import Serves from "./Components/Serves"
import useLocalState from "../../hooks/useLocalState"
import { mergeWith, omit } from "lodash"
import PageState, { PageStates } from "../../components/PageState"

interface ApiNonOwnerViewProps {
    ingrediantList: IngrediantList
}

const ApiNonOwnerView = ({ ingrediantList }: ApiNonOwnerViewProps) => {
    const [makeForQty, setMakeForQty] = useImmer<null | number>(null)
    const localStorageKey = ingrediantList ? `ingrediantList-${ingrediantList?.id}` : ""
    const [localList, setLocalList] = useLocalState<null | IngrediantList>(null, localStorageKey, IngrediantList)
    const [pageState, setPageState] = useImmer(PageStates.ISFETCHING)
    const hasCreateLocalList = useRef(false)

    useEffect(() => {
        if (hasCreateLocalList.current) {
            return
        }
        if (!localList) {
            const localCopy = produce(ingrediantList, ({ ingrediants }: { ingrediants: Ingrediant[] }) => {
                ingrediants.forEach((i) => {
                    i.checked = false
                })
            })
            setLocalList(localCopy)
        } else {
            const mergedCopy = produce(localList, (draft) => {
                const newItems: Ingrediant[] = ingrediantList.ingrediants
                    .filter((i) => !localList.ingrediants.find((li) => li.id === i.id))
                    .map((i) => {
                        i.checked = false
                        return i
                    })
                draft.ingrediants.unshift(...newItems)

                const removedItems = draft.ingrediants.filter(
                    (i) => !ingrediantList.ingrediants.find((li) => li.id === i.id)
                )
                removedItems.forEach((i) => {
                    draft.ingrediants.splice(
                        draft.ingrediants.findIndex((li) => li.id === i.id),
                        1
                    )
                })

                const merged = mergeWith(draft, omit(ingrediantList, "ingrediants"))
                return merged
            })
            setLocalList(mergedCopy)
        }
        setPageState(PageStates.READY)
        hasCreateLocalList.current = true
    }, [ingrediantList, localList, setLocalList, setPageState])

    const onListChange = (ingrediantList: IngrediantList) => {
        setLocalList(ingrediantList)
    }

    const handleMakeForChange = (value: number) => {
        setMakeForQty(value)
    }

    return (
        <PageState pageState={pageState}>
            {localList && (
                <>
                    <Name ingrediantList={localList} onChange={onListChange} />
                    <Serves ingrediantList={localList} />
                    <List
                        ingrediantList={localList}
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
