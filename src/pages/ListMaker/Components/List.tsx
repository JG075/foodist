import { produce } from "immer"
import { useMemo } from "react"

import IngrediantList from "../../../components/IngrediantList"
import IngrediantListModel from "../../../models/IngrediantList"
import Qty from "../../../lib/qty"
import EmptyIngrediantsMsg from "../../../components/EmptyIngrediantsMsg"

interface ListProps {
    ingrediantList: IngrediantListModel
    onChange: (ingrediantList: IngrediantListModel) => void
    allowEdit?: boolean
    onMakeForChange: (n: number) => void
    makeForQty: number | null
}

const List = ({ ingrediantList, onChange, allowEdit, onMakeForChange, makeForQty }: ListProps) => {
    const handleItemCheck = (idToCheck: string) => {
        const newList = produce(ingrediantList, ({ ingrediants }) => {
            const itemIndex = ingrediants.findIndex(({ id }) => id === idToCheck)
            const item = ingrediants[itemIndex]
            ingrediants.splice(itemIndex, 1)
            const firstCheckedIndex = ingrediantList.firstCheckedIndex
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
        const newList = produce(ingrediantList, ({ ingrediants }) => {
            const index = ingrediants.findIndex(({ id }) => id === idToDelete)
            if (index !== -1) ingrediants.splice(index, 1)
        })
        onChange(newList)
    }

    const handleCheckAll = () => {
        const newList = produce(ingrediantList, ({ ingrediants }) => {
            ingrediants.forEach((i) => (i.checked = true))
        })
        onChange(newList)
    }

    const handleUncheckAll = () => {
        const newList = produce(ingrediantList, ({ ingrediants }) => {
            ingrediants.forEach((i) => (i.checked = false))
        })
        onChange(newList)
    }

    const handleMakeForChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onMakeForChange(Number(e.target.value))
    }

    const visibleIngrediantList = useMemo(
        () =>
            produce(ingrediantList, (draft) => {
                if (!makeForQty || ingrediantList.serves === makeForQty) {
                    return draft
                }
                draft.ingrediants.forEach((i) => {
                    const newAmount = (i.qty.scalar / ingrediantList.serves) * makeForQty
                    const newQty = Qty(`${newAmount} ${i.qty.units()}`)
                    i.qty = newQty
                })
            }),
        [ingrediantList, makeForQty]
    )

    if (ingrediantList.ingrediants.length === 0) {
        return <EmptyIngrediantsMsg />
    }

    return (
        <IngrediantList
            list={visibleIngrediantList.ingrediants}
            onItemDelete={handleItemDelete}
            onItemCheck={handleItemCheck}
            allowEdit={allowEdit}
            onCheckAll={handleCheckAll}
            onUncheckAll={handleUncheckAll}
            makeForQty={makeForQty || ingrediantList.serves}
            onMakeForChange={handleMakeForChange}
        />
    )
}

export default List
