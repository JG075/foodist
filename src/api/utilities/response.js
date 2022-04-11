export function handleResponse(response) {
    if (response.results) {
        return response.results
    }

    if (response.data) {
        return response.data
    }

    return response
}

export function handleError(error) {
    return Promise.reject(error)
}
