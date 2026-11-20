# Foldbox

[![Latest release](https://img.shields.io/github/v/release/wpgenius/foldbox)](https://github.com/wpgenius/foldbox/releases/latest)
[![CI](https://github.com/wpgenius/foldbox/actions/workflows/ci.yml/badge.svg)](https://github.com/wpgenius/foldbox/actions/workflows/ci.yml)
[![MIT licence](https://img.shields.io/github/license/wpgenius/foldbox)](LICENSE)

A small, dependency-free **lightbox** and **filterable grid** for photos and videos. The gallery unfolds from the thumbnail you click; the grid animates between category filters.

**[Live demos](https://wpgenius.github.io/foldbox/)** · **[Documentation](https://wpgenius.github.io/foldbox/docs.html)** · **[Releases](https://github.com/wpgenius/foldbox/releases)**

## Features

- **Images and video in one gallery:** JPG, PNG and WebP (with `srcset`), MP4 and WebM, YouTube and Vimeo.
- **Thumbnail strip**, captions and a counter.
- **Zoom:** double-click, pinch, trackpad pinch or the zoom button; drag to pan.
- **Fullscreen**, **slideshow** with a progress bar, and an optional **download** button.
- **Touch:** swipe between slides, swipe down to close.
- **Themes:** dark, light or automatic, plus CSS custom properties for your own look.
- **Accessible:** dialog semantics, focus trap, keyboard (arrows, Home, End, Esc), respects reduced motion.
- **Privacy friendly:** YouTube and Vimeo players load only when the visitor presses play; YouTube uses `youtube-nocookie.com`.
- **Filterable grid:** cards glide, fade and scale between filters, with any CSS layout.
- **Translatable** and works on right-to-left pages.

No dependencies, about 11 KB minified and gzipped (JS + CSS).

## Install

From the jsDelivr CDN:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/wpgenius/foldbox@1/dist/foldbox.min.css">
<script src="https://cdn.jsdelivr.net/gh/wpgenius/foldbox@1/dist/foldbox.min.js"></script>
```

`@1` follows the latest 1.x release; pin an exact version (such as `@1.1.1`) in production. Or download `foldbox.min.js` and `foldbox.min.css` from the [latest release](https://github.com/wpgenius/foldbox/releases/latest). Foldbox also works as a CommonJS or AMD module.

## Quick start

### Open a gallery from JavaScript

```js
const items = [
	{ src: 'beach.jpg', thumb: 'beach-thumb.jpg', alt: 'Beach', caption: 'Summer 2026' },
	{ src: 'clip.mp4', poster: 'clip.jpg' },
	{ src: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ' },
	{ src: 'https://vimeo.com/76979871', thumb: 'vimeo-thumb.jpg' },
];

button.addEventListener( 'click', () => {
	Foldbox.open( items, { origin: button, theme: 'auto' } );
} );
```

### Turn links into a gallery

```html
<div id="gallery">
	<a href="large-1.jpg" data-caption="First"><img src="small-1.jpg" alt=""></a>
	<a href="large-2.jpg" data-caption="Second"><img src="small-2.jpg" alt=""></a>
	<a href="https://youtu.be/aqz-KE-bpKQ">Video</a>
</div>
<script>
	Foldbox.bind( '#gallery', { download: true } );
</script>
```

### Filter a grid

```js
const grid = Foldbox.grid( document.querySelector( '.grid' ), { itemSelector: ':scope > .card' } );

grid.filter( '.weddings' ); // CSS selector
grid.filter( '*' );         // everything
grid.filter( ( item ) => item.dataset.year === '2026' );
```

Hidden items get the `hidden` attribute, so hide them in your CSS: `.card[hidden] { display: none; }`.

## API at a glance

| | |
|---|---|
| `Foldbox.open( items, options )` | Open a gallery. Returns an object with `next()`, `prev()`, `goTo( i )`, `play()`, `pause()`, `toggleZoom()`, `toggleFullscreen()` and `close()`. |
| `Foldbox.bind( container, options )` | Open the links inside a container in a gallery. Returns an unbind function. |
| `Foldbox.grid( element, options )` | Make a filterable grid with `filter( selector \| fn, instant )`. |
| `Foldbox.close()` | Close the open gallery. |
| `Foldbox.defaults` | Default options for every gallery. |

Commonly used options: `index`, `loop`, `animation` (`'slide'` / `'fade'`), `theme` (`'dark'` / `'light'` / `'auto'`), `thumbnails`, `zoom`, `fullscreen`, `slideshow`, `download`, `captions`, `labels` and the `onOpen` / `onChange` / `onClose` callbacks.

The [documentation](https://wpgenius.github.io/foldbox/docs.html) covers every item field, option, CSS property and translation label.

## Styling

```css
.foldbox {
	--foldbox-bg: rgba(0, 0, 0, 0.9);
	--foldbox-accent: #ffcc00;
	--foldbox-top: 32px; /* leave room for a fixed header */
}
```

See [Themes and styling](https://wpgenius.github.io/foldbox/docs.html#themes) for all properties and how to make your own theme.

## Captions and security

`Foldbox.open()` inserts captions as HTML, so escape anything that comes from users (or pass `htmlCaptions: false`). `Foldbox.bind()` shows captions as plain text by default, because they come from page markup.

## Browser support

Current versions of Chrome, Edge, Firefox and Safari, on desktop and mobile.

## Contributing

Issues and pull requests are welcome.

```bash
npm install
npm run build   # dist/foldbox.min.js and dist/foldbox.min.css
npm run site    # assemble the website into _site/
```

Open `demo/index.html` (development demo, uses `src/`) or `_site/index.html` (the website) through a local web server.

- **In a PR, change `src/`, `site/` and docs only.** Don't commit `dist/` or `CHANGELOG.md`, and don't change version numbers; the release workflow does that. CI fails if a PR touches `dist/` or `CHANGELOG.md`.
- **Link your PR to its issue** (`Fixes #12`): the changelog lists one line per issue closed since the previous release.
- **Version:** patch by default. Label the PR `release: minor` or `release: major` for a bigger bump.

### Releases and website

Releases are automatic. When a change to `src/` is merged into `main`, the release workflow bumps the version, rebuilds `dist/`, writes the `CHANGELOG.md` entry and publishes a GitHub release with the minified files. The website in `site/` is published to GitHub Pages when it changes and after every release, so the demos always use the latest version.

## Licence

[MIT](LICENSE) © WPGenius
