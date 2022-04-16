/** @jsxImportSource @emotion/react */
import CircularProgress from "@mui/material/CircularProgress"
import { useEffect } from "react"

import apiIngrediantList from "../api/IngrediantList"
import Title from "../components/Title"
import { useImmer } from "../hooks/useImmer"
import IngrediantListsItem from "../components/IngrediantListsItem"
import { LoadingButton } from "@mui/lab"
import { useParams } from "react-router-dom"
import { useAuth } from "../hooks/auth"

const Lists = () => {
    const [errorMessage, setErrorMessage] = useImmer("")
    const [lists, setLists] = useImmer()
    const [isFetching, setIsFetching] = useImmer(false)
    const params = useParams()
    const { user } = useAuth()

    const username = user ? user.username : params.username

    useEffect(() => {
        const fetchData = async () => {
            setIsFetching(true)
            try {
                const result = await apiIngrediantList.getAll({ authorId: username })
                setLists(result)
            } catch (error) {
                if (error.response.status === 404) {
                    setErrorMessage("Sorry the user was not found.")
                } else {
                    setErrorMessage("Sorry something went wrong.")
                }
            }
            setIsFetching(false)
        }
        fetchData()
    }, [username, setIsFetching, setLists, setErrorMessage])

    let renderedListItems = []
    if (lists && lists.length > 0) {
        const items = lists.map((l) => {
            const to = `/users/${username}/lists/${l.id}`
            return <IngrediantListsItem key={l.id} name={l.name} to={to} />
        })
        renderedListItems = <ul css={{ padding: 0, width: "100%" }}>{items}</ul>
    }

    if (user) {
        return (
            <LoggedInView user={user} lists={renderedListItems} errorMessage={errorMessage} isFetching={isFetching} />
        )
    }
    return (
        <DefaultView
            username={username}
            lists={renderedListItems}
            errorMessage={errorMessage}
            isFetching={isFetching}
        />
    )
}

const ListItems = ({ lists, emptyMsg, isFetching }) => {
    return (
        <>
            {isFetching && <CircularProgress />}
            {lists && lists.length === 0 && emptyMsg}
            {lists}
        </>
    )
}

const DefaultView = ({ username, lists, errorMessage, isFetching }) => {
    return (
        <div>
            <Title>{username}'s Lists</Title>
            {errorMessage || (
                <ListItems
                    lists={lists}
                    emptyMsg="This user does not have any lists to show."
                    isFetching={isFetching}
                />
            )}
        </div>
    )
}

const LoggedInView = ({ user, lists, errorMessage, isFetching }) => {
    const handleOnClick = () => {
        // call api to create a new list
        // redirect to that list id
    }

    return (
        <div
            css={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
            }}
        >
            <Title>My Lists</Title>
            <LoadingButton
                css={{ marginBottom: 20 }}
                color="secondary"
                variant="contained"
                size="medium"
                onClick={handleOnClick}
            >
                Create List
            </LoadingButton>
            {errorMessage || (
                <ListItems
                    lists={lists}
                    emptyMsg="You don't have any lists to show. Make one!"
                    isFetching={isFetching}
                />
            )}
        </div>
    )
}

export default Lists
