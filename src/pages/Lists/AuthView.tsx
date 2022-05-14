/** @jsxImportSource @emotion/react */
import { LoadingButton } from "@mui/lab"
import { useNavigate } from "react-router-dom"
import { useImmer } from "use-immer"
import { ReactNode } from "react"

import apiRecipe from "../../api/Recipe"
import ErrorMsg from "../../components/ErrorMsg"
import Title from "../../components/Title"
import Recipe from "../../models/Recipe"
import ListItems from "./Components/ListItems"
import PageState, { PageStates } from "../../components/PageState"
import User from "../../models/User"

interface AuthViewProps {
    user: User
    lists: ReactNode | null
    pageState: PageStates
}

const AuthView = ({ user, lists, pageState }: AuthViewProps) => {
    const [isCreatingList, setIsCreatingList] = useImmer(false)
    const [newListError, setNewListError] = useImmer("")
    const navigate = useNavigate()

    const handleOnClick = async () => {
        setIsCreatingList(true)
        const newRecipe = new Recipe({ authorId: user.username })
        try {
            const res = await apiRecipe.post(newRecipe)
            navigate(`/users/${user.username}/recipes/${res.id}`)
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
            <Title>My Recipes</Title>
            <LoadingButton
                css={{ marginBottom: 30 }}
                color="secondary"
                variant="contained"
                size="medium"
                onClick={handleOnClick}
                loading={isCreatingList}
            >
                Create Recipe
            </LoadingButton>
            {newListError && <ErrorMsg css={{ marginBottom: 30 }}>{newListError}</ErrorMsg>}
            <PageState pageState={pageState}>
                <ListItems lists={lists} emptyMsg="You don't have any lists to show. Make one!" />
            </PageState>
        </div>
    )
}

export default AuthView
