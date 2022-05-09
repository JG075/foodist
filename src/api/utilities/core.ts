import apiProvider from "./provider"

interface Model {
    deserialize: (arg: any) => any
    new (...args: any[]): any
}

interface model {
    id: number
}

interface options {
    url: string
    plural: string
    single: string
    model: Model
    methods: ["getAll", "getSingle", "post", "put", "patch", "remove"]
}

interface createApiInterface {
    getAll: (params: string) => Promise<any[]>
    getSingle: (id: string) => Promise<any>
    post: (model: model) => Promise<any>
    put: (model: model, id: string) => Promise<any>
    patch: (model: model, id: string) => Promise<any>
    remove: (model: model) => Promise<any>
}

export const createAPI = (options: options) => {
    const methods: createApiInterface = {
        getAll: async (params) => {
            const items = await apiProvider.getAll(options.url, params)
            if (options.model) {
                return items.map((i: number) => new options.model(i))
            }
            return items
        },

        getSingle: async (id) => {
            const items = await apiProvider.getSingle(options.url, id)
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
            if (options.model) {
                formattedModel = options.model.deserialize(model)
            }
            return apiProvider.post(options.url, formattedModel)
        },

        put: (model) => {
            let formattedModel = model
            if (options.model) {
                formattedModel = options.model.deserialize(model)
            }
            return apiProvider.put(`${options.url}/${model.id}`, formattedModel)
        },

        patch: (model) => {
            let formattedModel = model
            if (options.model) {
                formattedModel = options.model.deserialize(model)
            }
            return apiProvider.patch(`${options.url}/${model.id}`, formattedModel)
        },

        remove: (id) => {
            return apiProvider.remove(`${options.url}/${id}`)
        },
    }

    return options.methods.reduce((prev, current) => {
        prev[current] = methods[current]
        return prev
    }, {} as any)
}
