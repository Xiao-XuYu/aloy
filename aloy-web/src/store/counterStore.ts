import type { GetGetType, GetSetType } from '../types/store';
import { getUseModelStore } from '../utils/store';

const fn = (setAlias: any, getAlias: any) => {
  const set = (setAlias ?? (() => { })) as GetSetType<ModelStore>
  const get = (getAlias ?? (() => { })) as GetGetType<ModelStore>
  class ModelStore {
    count = 0
    increment = () => {
      set((state) => ({ count: state.count + 1 }))
    }
  }
  return new ModelStore()
}

export const useCounterStore = getUseModelStore(fn);
export type CounterStore = ReturnType<typeof fn>; 
export type CounterStoreWrap = {counterStore: CounterStore}

