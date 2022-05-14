/** @jsxImportSource @emotion/react */
import { produce } from "immer"
import { useEffect, useRef } from "react"
import { CSSTransition } from "react-transition-group"
import { useImmer } from "use-immer"

import apiImage from "../../../api/Image"
import DescriptionAdder from "../../../components/DescriptionAdder"
import ErrorMsg from "../../../components/ErrorMsg"
import ImageAdder from "../../../components/ImageAdder"
import RecipeDescription from "../../../components/RecipeDescription"
import RecipeImage from "../../../components/RecipeImage"
import { handleNonAxiosError } from "../../../helpers/handleAxiosError"
import Recipe from "../../../models/Recipe"

interface ExtrasProps {
    recipe: Recipe
    onChange?: (recipe: Recipe) => void
    allowEdit?: boolean
}

const Extras = ({ recipe, onChange, allowEdit }: ExtrasProps) => {
    const [submitting, setSubitting] = useImmer(false)
    const [errorMsg, setErrorMsg] = useImmer("")
    const [showDescription, setShowDescription] = useImmer(false)
    const recipeDescriptionRef = useRef()

    useEffect(() => {
        if (submitting && recipe.imageUrl) {
            setSubitting(false)
        }
    }, [submitting, recipe.imageUrl, setSubitting])

    const handleOnUpload = async (file: File) => {
        if (!onChange) {
            return
        }
        const formdata = new FormData()
        formdata.append("image", file)
        setSubitting(true)
        try {
            const image = await apiImage.upload(formdata)
            const newRecipe = produce(recipe, (draft) => {
                draft.imageUrl = image.url
            })
            onChange(newRecipe)
        } catch (err) {
            handleNonAxiosError(err)
            setErrorMsg("Sorry something went wrong.")
        }
    }

    const handleOnDelete = () => {
        if (!onChange) {
            return
        }
        const newRecipe = produce(recipe, (draft) => {
            draft.imageUrl = ""
        })
        onChange(newRecipe)
    }

    const handleDescriptionClick = () => {
        setShowDescription(true)
    }

    const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        if (!onChange) {
            return
        }
        const newRecipe = produce(recipe, (draft) => {
            draft.description = e.target.value
        })
        onChange(newRecipe)
    }

    const renderDescription = recipe.description || showDescription
    const renderImage = recipe.imageUrl || submitting

    return (
        <div>
            {renderImage && (
                <RecipeImage
                    url={recipe.imageUrl}
                    isLoading={submitting}
                    onDelete={handleOnDelete}
                    allowEdit={allowEdit}
                />
            )}
            {allowEdit && (!renderImage || !renderDescription) && (
                <div css={{ display: "flex", justifyContent: "center", marginTop: 20 }}>
                    {!renderImage && <ImageAdder onUpload={handleOnUpload} />}
                    {!renderDescription && (
                        <DescriptionAdder sx={{ marginLeft: "10px" }} onClick={handleDescriptionClick} />
                    )}
                </div>
            )}
            {errorMsg && <ErrorMsg css={{ marginTop: 10 }}>{errorMsg}</ErrorMsg>}
            <CSSTransition
                nodeRef={recipeDescriptionRef}
                in={showDescription}
                timeout={200}
                classNames="recipe-description"
            >
                <>
                    {renderDescription && (
                        <RecipeDescription
                            sx={{
                                marginTop: "10px",
                            }}
                            ref={recipeDescriptionRef}
                            onChange={handleDescriptionChange}
                            value={recipe.description}
                        />
                    )}
                </>
            </CSSTransition>
        </div>
    )
}

export default Extras
