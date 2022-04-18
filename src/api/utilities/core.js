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
                const item = await apiProvider.getSingle(options.url, id)
                if (options.model) {
                    return new options.model(item)
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
                return apiProvider.put(options.url, model)
            }
        }

        if (options.patch) {
            this.patch = (model) => {
                return apiProvider.patch(options.url, model)
            }
        }

        if (options.remove) {
            this.remove = (id) => {
                return apiProvider.remove(options.url, id)
            }
        }
    }
}
