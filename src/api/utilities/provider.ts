import axios from "axios"
import { handleResponse, handleError } from "./response"

const BASE_URL = "http://localhost:3001"

const instance = axios.create({
    withCredentials: true,
})

const getAll = (resource: string, params?: string) => {
    const searchParams = new URLSearchParams(params)
    const paramsString = params ? `?${searchParams}` : ""
    return instance.get(`${BASE_URL}/${resource}/${paramsString}`).then(handleResponse).catch(handleError)
}

const getSingle = (resource: string, params?: string) => {
    const searchParams = new URLSearchParams(params)
    const paramsString = params ? `?${searchParams}` : ""
    return instance.get(`${BASE_URL}/${resource}/${paramsString}`).then(handleResponse).catch(handleError)
}

const post = (resource: string, model: {}) => {
    return instance.post(`${BASE_URL}/${resource}`, model).then(handleResponse).catch(handleError)
}

const put = (resource: string, model: {}) => {
    return instance.put(`${BASE_URL}/${resource}`, model).then(handleResponse).catch(handleError)
}

const patch = (resource: string, model: {}) => {
    return instance.patch(`${BASE_URL}/${resource}`, model).then(handleResponse).catch(handleError)
}

const remove = (resource: string) => {
    return instance.delete(`${BASE_URL}/${resource}`).then(handleResponse).catch(handleError)
}

const apiProvider = {
    getAll,
    getSingle,
    post,
    put,
    patch,
    remove,
}

export default apiProvider
