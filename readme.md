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
```
