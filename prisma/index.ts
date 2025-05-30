declare const stateSymbol: unique symbol;

type State<T = unknown, TCondition = unknown, Name = string> = {
  [stateSymbol]: { name: Name };
  get: () => T;
  set: (value: T) => void;
  is: (condition: TCondition) => boolean;
};
/*






*/
export type ValueCondition = 456;

export type Value<T, Name extends string> = State<T, ValueCondition, Name>;
/*






*/
type RowSchemaBase = { [k: string]: unknown };

type RowCondition<T extends RowSchemaBase> = 789;

export type Row<T extends RowSchemaBase> = {
  [K in keyof T & string as `$${Capitalize<K>}`]: State<T[K], unknown, K>;
} & State<T, RowCondition<T>>;
/*






*/
type ManyCondition<E extends State> = 789;

export type Many<E extends State<unknown, unknown>> = {
  filter: (
    condition: E extends State<unknown, infer Condition> ? Condition : never
  ) => Many<E>;
  map: <NewE extends State<unknown, unknown>>(f: (e: E) => NewE) => Many<NewE>;
} & State<E extends State<infer T, unknown> ? T : never, never>;

export const usePrisma = () => {
  return {
    useState: () => {},

    useEffect: () => {},

    useMany: <T extends State<unknown, unknown>>(
      useElement: () => T
    ): T[] => {},

    useDerived: (opts: { forth: () => {}; persistent: boolean }) => {},

    useBind: (opts: {
      forth: () => {};
      back: () => {};
      persistent: boolean;
    }) => {}
  };
};
