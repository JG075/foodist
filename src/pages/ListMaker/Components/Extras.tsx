/** @jsxImportSource @emotion/react */
import { produce } from "immer"
import { useEffect, useRef } from "react"
import { CSSTransition } from "react-transition-group"
import { useImmer } from "use-immer"

import apiImage from "../../../api/Image"
import DescriptionAdder from "../../../components/DescriptionAdder"
import ErrorMsg from "../../../components/ErrorMsg"
import ImageAdder from "../../../components/ImageAdder"
import IngrediantListDescription from "../../../components/IngrediantListDescription"
import IngrediantListImage from "../../../components/IngrediantListImage"
import { handleNonAxiosError } from "../../../helpers/handleAxiosError"
import IngrediantList from "../../../models/IngrediantList"

interface ExtrasProps {
    ingrediantList: IngrediantList
    onChange?: (ingrediantList: IngrediantList) => void
    allowEdit?: boolean
}

const Extras = ({ ingrediantList, onChange, allowEdit }: ExtrasProps) => {
    const [submitting, setSubitting] = useImmer(false)
    const [errorMsg, setErrorMsg] = useImmer("")
    const [showDescription, setShowDescription] = useImmer(false)
    const ingrediantListDescriptionRef = useRef()

    useEffect(() => {
        if (submitting && ingrediantList.imageUrl) {
            setSubitting(false)
        }
    }, [submitting, ingrediantList.imageUrl, setSubitting])

    const handleOnUpload = async (file: File) => {
        if (!onChange) {
            return
        }
        const formdata = new FormData()
        formdata.append("image", file)
        setSubitting(true)
        try {
            const image = await apiImage.upload(formdata)
            const newIngrediantList = produce(ingrediantList, (draft) => {
                draft.imageUrl = image.url
            })
            onChange(newIngrediantList)
        } catch (err) {
            handleNonAxiosError(err)
            setErrorMsg("Sorry something went wrong.")
        }
    }

    const handleOnDelete = () => {
        if (!onChange) {
            return
        }
        const newIngrediantList = produce(ingrediantList, (draft) => {
            draft.imageUrl = ""
        })
        onChange(newIngrediantList)
    }

    const handleDescriptionClick = () => {
        setShowDescription(true)
    }

    const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        if (!onChange) {
            return
        }
        const newIngrediantList = produce(ingrediantList, (draft) => {
            draft.description = e.target.value
        })
        onChange(newIngrediantList)
    }

    const renderDescription = ingrediantList.description || showDescription
    const renderImage = ingrediantList.imageUrl || submitting

    return (
        <div>
            {renderImage && (
                <IngrediantListImage
                    url={ingrediantList.imageUrl}
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
                nodeRef={ingrediantListDescriptionRef}
                in={showDescription}
                timeout={200}
                classNames="ingrediantList-description"
            >
                <>
                    {renderDescription && (
                        <IngrediantListDescription
                            sx={{
                                marginTop: "10px",
                            }}
                            ref={ingrediantListDescriptionRef}
                            onChange={handleDescriptionChange}
                            value={ingrediantList.description}
                        />
                    )}
                </>
            </CSSTransition>
        </div>
    )
}

export default Extras
