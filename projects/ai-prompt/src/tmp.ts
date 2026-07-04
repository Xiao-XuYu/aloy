const construct = (props: any, target: any) => {
    if (props != null) {
        for (const key in props) {
            console.log("key", key)
            console.log("props", props)
            target[key] = props[key]
        }
    }
}
class Test {
    foo = ""
    bar = ""
    constructor(props?: Partial<Test>) { construct(props, this) }
}

console.log(
    new Test({
        foo: "1"
    }),
)