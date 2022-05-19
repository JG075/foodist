import ApiView from "./Recipe/ApiView"
import LocalView from "./Recipe/LocalView"

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
