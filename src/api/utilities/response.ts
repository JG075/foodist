import { AxiosResponse } from "axios"

export function handleResponse(response: AxiosResponse) {
    if (response.data) {
        return response.data
    }

    return response
}

export function handleError(error: Error) {
    return Promise.reject(error)
}
