import { debounce } from "lodash"

let onResizeFns: Function[] = []

export const addWindowOnResizeFn = (fn: Function) => {
    onResizeFns.push(fn)
}
export const removeWindowOnResizeFn = (fn: Function) => {
    onResizeFns = onResizeFns.filter(v => v != fn)
}

const onResize = (e: any) => {
    onResizeFns.forEach(v => v(e))
}
const debouncedOnResize = debounce(onResize, 300)
window.addEventListener("resize", debouncedOnResize)