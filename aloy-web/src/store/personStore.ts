import { create } from 'zustand';
import type { GetGetType, GetSetType } from '../types/store';
import { getUseModelStore } from '../utils/store';
import type { PartialStoreMap } from '.';
import type { CounterStoreWrap } from './counterStore';


const fn = (setAlias: any, getAlias: any) => {
  const set = (setAlias ?? (() => { })) as GetSetType<ModelStore>
  const get = (getAlias ?? (() => { })) as GetGetType<ModelStore>
  class ModelStore {
    name = "foo"

    say = ({counterStore, personStore}:CounterStoreWrap&PersonStoreWrap) => {
        console.log("counterStore", counterStore)
        console.log("personStore", personStore)
        console.log(`${personStore.name} say: current count is ${counterStore.count}`)
    }
  }
  return new ModelStore()
}

export const usePersonStore = getUseModelStore(fn);
export type PersonStore = ReturnType<typeof fn>;
export type PersonStoreWrap = {personStore: PersonStore}
