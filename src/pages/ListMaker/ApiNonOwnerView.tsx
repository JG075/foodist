import { useImmer } from "use-immer"

import PageState, { PageStates } from "../../components/PageState"
import IngrediantList from "../../models/IngrediantList"
import List from "./Components/List"
import Name from "./Components/Name"
import Serves from "./Components/Serves"

interface ApiNonOwnerViewProps {
    pageState: PageStates
    ingrediantList: IngrediantList | null
    onChange: (ingrediantList: IngrediantList) => void
}

const ApiNonOwnerView = ({ pageState, ingrediantList, onChange }: ApiNonOwnerViewProps) => {
    const [makeForQty, setMakeForQty] = useImmer<null | number>(null)

    const handleMakeForChange = (value: number) => {
        setMakeForQty(value)
    }

    return (
        <PageState pageState={pageState}>
            <Name ingrediantList={ingrediantList as IngrediantList} onChange={onChange} />
            <Serves ingrediantList={ingrediantList as IngrediantList} />
            <List
                ingrediantList={ingrediantList as IngrediantList}
                onChange={onChange}
                makeForQty={makeForQty}
                onMakeForChange={handleMakeForChange}
            />
        </PageState>
    )
}

export default ApiNonOwnerView
