/** @jsxImportSource @emotion/react */
import { useRef } from "react"
import { useNavigate } from "react-router-dom"
import { useImmer } from "use-immer"
import debounce from "lodash/debounce"

import Recipe from "../../models/Recipe"
import ListSaveStatus, { ListSaveStates } from "../../components/ListSaveStatus"
import apiRecipe from "../../api/Recipe"
import DeleteListButton from "../../components/DeleteRecipeButton"
import DeleteRecipeDialog from "../../components/DeleteRecipeDialog"
import Name from "./Components/Name"
import Serves from "./Components/Serves"
import Adder from "./Components/Adder"
import List from "./Components/List"
import { mq } from "../../sharedStyles"
import Extras from "./Components/Extras"
import DeleteRecipeButton from "../../components/DeleteRecipeButton"

interface ApiOwnerViewProps {
    recipe: Recipe
    onChange: (recipe: Recipe) => void
}

const ApiOwnerView = ({ recipe, onChange }: ApiOwnerViewProps) => {
    const [saveState, setSaveState] = useImmer(ListSaveStates.SAVED)
    const [isDeleting, setIsDeleting] = useImmer(false)
    const [showConfirmModal, setShowConfirmModal] = useImmer(false)
    const [deleteErrMsg, setDeleteErrMsg] = useImmer("")
    const [makeForQty, setMakeForQty] = useImmer<number | null>(null)
    const navigate = useNavigate()

    const apiUpdate = debounce(async (newRecipe) => {
        setSaveState(ListSaveStates.SAVING)
        try {
            await apiRecipe.patch(newRecipe)
            setSaveState(ListSaveStates.SAVED)
        } catch (error) {
            setSaveState(ListSaveStates.ERROR)
        }
    }, 500)

    const apiUpdateRef = useRef(apiUpdate)

    const handleOnChange = (newRecipe: Recipe) => {
        onChange(newRecipe)
        apiUpdateRef.current(newRecipe)
    }

    const handleOnDelete = async () => {
        if (!isDeleting) {
            setIsDeleting(true)
            try {
                await apiRecipe.remove(recipe!.id)
                navigate("/")
            } catch (error) {
                setDeleteErrMsg("Sorry something went wrong.")
                setIsDeleting(false)
            }
        }
    }

    const handleDeleteClick = () => setShowConfirmModal(true)

    const handleConfirmClose = () => {
        setShowConfirmModal(false)
        setDeleteErrMsg("")
    }

    const handleServesChange = (recipe: Recipe) => {
        setMakeForQty(recipe.serves)
        handleOnChange(recipe)
    }

    const handleMakeForChange = (value: number) => {
        setMakeForQty(value)
    }

    return (
        <>
            <div
                css={{
                    display: "flex",
                    justifyContent: "end",
                    marginBottom: 10,
                    [mq[0]]: {
                        marginTop: -20,
                    },
                }}
            >
                <ListSaveStatus saveState={saveState} />
                <DeleteRecipeButton onClick={handleDeleteClick} sx={{ marginLeft: "10px" }} />
                <DeleteRecipeDialog
                    isOpen={showConfirmModal}
                    onClose={handleConfirmClose}
                    onDelete={handleOnDelete}
                    isDeleting={isDeleting}
                    errorMsg={deleteErrMsg}
                />
            </div>
            <Name recipe={recipe} onChange={handleOnChange} allowEdit />
            <Extras recipe={recipe} onChange={handleOnChange} allowEdit />
            <Serves recipe={recipe} onChange={handleServesChange} allowEdit />
            <Adder recipe={recipe} onChange={handleOnChange} />
            <List
                recipe={recipe}
                onChange={handleOnChange}
                onMakeForChange={handleMakeForChange}
                makeForQty={makeForQty}
                allowEdit
            />
        </>
    )
}

export default ApiOwnerView
