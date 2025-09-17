# TODO

- [x] Link locations on map to locations in selection list
  - if location selected on map, select the same location in list
  - if location selected in list, highlight the same location on map
- [x] If location with responses is selected, show responses in detail view (can we show it in leaflet popup?)
  - ✅ EXPERIMENTAL IMPLEMENTATION COMPLETED - See `feature/popup-responses` branch (commit 65ff57c)
  - Full ResponseCard component with compact layout for popups
  - Navigation controls for multiple responses per location
  - Complete i18n translations and comprehensive F017 documentation
  - Status: ON HOLD - UX feasibility needs evaluation, compact popup design may not be optimal
  - Alternative approaches to consider: modal overlay, sidebar integration, or expandable popup views
- [x] Find all places, where we are checking for ._id but actually should only look for .reference (e.g. in useTaskDetail.ts)
- [x] find out, why was expanding options after headers in callApi critical for POST requests - was it just a timing issue or something else?
- [x] remove the certs from the repo!
- [ ] could we use typescript interfaces to define the shape of Entu entities (e.g. Task, Response, Location) and use them across the app for better type safety and autocompletion?
