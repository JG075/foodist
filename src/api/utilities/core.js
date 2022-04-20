import apiProvider from "./provider"

export default class ApiCore {
    constructor(options) {
        if (options.getAll) {
            this.getAll = async (params) => {
                const items = await apiProvider.getAll(options.url, params)
                if (options.model) {
                    return items.map((i) => new options.model(i))
                }
                return items
            }
        }

        if (options.getSingle) {
            this.getSingle = async (id) => {
                const items = await apiProvider.getSingle(options.url, id)
                if (items.length === 0) {
                    return null
                }
                const item = items[0]
                if (options.model) {
                    return options.model.deserialize(item)
                }
                return item
            }
        }

        if (options.post) {
            this.post = (model) => {
                let formattedModel = model
                if (options.model) {
                    formattedModel = options.model.deserialize(model)
                }
                return apiProvider.post(options.url, formattedModel)
            }
        }

        if (options.put) {
            this.put = (model) => {
                let formattedModel = model
                if (options.model) {
                    formattedModel = options.model.deserialize(model)
                }
                return apiProvider.put(`${options.url}/${model.id}`, formattedModel)
            }
        }

        if (options.patch) {
            this.patch = (model) => {
                let formattedModel = model
                if (options.model) {
                    formattedModel = options.model.deserialize(model)
                }
                return apiProvider.patch(`${options.url}/${model.id}`, formattedModel)
            }
        }

        if (options.remove) {
            this.remove = (id) => {
                return apiProvider.remove(`${options.url}/${id}`)
            }
        }
    }
}
