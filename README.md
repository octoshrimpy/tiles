# tiles
simple tiles game created in 24hr

# Todo
- [ ] add rewards purchaseable with points
  - [ ] gamemode: request: game requests a certain tile, gotta merge it and drop it into the "turn in" bit (new UI)
  - [ ] gamemode: timed. new tiles go away after x second and dont get refilled. if source tiles all go away, you lose. playing a tile into a droppable:not(self) refills source
  - [ ] gamemode: endless. always make sure the spawning tile can do a match
  - [ ] gamemode: batched. do not refill source until al source tiles have been used
  - [ ] add disco ball if fast enough streaks, add screen shake on successful merge, add screen sparks/fetti on successful merge, scale with streak   
  - [?] green dropzones be random different colors every time

- [ ] check cookies? localstorage? for settings
- [ ] quicklink to make new issue in-game
- [ ] quicklink to repository in-game
- [ ] allow 1 2 3 + mouse hover for input (no click)
- [>] convert partices to tsparticles
- [!] replace jqueryUI draggables with draggable.js (by shopify)

- [x] make tile content non-selectable with cursor
- [x] limit number on card if 16k or greater
- [x] setting - hide hints
- [x] comma-separated points score
- [x] setting - dark mode
- [x] settings panel (use #target for opening sidebar or something)
- [x] confetti
- [x] scale confetti to card content
- [x] touch UI
- [x] desktop friendly
- [-] analytics
- [-] landscape mode
