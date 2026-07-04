import type { StoreApi } from "zustand";

// export type GetSetType<ModelStore> = (partial: ModelStore | Partial<ModelStore> | ((state: ModelStore) => ModelStore | Partial<ModelStore>), replace?: false) => void
export type GetSetType<ModelStore> = StoreApi<ModelStore>['setState']
export type GetGetType<ModelStore> = StoreApi<ModelStore>['getState']