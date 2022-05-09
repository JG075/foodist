import { ReactNode } from "react"

import PageState, { PageStates } from "../../components/PageState"
import Title from "../../components/Title"
import ListItems from "./Components/ListItems"

interface DefaultViewProps {
    username: string
    lists: ReactNode | null
    pageState: PageStates
}

const DefaultView = ({ username, lists, pageState }: DefaultViewProps) => {
    return (
        <PageState pageState={pageState}>
            <Title>{username}'s Lists</Title>
            <ListItems lists={lists} emptyMsg="This user does not have any lists to show." />
        </PageState>
    )
}

export default DefaultView
