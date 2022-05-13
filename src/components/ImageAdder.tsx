/** @jsxImportSource @emotion/react */
import { ChangeEvent, useRef } from "react"

import AdderLink from "./AdderLink"

export interface ImageAdderProps {
    onUpload: (file: File) => void
}

const ImageAdder = ({ onUpload }: ImageAdderProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleOnClick = () => {
        if (!fileInputRef.current) {
            return
        }
        fileInputRef.current.click()
    }

    const handleOnChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const file = e.target.files[0]
            onUpload(file)
        }
    }

    return (
        <>
            <AdderLink onClick={handleOnClick} aria-label="Add image">
                Image
            </AdderLink>
            <label css={{ display: "none" }} htmlFor="uploadImage">
                Upload Image
            </label>
            <input
                data-testid="uploadImage"
                id="uploadImage"
                name="uploadImage"
                css={{ display: "none" }}
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleOnChange}
            />
        </>
    )
}

export default ImageAdder
