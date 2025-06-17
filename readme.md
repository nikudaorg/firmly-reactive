# Firmly Reactive | FOR REAL FRamework

- A concept of a framework that fits reactivity in every possible suitable place:
  - databases
  - apis
  - UI, obviously

For now you can check out the conceptual samples in sampleServer.ts, sampleClient.ts and index.ts, maybe someday I will implement it :)

Feel free to contact me if you are interested.

### Here I will simply put all my thoughts regarding the FRamework:

```ts
// lifetime of the resource is determined by the scope in which it is declared
// lifetime can only shrink down the call stack
// lifetime is defined by the condition that need to evaluate to true for the resource to be available
// when a resource of smaller lifetime travels up the call stack, it is enriched by the 'fallback' values that will be used when the resource doesn't exist.
//
// persistent / non-persistent is a separate charateristic
// however, it's recommended to keep most of the resources persistent.
// and this charactersitic shares most of the qualities of lifetime. also travels only monodirectionally
// BUT - non-persistent doesn't need a fallback value to be used as persistent, because anyway it can be used only when the program is running
//
//
// (?) can we incapsulate (hide) if the resource is persistent or not, from the users?
//
//
//
// You can choose the sorage provider for the resource.
// You can probably also choose many (at least like prisma & local)
//
//
// then we need a system of knowing what the source of truth is.
//
// for example
// if no local - source of truth is prisma
// else - source of truth is local
// when prisma changes externally - invalidate local (no need to update yet)
//
// when we change the state, it updates in all storages obviously.
// (?) what to do if we updated in one place and then program shut down
//
//
// in what way should we define these rules?
//
//
//
// basically the sync between storages is something that is already under the reactivve paradigm itself
// what if multiple runs work simultaneously?
// then it's important to understand that some storages may be per instance and some inter-instances.
// which means stuff.
//
//
//
//
//
//
//
//
//
//
// by the way, 'useMany' shouldn't be just some api provided by the storage
// it would be cool, for example, if we could pair among the elements in different databases like this
// then useMany should be OUR primitive, not storage provider's one.
//
//
// maybe the same way the questions of multiple storage providers to one state can be resolved.
//
//
// basically

const useCached = <T>(use, externalState: State<T>) => {
  // const localState = use.state<T | 'invalidated'>('local', 'invalidated') // need to work on naming...

  // or maybe:
  const localState = use.volatile((use) => {
    const state = use.state<T | 'invalidated'>('invalidated')
    use.effect(() => {state.set('invalidated')}, [externalState])
    return state
  })
  //
  // use.volatile((use) => {
  //   use.effect(() => {localState.set('invalidated')}, [externalState])
  // })
  // indicates that this effect is not to be 'of persistent lfetime', even though prismaState is
  // but it would be good if it was a default when a local state is being set in the effect, but I'm not sure how.
  // the thing is that in this case the effect kinda expires if localState expires, 
  // because there is no need to update localState if it's already out of its previous lifetime.
  //
  // oh, I think I know. the thing is that 'set' is not even always available to anything, the lifetime of which is smaller than the lifetime of scope.
  // how to refactor it then though...
  // i know! the thing is that I don't even need to update localState anywhere except in its volatile definition scope. 
  // so I can entirely exclude the 'set' from anything that is volatile, but leaves its volatile scope
  //
  // btw what about some sort of useDerived here?

  return {
    get: async () => {
      const local = await localState.get();
      if (local !== 'invalidated') {
        return local
      }
      return await externalState.get()
    },
    set: async (value: T) => { // async for consistency
      await externalState.set(value)
    },
    useEffect: (use, listener: () => void) => {
      use.effect(listener, [externalState]) 
    }
  }
}


// btw maybe define hooks like this:
//
//
//
const cached = hook(<T>(use, externalState: State<T>) => {
  // hook code
})
//
// and then call like this
//
use(cached, externalState)
//
//
// external use needed for maintaining the information about lifetimes....
//
// or even (even though looks more marginal):
use[cached](externalState)
// or of course
use(cached)(externalState)
use(state)(...)

// looks good btw!

const cached = hook(<T>(use, externalState: State<T>) => {
  const localState = use(volatile)((use) => {
    const state = use.state<T | 'invalidated'>('invalidated')
    use.effect(() => {state.set('invalidated')}, [externalState])
    return state
  })

  return {
    get: async () => {
      const local = await localState.get();
      if (local !== 'invalidated') {
        return local
      }
      return await externalState.get()
    },
    set: async (value: T) => { // async for consistency
      await externalState.set(value)
    },
    effect: hook((use, listener: () => void) => {
      use.effect(listener, [externalState]) 
    })
  }

})

const prismaCached = use(cached)(prismaState)
const callback = () => console.log('prisma value changed')

use(effect)(callback, [prismaCached])
// or
use(prismaCached.effect)(callback)
//
// one con I see is that these 'effect', 'cached' etc take the useful names out of the namespace for definitions.
// then maybe: 
const state = use($state)
// or sth similar







// Another question.
// effects: syncronizations vs impulses
//
// impulse:
use($effect)(() => {
  console.log('data has changed!')
}, [sth]) 

// synchronizations state -> external
use($effect)(() => {
  localStorage.setItem('sth', JSON.stringify(sth))
}, [sth])

// synchronizations external -> state
use($effect)(() => {
  const callback = () => {
    setSth(external.value)
  }
  external.on('change', callback);
  return () => {
    external.off('change', callback)
  }
}, [])

// what is the assumed difference between them?
// should we explicitly divide them into different hooks or something?
// for each of these options: is it a good utilisation of reactive paradigm, or a bad pattern? if bad pattern, what is the better way?

// intuition: classical useEffect is better suited for syncronizations. impulses should be handled separately somehow.

// more than that, it looks like that it's not a good practice to react to the fact of change of a state, rather than to the new value. 
// one possible solution would be to say that the entire thing with pub/sub is not suitable for impulses, causes overcomplicated ties within data, etc. instead follow something as simple as this:

const $stateWithImpulse = hook((use) => <T>(initial: T) => {
  const state = use($state)(initial);
  return {
    get: state.get, 
    $effect: state.$effect, 
    set: (newValue: T) => {
      console.log('impulse');
      setState(newValue);
    }
  }
})

// ok, assume:
//
// 1. 
const state = use($subsribe)((set) => {
  set(123);
  const callback = () => {set(external.value)}
  external.on('change', callback)
  return () => external.off('change', callback)
})
//   - forbid side effects to the outside enviornment (external)
//   - allow setters

// 2.
use($syncOut)(state, () => {
  external2.updateValue(state.get())
})
//   - allow side effects to the outside enviornment (external)
//   - forbid setters

// example - hook that resolves to true if given date has passed and to false otherwise:
const $hasTimePassed = hook((use) => (target: Date) => {
  return use($subscribe)((set) => {
    if (new Date() > target) {
      set(true)
      return
    }
    set(false)
    const timeoutId = setTimeout(() => {
      set(true)
    }, Date.now() - target.now())
    return () => clearTimeout(timeoutId)
  }, [target]);
})

// it's a sync engine, not pub/sub engine after all!
// and if you want pub/sub so badly, you can simply create a hook for state to which you can actually subscribe not for sync very easily, like this:

const $statePubSub = hook(use => <T>(createState: (use) => State<T>) => {
  const state = createState(use);
  const listeners = use($volatile)([])

  return {
    get: state.get,
    $effect: state.$effect,
    set: async (newValue: T) => {
      state.set(newValue)
      await Promise.all(listeners.map((l) => l()))
    },
    onChange: (listener: () => Promise<void>) => {
      listeners.set([...listeners.get(), listener])
    }
  }
})



// also I would like to get everythin possible off the 'use' thing, like:
//

derive(() => {
  
})

subscribe(() => {

}, [])

// everything that doesn't need information about lifetimes in types.

```

## Migrations

```ts
const file = useFile('file.txt')

// then if we wanna migrate, we must start with updating this line into:

const file = useFile('file.txt', {onDie: (file, deleteFile) => {
  console.log('migrating from file.txt to file2.txt')
  createFile('file2.txt', file.content)
  deleteFile()
}})


// maybe it's even a persistent subscribe under the hood:

const fileId = subscribe((set) => {
  const fileId = createFile('file.txt');
  set(fileId)
  return () => {
    throw Error('Migration from file.txt not yet implemented')
  }
}, [])

const fileContent = local((ctx) => subscribe((set) => {
  const off = watchFile(fileId.get(), (newContent) => {
    set(newContent)
  })
  return () => {
    off()
  }
}, [fileId]))
```
but we still need to track the state of the underlying environment
and know switching between them, 
so maybe simple persistent scope is not enough

or, otherwise, everything in persistent scope must be also snapshottable and stuff.

```ts
// it seems to me that migrations can be indeed interpreted as a subset of persistent subscriptions
// yes, migrations are more sensible, than simple subscriptions to something, 
// but this is not because their different from subscriptions, it's because they are persistent,
// and everything persistent is more sensible

```