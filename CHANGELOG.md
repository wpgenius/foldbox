# Changelog

## 1.4.0 – 2026-11-26

### Changes
- Page behind the open gallery stays reachable (#110)
- youtubeParams and vimeoParams objects are shared with Foldbox.defaults (#109)
- Zoom button SVG is rebuilt on every pan, wheel and resize event (#108)
- Numeric options aren't validated (#107)
- Unclear errors for wrong arguments to open() and grid() (#106)
- Named imports type-check but the ES module only has a default export (#105)

## 1.3.2 – 2026-11-26

### Changes
- Keyboard handler throws when the event target isn't an element (#103)

## 1.3.1 – 2026-11-26

### Changes
- Methods called on a closed or unopened lightbox misbehave (#101)
- goTo() with a non-integer index crashes the gallery (#100)
- Two-finger touch can change slides or close the gallery when pinch zoom doesn't apply (#99)
- Slideshow timer doesn't restart after manual navigation (#98)
- Mouse drag keeps going after release outside the window or over a video player (#97)
- Grid filter doesn't hide cards that set their own display (#96)
- Website deploy after a release can be cancelled by the skipped run (#94)

## 1.3.0 – 2026-11-25

### Changes
- Check the bundle size in CI (#90)
- Run browser tests in CI (#89)
- Add an ES module build (#88)
- Ship TypeScript types (#87)
- Add a social preview image (#86)
- Add npm downloads, jsDelivr, bundle size and zero-dependency badges (#85)
- Add a code of conduct (#77)
- Add issue and pull request templates (#76)
- Add a contributing guide (#75)
- Add a security policy and private vulnerability reporting (#74)
- Add Dependabot for GitHub Actions (#73)

## 1.2.1 – 2026-11-25

### Changes
- Publish to npm with trusted publishing instead of a token (#71)
- Push release commits with the release-bot deploy key (#69)
- Add a manual workflow to publish a release to npm (#67)
- Show npm install and an npm badge in the README and website (#66)
- Publish each release to npm (#64)

## 1.2.0 – 2026-11-21

### Changes
- Failed images keep a zoom button that does nothing and a download link to the broken file (#62)
- Start times in YouTube and Vimeo links are dropped (#61)
- Zoomed images can't be panned with the keyboard (#60)

## 1.1.2 – 2026-11-21

### Changes
- Play on the last slide with loop: false shows a slideshow that never moves (#58)
- After one failed Foldbox.open(), every later open() throws until reload (#57)
- Setting only some labels in Foldbox.defaults gives "undefined" labels or stops galleries opening (#56)
- Docs: heading anchors add "#" to every heading's accessible name (#54)
- Website: theme toggle's aria-pressed is stale when the system theme changes (#53)
- Docs: video keys and modifier keys missing from Keyboard and touch (#52)
- Docs: swipe directions are reversed in Keyboard and touch (#51)
- Website: home page loads a YouTube thumbnail from i.ytimg.com on every visit (#50)
- Website demos ignore the page's dark mode switch (#48)
- Publish a GitHub Pages site with demos and documentation (#46)
- Improve the README (#45)

## 1.1.1 – 2026-11-19

### Changes
- Download button navigates away for files on another domain (#43)
- Gallery is blank after the first slide on right-to-left pages (#42)

## 1.1.0 – 2026-11-19

### Changes
- PRs should not commit dist/ or CHANGELOG.md (#38)
- Built-in light and auto (system) themes (#36)

## 1.0.4 – 2026-11-19

### Changed
- `Grid.filter()` reads all card positions before starting animations instead of forcing a layout per card, so filtering large grids is several times faster. (#32)

## 1.0.3 – 2026-11-20

### Fixed
- Images, videos and video posters are sized to their slide, so they are no longer cut off while a phone's address bar is showing or when the caption is long. (#17)
- Home and End in a focused video seek within the video instead of switching slides. (#18)
- YouTube videos play on sites that send `Referrer-Policy: no-referrer` instead of showing Error 153. (#22)
- Focus stays in the gallery when the slide holding it is left, and moves to the player when a video starts. (#23)
- Arrow, Home and End keys with Alt, Ctrl or Cmd are left to the browser, so Back and Forward shortcuts work. (#24)
- `data-download="false"` hides the download button for that link. (#25)
- An unknown `type` or `data-type` falls back to detecting the type from the URL. (#26)
- `src` can be a `URL` object. (#27)
- Re-filtering the grid during a fade-out no longer shows cards twice. (#28)

Thanks to @deshabhishek007 for reporting and fixing these.

## 1.0.2 – 2026-11-20

### Changed
- Escape always closes the gallery and the focus trap always works; `keyboard: false` now turns off only arrow, Home and End navigation. (#12)

### Fixed
- Controls in off-screen slides are no longer reachable with Tab. (#9)
- `Foldbox.bind()` leaves Ctrl, Cmd, Shift and Alt clicks to the browser, so links can open in a new tab. (#10)
- Grid cards fading out can no longer take focus. (#11)
- An item with `type: 'youtube'` or `'vimeo'` but no video ID falls back to type detection instead of embedding `/embed/undefined`. (#13)

Thanks to @deshabhishek007 for reporting and fixing these.

## 1.0.1 – 2026-11-20

### Security
- `Foldbox.bind()` shows `data-caption` as plain text, so captions from page markup cannot run scripts. New `htmlCaptions` option (default `true` for `open()`, `false` for `bind()`). (#1)
- The download button only uses `http:`, `https:` and `blob:` URLs. (#2)

### Added
- `youtubeThumbnails` option: set it to `false` so nothing is loaded from `i.ytimg.com` before the visitor presses play. (#3)

### Fixed
- Zoom no longer resets when a phone's address bar shows or hides. (#4)
- The finger left on the screen after a pinch keeps panning. (#5)
- Grid cards no longer jump when a filter is clicked during an animation. (#6)
- Videos with a `poster` but no `thumb` use the poster in the thumbnail strip. (#7)

Thanks to @deshabhishek007 for reporting and fixing these.

## 1.0.0 – 2026-11-19

First release: lightbox for images, MP4, YouTube and Vimeo with thumbnails, zoom, fullscreen, slideshow, download, swipe and keyboard support, plus an animated filterable grid.
