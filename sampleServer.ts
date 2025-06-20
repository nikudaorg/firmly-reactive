'use server';

import axios from 'axios';

declare const $drizzle: any;
declare const dr: any;
declare const $many: any;

declare const $hostClient: any;

const $note = (drizzle, getNotes) => {
  const { content } = drizzle.$state('content')(dr.string().max(1024));

  return {
    content,
    ...drizzle.$state('references')(dr.linkElement(dr.lazy(getNotes))),
    ...drizzle.$state('secretField')(dr.string()),
    ...drizzle.$effect('wordCount')(
      dr.number(),
      async (content) => {
        const res = await axios.get('https://count-words.com/', {
          params: { content }
        });
        return res.data;
      },
      [content]
    ),
    ...drizzle.$derived('includesLetterB')(
      dr.boolean(),
      (content) => content.includes('b'),
      [content]
    ),
    ...drizzle.$state('timeCreated')(dr.date(), {
      initial: () => new Date()
    })
  };
};

const $publicNotes = (notes) => {
  return notes.map((note) => ({
    content: note.content.const,
    references: $publicNotes(note.references),
    timeCreated: note.timeCreated.const,
    wordCount: note.wordCount,
    includesLetterB: note.includesLetterB
  }));
};

const $user = (drizzle) => {
  // const notes = $many(drizzle.$many('note'))((drizzle) =>
  //   drizzle.row($note(drizzle, () => notes))
  // );

  const notes = drizzle.$many('note')((drizzle) =>
    drizzle.row($note(drizzle, () => notes))
  );
  return {
    notes,
    ...drizzle.$state('email')(drizzle.string()),
    ...drizzle.$state('hashedPassword')(drizzle.string())
  };
};

const $publicUsers = (users) => {
  return users.map((user) => ({
    notes: $publicNotes(user.notes),
    email: user.email
  }));
};

export const $app = () => {
  const { drizzle } = $drizzle();

  // const users = $many(drizzle.$many('user'))((drizzle) =>
  //   drizzle.row($user(drizzle))
  // );

  const users = drizzle.$many('user')((drizzle) => drizzle.row($user(drizzle)));

  $hostClient(
    './sampleClient.tsx',
    () => import('./sampleClient.tsx'),
    $publicUsers(users)
  );
};
