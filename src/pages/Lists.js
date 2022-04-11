/** @jsxImportSource @emotion/react */
import CircularProgress from "@mui/material/CircularProgress"
import { useEffect } from "react"
import { useParams } from "react-router-dom"

import apiIngrediantList from "../api/IngrediantList"
import Title from "../components/Title"
import { useImmer } from "../hooks/useImmer"
import IngrediantListsItem from "../components/IngrediantListsItem"

const Lists = (props) => {
    const [errorMessage, setErrorMessage] = useImmer("")
    const [lists, setLists] = useImmer()
    const { username } = useParams()

    useEffect(() => {
        apiIngrediantList
            .getAll({ authorId: username })
            .then((result) => {
                setLists(result)
            })
            .catch((e) => {
                if (e.response.status === 404) {
                    setErrorMessage("Sorry the user was not found.")
                } else {
                    setErrorMessage("Sorry something went wrong.")
                }
            })
    }, [username, setLists, setErrorMessage])

    let renderedListItems = null
    if (lists && lists.length > 0) {
        const items = lists.map((l) => {
            const to = `/users/${username}/lists/${l.id}`
            return <IngrediantListsItem key={l.id} name={l.name} to={to} />
        })
        renderedListItems = <ul css={{ padding: 0 }}>{items}</ul>
    }

    return (
        <div>
            <Title>{`${username}'s`} Lists</Title>
            {!lists && <CircularProgress />}
            {lists && lists.length === 0 && "This user does not have any lists to show."}
            {errorMessage}
            {renderedListItems}
        </div>
    )
}

export default Lists
