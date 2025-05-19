'use server';

import express from 'express';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import axios from 'axios';

declare const useTRPC: any;
declare const usePrisma: any;
declare const useEffect: any;
declare const useConst: any;
declare const useDerived: any;

declare const createContextJWT: any;

declare const semanticStatisticsSchema: any;

const useNote = (prisma, getNotes) => {
  const { content } = prisma.useState('content', prisma.string().max(1024));
  return {
    content,
    ...prisma.useState('references', prisma.linkElement(prisma.lazy(getNotes))),
    ...prisma.useState('secretField', prisma.string()),
    ...prisma.useState('timeCreated', prisma.string()),
    ...prisma.useEffectState(
      'semanticStatistics',
      semanticStatisticsSchema,
      async () => {
        const res = await axios.get('example-semantics-api.com/', {
          params: { content: content.get() }
        });
        return res.data;
      }
    )
  };
};

const usePublicNote = (note) => {
  return {
    content: note.content,
    references: note.references.forEach(usePublicNote).const,
    timeCreated: note.timeCreated.const
  };
};

const useNotes = (name, prisma) => {
  const obj = prisma.useMany(name, () => useNote(prisma, () => obj[name]));
  return obj;
};

const useUser = (prisma) => {
  const { notes } = useNotes('notes', prisma);
  const email = prisma.useState('email', prisma.string().email());
  const hashedPassword = prisma.useState('hashedPassword', prisma.string());
  return { notes, email, hashedPassword };
};

const useUsers = (name, prisma) => {
  return { ...prisma.useMany(name, () => useUser(prisma)) };
};

const useTRPCExpress = (trpcRouter) => {
  const app = useConst(() => {
    return express();
  });

  const expressMiddleware = useDerived(
    () =>
      createExpressMiddleware({
        router: trpcRouter.get(),
        createContext: createContextJWT
      }),
    [trpcRouter]
  );

  useEffect(() => {
    app.use('/trpc', expressMiddleware.get());
  }, [app]);

  return app;
};

const useExposeToClient = <AuthCtx extends object, Exposed extends unknown>(
  expose: (authCtx: AuthCtx) => Exposed,
  serverPort: number
) => {
  const trpcRouter = useTRPC(expose);
  const app = useTRPCExpress(trpcRouter);
  useEffect(() => {
    app.listen(serverPort, () => {
      console.log(`Server running on http://localhost:${serverPort}/trpc`);
    });
  }, [app]);

  return { exposedType: {} as Exposed };
};

export const useServer = (serverPort: number) => {
  const { prisma } = usePrisma();

  const { users } = useUsers('users', prisma);

  return useExposeToClient(({ userKey }: { userKey: typeof users.key }) => {
    const user = users.getByKey(userKey);
    const notes = user.notes.forEach(usePublicNote);
    return {
      read: {
        email: user.email,
        notes: notes
      },
      write: {
        notes: notes
      }
    };
  }, serverPort);
};

export type Exposed = ReturnType<typeof useServer>['exposedType'];
