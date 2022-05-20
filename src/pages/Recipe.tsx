import { useEffect } from "react"
import { useParams } from "react-router"
import { useImmer } from "use-immer"
import apiRecipe from "../api/Recipe"
import PageState, { PageStates } from "../components/PageState"
import { useAuth } from "../hooks/auth"
import RecipeModel from "../models/Recipe"
import LocalView from "./Recipe/LocalView"
import OwnerView from "./Recipe/OwnerView"
import SpecatatorView from "./Recipe/SpectatorView"

interface RecipeProps {
    useLocalView?: boolean
}

const Recipe = ({ useLocalView }: RecipeProps) => {
    if (useLocalView) {
        return <LocalView />
    }
    return <ApiView />
}

export default Recipe

const ApiView = () => {
    const [recipe, setRecipe] = useImmer<null | RecipeModel>(null)
    const [pageState, setPageState] = useImmer(PageStates.ISFETCHING)
    const { user } = useAuth()
    const { id } = useParams()

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

    return (
        <PageState pageState={pageState}>
            {isOwner ? <OwnerView recipe={recipe as RecipeModel} /> : <SpecatatorView recipe={recipe as RecipeModel} />}
        </PageState>
    )
}
