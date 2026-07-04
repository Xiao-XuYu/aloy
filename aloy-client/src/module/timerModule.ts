import log from "@/utils/log"
import moment from "moment"

/*
每晚10点执行一次
*/
export const runEverydayHour = (hour: number, fn: Function) => {
    const existDateToHour = {}
    const exec = () => {
        const dayStr = moment().format("YYYY-MM-DD")
        const currentHour = moment().hours()
        if (!existDateToHour[dayStr]) {
            existDateToHour[dayStr] = currentHour
            fn()
        } else {
            if (currentHour != existDateToHour[dayStr]) {
                existDateToHour[dayStr] = currentHour
                fn()
            }
        }
        log.info("existDateToHour", { existDateToHour })
    }
    setInterval(() => {
        exec()
    }, 1000 * 60 * 30)
}


export const runEverydayHourScripts = (hour: number, scripts: string[]) => {

}