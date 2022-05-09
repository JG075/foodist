/** @jsxImportSource @emotion/react */
import { ReactNode, useEffect } from "react"
import { useParams } from "react-router-dom"

import IngrediantListsItem from "../components/IngrediantListsItem"
import apiIngrediantList from "../api/IngrediantList"
import { useImmer } from "use-immer"
import IngrediantList from "../models/IngrediantList"
import AuthView from "./Lists/AuthView"
import DefaultView from "./Lists/DefaultView"
import { PageStates } from "../components/PageState"
import User from "../models/User"
import { handleNonAxiosError } from "../helpers/handleAxiosError"

interface ListsProps {
    user?: User
}

const Lists = ({ user }: ListsProps) => {
    const [lists, setLists] = useImmer<IngrediantList[] | null>(null)
    const [pageState, setPageState] = useImmer(PageStates.ISFETCHING)
    const params = useParams()
    const paramsUsername = params.username as string
    const username = user ? user.username : paramsUsername

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await apiIngrediantList.getAll({ authorId: username })
                setLists(result)
                setPageState(PageStates.READY)
            } catch (err) {
                const error = handleNonAxiosError(err)
                if (error?.response?.status === 404) {
                    setPageState(PageStates.NOTFOUND)
                } else {
                    setPageState(PageStates.HASERROR)
                }
            }
        }
        fetchData()
    }, [username, setPageState, setLists])

    let renderedListItems: ReactNode | null = null
    if (lists) {
        const items = lists.map((l) => {
            const to = `/users/${username}/lists/${l.id}`
            return <IngrediantListsItem key={l.id} name={l.displayName} to={to} />
        })
        renderedListItems = items.length > 0 ? <ul css={{ padding: 0, width: "100%" }}>{items}</ul> : null
    }

    if (user) {
        return <AuthView user={user} lists={renderedListItems} pageState={pageState} />
    }
    return <DefaultView username={paramsUsername} lists={renderedListItems} pageState={pageState} />
}

export default Lists
