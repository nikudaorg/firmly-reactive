type Context = 'persistent' | 'volatile';

type PopFirst<TArray extends unknown[]> = TArray extends [
  unknown,
  ...infer Rest extends unknown[]
]
  ? Rest
  : never;

declare const hookTag: unique symbol;

type HookAnnotation = {
  readonly volatile?: (...args: never[]) => unknown;
  readonly persistent?: (...args: never[]) => unknown;
};

type Use<TContext extends Context> = <
  TAnnotation extends HookAnnotation & {
    [K in TContext]: Exclude<HookAnnotation[TContext], undefined>;
  }
>(
  hook: TAnnotation[TContext]
) => () => PopFirst<Parameters<TAnnotation[TContext]>>;

declare const stateTag: unique symbol;

type State<T, TContext extends Context> = {
  [stateTag]: {
    context: TContext;
  };
  readonly get: () => Promise<T>;
  readonly set: (value: T) => Promise<void>;
  readonly effect: Hook<HookAnnotation>;
};

type $StateAnnotation = {
  readonly volatile: <T>(initial: () => T) => State<T, 'volatile'>;
};

type Hook<TAnnotation extends HookAnnotation> = {
  [hookTag]: TAnnotation;
};

type $State = Hook<$StateAnnotation>;
