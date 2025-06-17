import React from 'react';

declare const $state: any;
declare const $derive: any;

const $client = (user) => {
  const [value, setValue] = $state('');

  return $derive(
    (email, notes) => (
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
    ),
    [user.email, user.notes]
  );
};

export default $client;
