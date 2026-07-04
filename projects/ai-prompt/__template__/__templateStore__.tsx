import { create } from 'zustand';
import type { GetGetType, GetSetType } from '../types/store';
import { getUseModelStore } from '../utils/store';


const fn = (setAlias: any, getAlias: any) => {
  const set = (setAlias ?? (() => { })) as GetSetType<ModelStore>
  const get = (getAlias ?? (() => { })) as GetGetType<ModelStore>
  class ModelStore {
  }
  return new ModelStore()
}
export const use__Template__Store = getUseModelStore(fn);
export type __Template__Store = ReturnType<typeof fn>;