import { immerable } from "immer"

export default class User {
    [immerable] = true

    constructor({ username, email }) {
        this.username = username
        this.email = email
    }

    serialize = () => {
        const { username, email } = this
        return {
            username,
            email,
        }
    }

    static deserialize = ({ username, email }) => {
        return new User({
            username,
            email,
        })
    }
}
