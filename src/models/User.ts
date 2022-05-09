import { immerable } from "immer"

interface UserAttrs {
    username: string
    email: string
}

interface User extends UserAttrs {}
class User {
    [immerable] = true

    constructor(opts: UserAttrs) {
        Object.assign(this, opts)
    }

    serialize = () => {
        const { username, email } = this
        return {
            username,
            email,
        }
    }

    static deserialize = (instance: User) => {
        const { username, email } = instance
        return new User({
            username,
            email,
        })
    }
}

export default User
