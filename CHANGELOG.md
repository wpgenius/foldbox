# Changelog

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
