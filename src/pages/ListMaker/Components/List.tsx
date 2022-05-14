import { produce } from "immer"
import { useMemo } from "react"

import Recipe from "../../../components/Recipe"
import RecipeModel from "../../../models/Recipe"
import Qty from "../../../lib/qty"
import EmptyIngrediantsMsg from "../../../components/EmptyIngrediantsMsg"

interface ListProps {
    recipe: RecipeModel
    onChange: (recipe: RecipeModel) => void
    allowEdit?: boolean
    onMakeForChange: (n: number) => void
    makeForQty: number | null
}

const List = ({ recipe, onChange, allowEdit, onMakeForChange, makeForQty }: ListProps) => {
    const handleItemCheck = (idToCheck: string) => {
        const newList = produce(recipe, ({ ingrediants }) => {
            const itemIndex = ingrediants.findIndex(({ id }) => id === idToCheck)
            const item = ingrediants[itemIndex]
            ingrediants.splice(itemIndex, 1)
            const firstCheckedIndex = recipe.firstCheckedIndex
            if (item.checked) {
                item.checked = false
                ingrediants.splice(firstCheckedIndex, 0, item)
            } else {
                const insertAtIndex = firstCheckedIndex === -1 ? ingrediants.length : firstCheckedIndex - 1
                item.checked = true
                ingrediants.splice(insertAtIndex, 0, item)
            }
        })
        onChange(newList)
    }

    const handleItemDelete = (idToDelete: string) => {
        const newList = produce(recipe, ({ ingrediants }) => {
            const index = ingrediants.findIndex(({ id }) => id === idToDelete)
            if (index !== -1) ingrediants.splice(index, 1)
        })
        onChange(newList)
    }

    const handleCheckAll = () => {
        const newList = produce(recipe, ({ ingrediants }) => {
            ingrediants.forEach((i) => (i.checked = true))
        })
        onChange(newList)
    }

    const handleUncheckAll = () => {
        const newList = produce(recipe, ({ ingrediants }) => {
            ingrediants.forEach((i) => (i.checked = false))
        })
        onChange(newList)
    }

    const handleMakeForChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onMakeForChange(Number(e.target.value))
    }

    const visibleRecipe = useMemo(
        () =>
            produce(recipe, (draft) => {
                if (!makeForQty || recipe.serves === makeForQty) {
                    return draft
                }
                draft.ingrediants.forEach((i) => {
                    const newAmount = (i.qty.scalar / recipe.serves) * makeForQty
                    const newQty = Qty(`${newAmount} ${i.qty.units()}`)
                    i.qty = newQty
                })
            }),
        [recipe, makeForQty]
    )

    if (recipe.ingrediants.length === 0) {
        return <EmptyIngrediantsMsg />
    }

    return (
        <Recipe
            list={visibleRecipe.ingrediants}
            onItemDelete={handleItemDelete}
            onItemCheck={handleItemCheck}
            allowEdit={allowEdit}
            onCheckAll={handleCheckAll}
            onUncheckAll={handleUncheckAll}
            makeForQty={makeForQty || recipe.serves}
            onMakeForChange={handleMakeForChange}
        />
    )
}

export default List
