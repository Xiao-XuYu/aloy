export class Mode {
    static get isDev() {
        return process.env.MODE === 'development'
    }
    static get isTest() {
        return process.env.MODE === 'test'
    }
    static get isProd() {
        return process.env.MODE === 'production'
    }
}