# Changelog

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
