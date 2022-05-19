import { useEffect } from "react"
import { useParams } from "react-router-dom"
import { useImmer } from "use-immer"

import apiRecipe from "../../api/Recipe"
import PageState, { PageStates } from "../../components/PageState"
import { useAuth } from "../../hooks/auth"
import Recipe from "../../models/Recipe"
import ApiNonOwnerView from "./ApiNonOwnerView"
import ApiOwnerView from "./ApiOwnerView"

const ApiView = () => {
    const [recipe, setRecipe] = useImmer<null | Recipe>(null)
    const [pageState, setPageState] = useImmer(PageStates.ISFETCHING)
    const { user } = useAuth()
    const { id } = useParams()

    const handleOnChange = (list: Recipe) => setRecipe(list)

    useEffect(() => {
        const fetchList = async () => {
            setPageState(PageStates.ISFETCHING)
            try {
                const res = await apiRecipe.getSingle({ id: id as string })
                if (res) {
                    setRecipe(res)
                    setPageState(PageStates.READY)
                } else {
                    setPageState(PageStates.NOTFOUND)
                }
            } catch (error) {
                setPageState(PageStates.HASERROR)
            }
        }
        fetchList()
    }, [id, setRecipe, setPageState])

    let isOwner = false
    if (recipe && user?.username) {
        isOwner = recipe.belongsTo(user.username)
    }

    let component = null
    if (isOwner) {
        component = <ApiOwnerView recipe={recipe as Recipe} onChange={handleOnChange} />
    } else {
        component = <ApiNonOwnerView recipe={recipe as Recipe} />
    }
    return <PageState pageState={pageState}>{component}</PageState>
}

export default ApiView
