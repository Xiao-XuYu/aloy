import { create } from 'zustand';
import type { GetSetType } from '../types/store';
import { getUseModelStore } from '../utils/store';

type SetType = (partial: CounterStore | Partial<CounterStore> | ((state: CounterStore) => CounterStore | Partial<CounterStore>), replace?: false) => void
type CounterStore = ReturnType<typeof counterStoreFn>

function counterStoreFn(
  set: SetType
) {
  return ({
    count: 0,
    increment: () => set((state) => ({ count: state.count + 1 })),
    decrement: () => set((state) => ({ count: state.count - 1 })),
    reset: () => set({ count: 0 }),
  })
}

export const useCounterStore2 = getUseModelStore(counterStoreFn);

