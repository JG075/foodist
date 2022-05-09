import axios, { AxiosError } from "axios"

export const handleNonAxiosError = (err: any) => {
    const error = err as Error | AxiosError
    if (!axios.isAxiosError(error)) {
        throw err
    }
    return error
}
