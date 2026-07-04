import 'module-alias/register';

import { runEverydayHour } from "../module/timerModule";

runEverydayHour(22, () => {
    console.log(12312)
})