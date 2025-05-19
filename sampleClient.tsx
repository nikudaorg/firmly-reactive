'use client';

import { useState } from 'react';
import type { Exposed } from './sampleServer';

declare const useExposed: <TExposed extends { read: object; write: object }>(
  apiUrl: string
) => TExposed['read'] & TExposed['write'];

const App = (apiUrl: string) => {
  const { email, notes } = useExposed<Exposed>(apiUrl);
  const [value, setValue] = useState<string>();

  return (
    <>
      <h1>Notes app | Your email is {email}</h1>
      <ul>
        {notes.map((note, key) => (
          <li id={key}>
            {note.content} | {note.timeCreated}
          </li>
        ))}
      </ul>
      <input onChange={(e) => setValue(e.target.value)}>{value}</input>
      <button
        onClick={() => {
          notes.push(value).then(() => {
            console.log('Note added');
          });
          setValue('');
        }}
      >
        Add note
      </button>
    </>
  );
};
