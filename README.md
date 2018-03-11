WTFNote is meant to be a FOSS alterative for Simplenote that can be easily
self-hosted. WTFNote is built on top of Laravel 5.5 and uses MySQL as a
database. For the front-end WTFNote uses bootstrap and VueJS.

WTFNote is a single user app. There is a master password that is used to
access the application (no username required).

WTFNote is still in development, some features must be implemented before
the release of 1.0-beta.

# Features
- Notes have a title, a body, and multiple tags.
- Notes are autosaved.
- Notes store their history (scroll back through the history of your note)
  and can be restored back to a point in time.
- Notes can be pinned.
- A note can contain markdown (rendered using showdown).
- A note can contain latex equations (rendered using MathJAX).
- A note can contain a "videocast" of a shell session using
  [asciinema](https://asciinema.org).
- A non-trivial search engine can be used to search through the notes.
- A very simple interface with almost everything being one click away.
- A simple attachment system.

## Milestones for 1.0
- ~~Add warnings before deleting/restoring a note.~~
- ~~Add a hint on how to use the search bar.~~
- Add tooltips to all buttons.
- ~~Add the ability to change the password.~~
- Create a mobile interface.
* Add decent README file with detailed installation guide.
* ~~Support for [asciinema](https://asciinema.org/)!~~ *BONUS: rudimentary
  attachment system*.
* Use websocket instead of a RESTful API (will keep the RESTful interface).
* Support for concurrency.
* Store note history as diffs.

## Potential Future Features
- Group notes in folders.
- Syntax Highlighting in notes.
- Publishing notes (i.e. public notes with a url).
- Make the API public (use oauth?).
