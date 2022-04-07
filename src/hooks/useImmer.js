// Replace with third part library when it's updated to use React 18

"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.useImmerReducer = exports.useImmer = void 0
var immer_1 = require("immer")
var react_1 = require("react")
function useImmer(initialValue) {
    var _a = (0, react_1.useState)(function () {
            return (0, immer_1.freeze)(typeof initialValue === "function" ? initialValue() : initialValue, true)
        }),
        val = _a[0],
        updateValue = _a[1]
    return [
        val,
        (0, react_1.useCallback)(function (updater) {
            if (typeof updater === "function") updateValue((0, immer_1.default)(updater))
            else updateValue((0, immer_1.freeze)(updater))
        }, []),
    ]
}
exports.useImmer = useImmer
function useImmerReducer(reducer, initialState, initialAction) {
    var cachedReducer = (0, react_1.useMemo)(
        function () {
            return (0, immer_1.default)(reducer)
        },
        [reducer]
    )
    return (0, react_1.useReducer)(cachedReducer, initialState, initialAction)
}
exports.useImmerReducer = useImmerReducer
