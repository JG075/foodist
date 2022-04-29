/** @jsxImportSource @emotion/react */
import { useNavigate, useParams } from "react-router-dom"
import LoadingButton from "@mui/lab/LoadingButton"
import { produce } from "immer"
import { useEffect, useMemo, useRef } from "react"
import debounce from "lodash/debounce"

import IngrediantAdder from "../components/IngrediantAdder"
import IngrediantList from "../components/IngrediantList"
import IngrediantListName from "../components/IngrediantListName"
import ingrediantParser from "../helpers/ingrediantParser"
import useLocalState from "../hooks/useLocalState"
import { useImmer } from "../hooks/useImmer"
import ModelIngrediant from "../models/Ingrediant"
import ModelIngrediantList from "../models/IngrediantList"
import { useAuth } from "../hooks/auth"
import apiIngrediantList from "../api/IngrediantList"
import PageState, { PageStates } from "../components/PageState"
import ListSaveStatus, { ListSaveStates } from "../components/ListSaveStatus"
import DeleteListButton from "../components/DeleteListButton"
import DeleteListDialog from "../components/DeleteListDialog"
import EmptyIngrediantsMsg from "../components/EmptyIngrediantsMsg"
import ServesInput from "../components/ServesInput"
import Qty from "../lib/qty"

const List = ({ ingrediantList, onChange, allowEdit, onMakeForChange, makeForQty }) => {
    const handleItemCheck = (idToCheck) => {
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

    const handleItemDelete = (idToDelete) => {
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

    const handleMakeForChange = (e) => {
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
                    const newQty = Qty(i.qty)
                    newQty.scalar = newAmount
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

const Adder = ({ ingrediantList, onChange }) => {
    const [ingrediantInput, setingrediantInput] = useImmer("", "ingrediant-input")
    const [error, setError] = useImmer("")

    const handleOnChange = (e) => setingrediantInput(e.target.value)

    const handleOnSubmit = (e) => {
        e.preventDefault()
        let parsedIngrediant = null
        try {
            parsedIngrediant = ingrediantParser(ingrediantInput)
        } catch (err) {
            if (err.name === "QtyError") {
                setError("You have entered an invalid measurement unit.")
            } else {
                setError("Please enter an ingrediant name and optionally a quantity.")
            }
            return
        }
        const newIngrediant = new ModelIngrediant(parsedIngrediant)
        const newList = produce(ingrediantList, ({ ingrediants }) => {
            ingrediants.unshift(newIngrediant)
        })
        onChange(newList)
        setingrediantInput("")
        setError("")
    }

    return (
        <IngrediantAdder
            value={ingrediantInput}
            onChange={handleOnChange}
            onSubmit={handleOnSubmit}
            error={!!error}
            helperText={error}
        />
    )
}

const Name = ({ ingrediantList, onChange, allowEdit, sx }) => {
    const handleListNameChange = (e) => {
        const newList = produce(ingrediantList, (draft) => {
            draft.name = e.target.value
        })
        onChange(newList)
    }

    const value = allowEdit ? ingrediantList.name : ingrediantList.displayName

    return (
        <IngrediantListName
            sx={{ width: "100%", ...sx }}
            value={value}
            onChange={handleListNameChange}
            disabled={!allowEdit}
        />
    )
}

const Serves = ({ ingrediantList, onChange, allowEdit }) => {
    const [serves, setServes] = useImmer(ingrediantList.serves.toString())

    const handleOnChange = (e) => {
        setServes(e.target.value)
        if (!e.target.value || e.target.value < 1) {
            return
        }
        const newList = produce(ingrediantList, (draft) => {
            draft.serves = Number(e.target.value)
        })
        onChange(newList)
    }

    return <ServesInput amount={serves} onChange={handleOnChange} disabled={!allowEdit} />
}

const LocalListView = () => {
    const [ingrediantList, setIngrediantList] = useLocalState(new ModelIngrediantList({}), "ingrediant-list")
    const navigate = useNavigate()
    const [makeForQty, setMakeForQty] = useImmer()

    const handlePublish = async (e) => navigate("/signup")

    const handleOnChange = (list) => setIngrediantList(list)

    const handleServesChange = (ingrediantList) => {
        setMakeForQty(ingrediantList.serves)
        handleOnChange(ingrediantList)
    }

    const handleMakeForChange = (value) => {
        setMakeForQty(value)
    }

    return (
        <>
            <Name ingrediantList={ingrediantList} onChange={handleOnChange} allowEdit />
            <Serves ingrediantList={ingrediantList} onChange={handleServesChange} allowEdit />
            <LoadingButton
                sx={{
                    margin: "20px auto 0",
                    width: "108px",
                    display: "block",
                }}
                color="secondary"
                variant="contained"
                size="medium"
                onClick={handlePublish}
            >
                Publish
            </LoadingButton>
            <Adder ingrediantList={ingrediantList} onChange={handleOnChange} />
            <List
                ingrediantList={ingrediantList}
                onChange={handleOnChange}
                onMakeForChange={handleMakeForChange}
                makeForQty={makeForQty}
                allowEdit
            />
        </>
    )
}

const ApiOwnerView = ({ pageState, ingrediantList, onChange }) => {
    const [saveState, setSaveState] = useImmer(false)
    const [isDeleting, setIsDeleting] = useImmer(false)
    const [showConfirmModal, setShowConfirmModal] = useImmer(false)
    const [deleteErrMsg, setDeleteErrMsg] = useImmer("")
    const [makeForQty, setMakeForQty] = useImmer()
    const navigate = useNavigate()

    const apiUpdate = debounce(async (newIngrediantList) => {
        setSaveState(ListSaveStates.saving)
        try {
            await apiIngrediantList.patch(newIngrediantList)
            setSaveState(ListSaveStates.saved)
        } catch (error) {
            setSaveState(ListSaveStates.error)
        }
    }, 500)

    const apiUpdateRef = useRef(apiUpdate)

    const handleOnChange = (newIngrediantList) => {
        onChange(newIngrediantList)
        apiUpdateRef.current(newIngrediantList)
    }

    const handleOnDelete = async () => {
        if (!isDeleting) {
            setIsDeleting(true)
            try {
                await apiIngrediantList.remove(ingrediantList.id)
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

    const handleServesChange = (ingrediantList) => {
        setMakeForQty(ingrediantList.serves)
        handleOnChange(ingrediantList)
    }

    const handleMakeForChange = (value) => {
        setMakeForQty(value)
    }

    return (
        <PageState pageState={pageState} addMarginTop>
            <div
                css={{
                    display: "flex",
                    justifyContent: "end",
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
            <Name ingrediantList={ingrediantList} onChange={handleOnChange} allowEdit />
            <Serves ingrediantList={ingrediantList} onChange={handleServesChange} allowEdit />
            <Adder ingrediantList={ingrediantList} onChange={handleOnChange} />
            <List
                ingrediantList={ingrediantList}
                onChange={handleOnChange}
                onMakeForChange={handleMakeForChange}
                makeForQty={makeForQty}
                allowEdit
            />
        </PageState>
    )
}

const ApiNonOwnerView = ({ pageState, ingrediantList, onChange }) => {
    const [makeForQty, setMakeForQty] = useImmer()

    const handleMakeForChange = (value) => {
        setMakeForQty(value)
    }

    return (
        <PageState pageState={pageState} addMarginTop>
            <Name ingrediantList={ingrediantList} onChange={onChange} />
            <Serves ingrediantList={ingrediantList} />
            <List
                ingrediantList={ingrediantList}
                onChange={onChange}
                makeForQty={makeForQty}
                onMakeForChange={handleMakeForChange}
            />
        </PageState>
    )
}

const ApiView = () => {
    const [ingrediantList, setIngrediantList] = useImmer()
    const [pageState, setPageState] = useImmer(PageStates.isFetching)
    const { user } = useAuth()
    const { id } = useParams()

    const handleOnChange = (list) => setIngrediantList(list)

    useEffect(() => {
        const fetchList = async () => {
            setPageState(PageStates.isFetching)
            try {
                const res = await apiIngrediantList.getSingle({ id })
                if (res) {
                    setIngrediantList(res)
                    setPageState(PageStates.allOk)
                } else {
                    setPageState(PageStates.notFound)
                }
            } catch (error) {
                setPageState(PageStates.hasError)
            }
        }
        fetchList()
    }, [id, setIngrediantList, setPageState])

    const isOwner = ingrediantList?.belongsTo(user?.username)
    if (isOwner) {
        return <ApiOwnerView pageState={pageState} ingrediantList={ingrediantList} onChange={handleOnChange} />
    }
    return <ApiNonOwnerView pageState={pageState} ingrediantList={ingrediantList} onChange={handleOnChange} />
}

const ListMaker = ({ useLocalView }) => {
    if (useLocalView) {
        return <LocalListView />
    }
    return <ApiView />
}

export default ListMaker
