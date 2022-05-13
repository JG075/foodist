import Image from "../models/Image"
import { apiProvider } from "./utilities"

const upload = async (formData: FormData) => {
    const res = await apiProvider.post("image-upload", formData)
    return new Image(res)
}

const apiImage = {
    upload,
}

export default apiImage
