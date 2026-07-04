import { create } from "zustand";

export const getUseModelStore = <F extends (...args: any) => any>(fn: F) =>
  create<ReturnType<F>>(fn);