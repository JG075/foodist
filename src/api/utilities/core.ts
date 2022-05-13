import apiProvider from "./provider"

interface Model {
    deserialize: (arg: any) => any
    new (...args: any[]): any
}

interface CreateApiOptions {
    url: string
    plural: string
    single: string
    model: Model
}

interface ModelParam {
    id: string
    serialize: () => any
    [key: string]: any
}

interface ApiInterface {
    getAll: (params: { [key: string]: string }) => Promise<any[]>
    getSingle: (params: { [key: string]: string }) => Promise<any>
    post: (model: ModelParam) => Promise<any>
    put: (model: ModelParam) => Promise<any>
    patch: (model: ModelParam) => Promise<any>
    remove: (id: string) => Promise<any>
}

export const createAPI = (options: CreateApiOptions) => {
    const methods: ApiInterface = {
        getAll: async (params) => {
            const items = await apiProvider.getAll(options.url, params)
            if (options.model) {
                return items.map((i: any) => options.model.deserialize(i))
            }
            return items
        },

        getSingle: async (params) => {
            const items = await apiProvider.getSingle(options.url, params)
            if (items.length === 0) {
                return null
            }
            const item = items[0]
            if (options.model) {
                return options.model.deserialize(item)
            }
            return item
        },

        post: (model) => {
            let formattedModel = model
            if (model.serialize) {
                formattedModel = model.serialize()
            }
            return apiProvider.post(options.url, formattedModel)
        },

        put: (model) => {
            let formattedModel = model
            if (model.serialize) {
                formattedModel = model.serialize()
            }
            return apiProvider.put(`${options.url}/${model.id}`, formattedModel)
        },

        patch: (model) => {
            let formattedModel = model
            if (model.serialize) {
                formattedModel = model.serialize()
            }
            return apiProvider.patch(`${options.url}/${model.id}`, formattedModel)
        },

        remove: (id) => {
            return apiProvider.remove(`${options.url}/${id}`)
        },
    }
    return methods
}
