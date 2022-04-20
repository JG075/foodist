/** @jsxImportSource @emotion/react */
import CircularProgress from "@mui/material/CircularProgress"
import { useEffect } from "react"
import { LoadingButton } from "@mui/lab"
import { useNavigate, useParams } from "react-router-dom"

import apiIngrediantList from "../api/IngrediantList"
import Title from "../components/Title"
import { useImmer } from "../hooks/useImmer"
import IngrediantListsItem from "../components/IngrediantListsItem"
import { useAuth } from "../hooks/auth"
import IngrediantList from "../models/IngrediantList"
import ErrorMsg from "../components/ErrorMsg"
import theme from "../theme"

const Lists = ({ useAuthUser }) => {
    const [errorMessage, setErrorMessage] = useImmer("")
    const [lists, setLists] = useImmer()
    const [isFetching, setIsFetching] = useImmer(false)
    const params = useParams()
    const { user } = useAuth()

    const username = useAuthUser ? user.username : params.username

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

    let renderedListItems = null
    if (lists) {
        const items = lists.map((l) => {
            const to = `/users/${username}/lists/${l.id}`
            return <IngrediantListsItem key={l.id} name={l.displayName} to={to} />
        })
        renderedListItems = items.length > 0 ? <ul css={{ padding: 0, width: "100%" }}>{items}</ul> : []
    }

    if (useAuthUser) {
        return <UseAuthView user={user} lists={renderedListItems} errorMessage={errorMessage} isFetching={isFetching} />
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
            {lists?.length === 0 && (
                <div css={{ marginTop: 20, fontSize: 18, color: theme.palette.primary.main }}>{emptyMsg}</div>
            )}
            {lists}
        </>
    )
}

const DefaultView = ({ username, lists, errorMessage, isFetching }) => {
    return (
        <div>
            <Title>{username}'s Lists</Title>
            {(errorMessage && <ErrorMsg>{errorMessage}</ErrorMsg>) || (
                <ListItems
                    lists={lists}
                    emptyMsg="This user does not have any lists to show."
                    isFetching={isFetching}
                />
            )}
        </div>
    )
}

const UseAuthView = ({ user, lists, errorMessage, isFetching }) => {
    const [isCreatingList, setIsCreatingList] = useImmer(false)
    const [newListError, setNewListError] = useImmer("")
    const navigate = useNavigate()

    const handleOnClick = async () => {
        setIsCreatingList(true)
        const newIngrediantList = new IngrediantList({ authorId: user.username })
        try {
            const res = await apiIngrediantList.post(newIngrediantList)
            navigate(`/users/${user.username}/lists/${res.id}`)
        } catch (error) {
            setNewListError("Sorry something went wrong.")
        }
        setIsCreatingList(false)
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
                css={{ marginBottom: 10 }}
                color="secondary"
                variant="contained"
                size="medium"
                onClick={handleOnClick}
                loading={isCreatingList}
            >
                Create List
            </LoadingButton>
            <ErrorMsg css={{ marginBottom: 10 }}>{newListError}</ErrorMsg>
            {(errorMessage && <ErrorMsg>{errorMessage}</ErrorMsg>) || (
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
