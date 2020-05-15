export interface Store {
  get(path: unknown): Promise<unknown>;
  set(path: unknown, value: unknown): Promise<unknown>;
  delete(path: unknown): Promise<unknown>;
}

export type Stores = { [key: string]: Store };
