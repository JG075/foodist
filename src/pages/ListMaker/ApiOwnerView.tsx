/** @jsxImportSource @emotion/react */
import { useRef } from "react"
import { useNavigate } from "react-router-dom"
import { useImmer } from "use-immer"
import debounce from "lodash/debounce"

import PageState, { PageStates } from "../../components/PageState"
import IngrediantList from "../../models/IngrediantList"
import ListSaveStatus, { ListSaveStates } from "../../components/ListSaveStatus"
import apiIngrediantList from "../../api/IngrediantList"
import DeleteListButton from "../../components/DeleteListButton"
import DeleteListDialog from "../../components/DeleteListDialog"
import Name from "./Components/Name"
import Serves from "./Components/Serves"
import Adder from "./Components/Adder"
import List from "./Components/List"

interface ApiOwnerViewProps {
    pageState: PageStates
    ingrediantList: IngrediantList | null
    onChange: (ingrediantList: IngrediantList) => void
}

const ApiOwnerView = ({ pageState, ingrediantList, onChange }: ApiOwnerViewProps) => {
    const [saveState, setSaveState] = useImmer(ListSaveStates.SAVED)
    const [isDeleting, setIsDeleting] = useImmer(false)
    const [showConfirmModal, setShowConfirmModal] = useImmer(false)
    const [deleteErrMsg, setDeleteErrMsg] = useImmer("")
    const [makeForQty, setMakeForQty] = useImmer<number | null>(null)
    const navigate = useNavigate()

    const apiUpdate = debounce(async (newIngrediantList) => {
        setSaveState(ListSaveStates.SAVING)
        try {
            await apiIngrediantList.patch(newIngrediantList)
            setSaveState(ListSaveStates.SAVED)
        } catch (error) {
            setSaveState(ListSaveStates.ERROR)
        }
    }, 500)

    const apiUpdateRef = useRef(apiUpdate)

    const handleOnChange = (newIngrediantList: IngrediantList) => {
        onChange(newIngrediantList)
        apiUpdateRef.current(newIngrediantList)
    }

    const handleOnDelete = async () => {
        if (!isDeleting) {
            setIsDeleting(true)
            try {
                await apiIngrediantList.remove(ingrediantList!.id)
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

    const handleServesChange = (ingrediantList: IngrediantList) => {
        setMakeForQty(ingrediantList.serves)
        handleOnChange(ingrediantList)
    }

    const handleMakeForChange = (value: number) => {
        setMakeForQty(value)
    }

    return (
        <PageState pageState={pageState}>
            <div
                css={{
                    display: "flex",
                    justifyContent: "end",
                    marginTop: -20,
                }}
            >
                <ListSaveStatus saveState={saveState} />
                <DeleteListButton onClick={handleDeleteClick} sx={{ marginLeft: "10px" }} />
                <DeleteListDialog
                    isOpen={showConfirmModal}
                    onClose={handleConfirmClose}
                    onDelete={handleOnDelete}
                    isDeleting={isDeleting}
                    errorMsg={deleteErrMsg}
                />
            </div>
            <Name ingrediantList={ingrediantList as IngrediantList} onChange={handleOnChange} allowEdit />
            <Serves ingrediantList={ingrediantList as IngrediantList} onChange={handleServesChange} allowEdit />
            <Adder ingrediantList={ingrediantList as IngrediantList} onChange={handleOnChange} />
            <List
                ingrediantList={ingrediantList as IngrediantList}
                onChange={handleOnChange}
                onMakeForChange={handleMakeForChange}
                makeForQty={makeForQty}
                allowEdit
            />
        </PageState>
    )
}

export default ApiOwnerView
