import axios from "axios"
import { handleResponse, handleError } from "./response"

const BASE_URL = "http://localhost:3001"

const instance = axios.create({
    withCredentials: true,
})

/** @param {string} resource */
const getAll = (resource, params) => {
    const searchParams = new URLSearchParams(params)
    const paramsString = params ? `?${searchParams}` : ""
    return instance.get(`${BASE_URL}/${resource}/${paramsString}`).then(handleResponse).catch(handleError)
}

/** @param {string} resource */
/** @param {string} id */
const getSingle = (resource, params) => {
    const searchParams = new URLSearchParams(params)
    const paramsString = params ? `?${searchParams}` : ""
    return instance.get(`${BASE_URL}/${resource}/${paramsString}`).then(handleResponse).catch(handleError)
}

/** @param {string} resource */
/** @param {object} model */
const post = (resource, model) => {
    return instance.post(`${BASE_URL}/${resource}`, model).then(handleResponse).catch(handleError)
}

/** @param {string} resource */
/** @param {object} model */
const put = (resource, model) => {
    return instance.put(`${BASE_URL}/${resource}`, model).then(handleResponse).catch(handleError)
}

/** @param {string} resource */
/** @param {object} model */
const patch = (resource, model) => {
    return instance.patch(`${BASE_URL}/${resource}`, model).then(handleResponse).catch(handleError)
}

/** @param {string} resource */
/** @param {string} id */
const remove = (resource) => {
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
