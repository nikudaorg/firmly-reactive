import { z } from 'zod';

declare const isRunningTag: unique symbol;

type IsRunning = {
  [isRunningTag]: typeof isRunningTag;
};

export type State<T> = 1234;

type WhereToStore = 5678;

type Else<TUse, TOuterRet> = {
  (hook: (use: TUse) => void): void;
  <ElseRet>(value: ElseRet): TOuterRet | ElseRet;
};

type IfReturn<TUse, TRet, TIsRunningAvailable extends boolean> = {
  elseIf: IfChain<TUse, TRet, TIsRunningAvailable>;
  else: Else<TUse, TRet>;
};

type IfChain<TUse, TOuterRet, TIsRunningAvailable extends boolean> = (<TIfRet>(
  condition: State<boolean>,
  hook: (use: TUse) => TIfRet
) => IfReturn<TUse, TOuterRet | TIfRet, TIsRunningAvailable>) &
  (TIsRunningAvailable extends false
    ? unknown
    : <TIfRet>(
        condition: IsRunning,
        hook: (use: TransientUse) => TIfRet
      ) => IfReturn<TUse, TOuterRet | TIfRet, TIsRunningAvailable>);

type CommonUse = {};

type TransientUse = {
  state: <Schema extends z.ZodTypeAny>(
    schema: Schema,
    initial: () => z.infer<Schema>
  ) => State<z.infer<Schema>>;

  ref: <T>(initial: () => T) => T;

  effect: <T>(
    localEffect: () => { result: T; cleanup: (data) => void },
    deps: State<unknown>[],
    cache: WhereToStore
  ) => State<T>;

  status: State<'on' | 'off'>;

  if: IfChain<TransientUse, never, false>;

  derived: <Deps extends State<z.ZodTypeAny>[], T>(
    pure: (...args: Deps) => T,
    deps: Deps,
    cache: WhereToStore
  ) => State<T>;
};

type Use = {
  isRunning: IsRunning;

  effect: <T>(
    effect: () => { result: T; cleanup: (data) => void },
    deps: State<z.ZodTypeAny>[],
    cache: WhereToStore | WhereToStore[],
    prefer?: 'none' | 'multiple'
  ) => State<T>;

  if: IfChain<NestedUse, never, true>;
} & CommonUse;

type NestedUse = Use & {
  status: State<'on' | 'off'>;
};

declare const use: Use;

use.effect();

useState({
  stores: {
    prisma: { name: 'myState' },
    local: true
  }
});

type Storage<Schema> = {
  migrate;
};
