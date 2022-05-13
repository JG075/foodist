import { immerable } from "immer"

interface ImageAttrs {
    url: string
}

interface Image extends ImageAttrs {}
class Image {
    [immerable] = true

    constructor(opts: ImageAttrs) {
        Object.assign(this, opts)
    }

    serialize = () => {
        const { url } = this
        return {
            url,
        }
    }

    static deserialize = (instance: Image) => {
        const { url } = instance
        return new Image({
            url,
        })
    }
}

export default Image
