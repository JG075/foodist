import LoadingButton from "@mui/lab/LoadingButton"
import { useNavigate } from "react-router-dom"
import { useImmer } from "use-immer"

import useLocalState from "../../hooks/useLocalState"
import IngrediantList from "../../models/IngrediantList"
import Adder from "./Components/Adder"
import List from "./Components/List"
import Name from "./Components/Name"
import Serves from "./Components/Serves"

const LocalView = () => {
    const [ingrediantList, setIngrediantList] = useLocalState(new IngrediantList({}), "ingrediant-list")
    const navigate = useNavigate()
    const [makeForQty, setMakeForQty] = useImmer<number | null>(null)

    const handlePublish = async () => navigate("/signup")

    const handleOnChange = (list: IngrediantList) => setIngrediantList(list)

    const handleServesChange = (ingrediantList: IngrediantList) => {
        setMakeForQty(ingrediantList.serves)
        handleOnChange(ingrediantList)
    }

    const handleMakeForChange = (value: number) => {
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

export default LocalView
