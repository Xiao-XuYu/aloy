"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("module-alias/register");
const timerModule_1 = require("../src/module/timerModule");
(0, timerModule_1.runEverydayHour)(22, () => {
    console.log(123);
});
