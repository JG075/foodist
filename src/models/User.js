import { immerable } from "immer"

export default class User {
    [immerable] = true

    constructor({ id, email }) {
        this.id = id
        this.email = email
    }

    static serialize = ({ id, email }) => {
        return {
            id,
            email,
        }
    }

    static deserialize = ({ id, email }) => {
        return new User({
            id,
            email,
        })
    }
}
