import { useEffect } from "react"
import { useParams } from "react-router-dom"
import { useImmer } from "use-immer"

import apiIngrediantList from "../../api/IngrediantList"
import PageState, { PageStates } from "../../components/PageState"
import { useAuth } from "../../hooks/auth"
import IngrediantList from "../../models/IngrediantList"
import ApiNonOwnerView from "./ApiNonOwnerView"
import ApiOwnerView from "./ApiOwnerView"

const ApiView = () => {
    const [ingrediantList, setIngrediantList] = useImmer<null | IngrediantList>(null)
    const [pageState, setPageState] = useImmer(PageStates.ISFETCHING)
    const { user } = useAuth()
    const { id } = useParams()

    const handleOnChange = (list: IngrediantList) => setIngrediantList(list)

    useEffect(() => {
        const fetchList = async () => {
            setPageState(PageStates.ISFETCHING)
            try {
                const res = await apiIngrediantList.getSingle({ id: id as string })
                if (res) {
                    setIngrediantList(res)
                    setPageState(PageStates.READY)
                } else {
                    setPageState(PageStates.NOTFOUND)
                }
            } catch (error) {
                setPageState(PageStates.HASERROR)
            }
        }
        fetchList()
    }, [id, setIngrediantList, setPageState])

    let isOwner = false
    if (ingrediantList && user?.username) {
        isOwner = ingrediantList.belongsTo(user.username)
    }

    let component = null
    if (isOwner) {
        component = <ApiOwnerView ingrediantList={ingrediantList as IngrediantList} onChange={handleOnChange} />
    } else {
        component = <ApiNonOwnerView ingrediantList={ingrediantList as IngrediantList} />
    }
    return <PageState pageState={pageState}>{component}</PageState>
}

export default ApiView
