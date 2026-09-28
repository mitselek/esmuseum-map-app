// URLs: memory/urls/<short-name>, one URL per file, on line 1. Nothing else in the file.
//
// URLs never go inline in any other tier. Every tier cites `urls/<short-name>`, which is
// itself a valid ref. Two reasons: a long URL eats a char cap that exists to keep records
// readable, and a URL that appears in twelve records has twelve places to rot.
//
// There is no interface here on purpose. The tier is one URL per file and the filename is
// the key; a schema would be heavier than the thing it describes.

export type UrlShortName = string;   // [a-z0-9-]+, cited as urls/<short-name>
