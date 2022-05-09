import ApiView from "./ListMaker/ApiView"
import LocalView from "./ListMaker/LocalView"

interface ListMakerProps {
    useLocalView?: boolean
}

const ListMaker = ({ useLocalView }: ListMakerProps) => {
    if (useLocalView) {
        return <LocalView />
    }
    return <ApiView />
}

export default ListMaker
