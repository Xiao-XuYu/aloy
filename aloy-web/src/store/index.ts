import type { CounterStore } from "./counterStore"
import type { PersonStore } from "./personStore"

interface StoreMap {
    counterStore: CounterStore
    personStore: PersonStore
}

export type PartialStoreMap = Partial<StoreMap>