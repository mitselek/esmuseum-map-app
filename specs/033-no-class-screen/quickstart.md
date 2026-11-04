# Quickstart: manual checks for "Not in a class yet"

Needs a running app logged in to `esmuuseum`. Use test persons, never real students.

1. **No class, no tasks**: log in as a person in no class (only the all-users group).
   Expected: the task list shows "not in a class yet" and the advice to ask for the class link.
2. **Class without tasks**: a person in a class whose teacher has added no tasks.
   Expected: the usual "no tasks assigned yet".
3. **Class with tasks**: a member of an infopäev group. Expected: their tasks, no message.
4. **Teacher**: a person who leads a class (has tasks, may be in no class). Expected: tasks.
5. **Join in progress**: open a class link as a class-less person, log in. Expected: no message
   while the join is confirmed; afterwards the class's tasks.
6. **Offline**: as in 1, but cut the network before the workspace loads. Expected: the existing
   error view, never the message.
7. **Languages**: repeat 1 in et, en, uk, lv.
