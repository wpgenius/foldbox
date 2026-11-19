# Foldbox

A lightweight lightbox and filterable grid for photos and videos. No dependencies, no build step needed, MIT licensed.

- **Lightbox:** images, MP4/WebM, YouTube and Vimeo in one gallery.
- **Thumbnail strip**, captions and a counter.
- **Zoom:** double-click, pinch, trackpad pinch or the zoom button; drag to pan.
- **Fullscreen**, **slideshow** with a progress bar, and an optional **download** button.
- **Touch:** swipe between slides, swipe down to close.
- **Opening effect:** the gallery grows out of the thumbnail you clicked.
- **Accessible:** dialog semantics, focus trap, keyboard (arrows, Home, End, Esc), respects reduced motion.
- **Privacy friendly:** YouTube and Vimeo players load only when the visitor presses play (YouTube uses `youtube-nocookie.com`). YouTube thumbnails without your own `thumb` or `poster` still come from `i.ytimg.com` when the gallery opens; set `youtubeThumbnails: false` to stop that.
- **Filterable grid:** animate a grid between category filters (cards glide, fade and scale) with any CSS layout.

About 10 KB minified and gzipped (JS + CSS).

## Install

Download `dist/foldbox.min.js` and `dist/foldbox.min.css` (or the readable files in `src/`) and include them:

```html
<link rel="stylesheet" href="foldbox.min.css">
<script src="foldbox.min.js"></script>
```

Foldbox also works as a CommonJS or AMD module.

## Lightbox

### Open from JavaScript

```js
Foldbox.open(
	[
		{ src: 'photo-1.jpg', thumb: 'photo-1-thumb.jpg', alt: 'Beach', caption: '<h4>Beach</h4><p>Summer 2026</p>' },
		{ src: 'clip.mp4', poster: 'clip.jpg', thumb: 'clip-thumb.jpg' },
		{ src: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ' },
		{ src: 'https://vimeo.com/76979871', thumb: 'vimeo-thumb.jpg' },
	],
	{ index: 0, origin: document.querySelector( '#cover' ) }
);
```

### Bind links

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

Link attributes: `data-thumb`, `data-caption`, `data-type`, `data-poster`, `data-download` (a URL, or `false` to hide the button for that link).

`bind()` shows `data-caption` as plain text, because it comes from page markup that other people (such as post authors) may control. Pass `htmlCaptions: true` only if you trust everyone who can edit that markup.

### Items

| Field | Description |
|---|---|
| `src` | Image URL, video file URL, YouTube or Vimeo URL. The type is detected from it. |
| `type` | Optional: `image`, `video`, `youtube` or `vimeo`. |
| `sources` | Video files as `[{ src, type }]`, for several formats. |
| `thumb` | Thumbnail for the strip. Defaults to `poster`, and for YouTube to the video's thumbnail. |
| `poster` | Poster image for videos. |
| `alt` | Alternative text. |
| `caption` | Caption. Inserted as HTML unless `htmlCaptions` is `false`, so escape anything that comes from users. |
| `srcset` | Optional responsive image candidates. |
| `download` | Download URL, or `false` to hide the button for this item. |

### Options

| Option | Default | Description |
|---|---|---|
| `index` | `0` | Item to start with. |
| `loop` | `true` | Wrap from the last item to the first. |
| `animation` | `'slide'` | `'slide'` or `'fade'`. |
| `speed` | `400` | Transition time in ms. |
| `origin` | `null` | Element the gallery grows out of. |
| `className` | `''` | Extra class on the lightbox. |
| `counter` | `true` | Show "1 / 5". |
| `captions` | `true` | Show captions. |
| `htmlCaptions` | `true` | Insert captions as HTML. `false` shows them as plain text. `bind()` defaults to `false`. |
| `thumbnails` | `true` | Show the thumbnail strip. |
| `hideThumbsInFullscreen` | `false` | Hide the strip in fullscreen. |
| `zoom` | `true` | Allow zooming images. |
| `maxZoom` | `3` | Largest zoom factor. |
| `fullscreen` | `true` | Show the fullscreen button. |
| `slideshow` | `true` | Show the slideshow button. |
| `slideshowAutostart` | `false` | Start the slideshow on open. |
| `slideshowInterval` | `5000` | Time per slide in ms. |
| `download` | `false` | Show the download button. Only `http(s)` and `blob:` URLs are used. |
| `keyboard` | `true` | Arrow, Home and End navigation. Escape always closes. |
| `swipe` | `true` | Swipe between slides. |
| `swipeToClose` | `true` | Swipe down to close. |
| `closeOnBackdrop` | `true` | Click outside the media to close. |
| `youtubeNoCookie` | `true` | Use `youtube-nocookie.com`. |
| `youtubeThumbnails` | `true` | Load YouTube thumbnails from `i.ytimg.com` for items without `thumb` or `poster`. |
| `youtubeParams` | `{ rel: 0 }` | Extra YouTube player parameters. |
| `vimeoParams` | `{}` | Extra Vimeo player parameters. |
| `labels` | English | Texts for translation, e.g. `{ close: 'Fermer', counter: '%1 sur %2' }`. |
| `onOpen`, `onChange`, `onClose` | `null` | Callbacks: `( index, item, lightbox )`. |

The object returned by `Foldbox.open()` has `next()`, `prev()`, `goTo( i )`, `play()`, `pause()`, `toggleZoom()`, `toggleFullscreen()` and `close()`. `Foldbox.close()` closes whichever gallery is open.

### Styling

Change the look with CSS custom properties on `.foldbox`:

```css
.foldbox {
	--foldbox-bg: rgba(0, 0, 0, 0.9);
	--foldbox-accent: #ffcc00;
	--foldbox-thumb-size: 72px;
	--foldbox-top: 32px; /* e.g. leave room for a fixed header */
	--foldbox-z: 99999;
}
```

## Filterable grid

```js
const grid = Foldbox.grid( document.querySelector( '.grid' ), { itemSelector: ':scope > .card' } );

grid.filter( '.weddings' ); // CSS selector
grid.filter( '*' );         // everything
grid.filter( ( item ) => item.dataset.year === '2026' ); // function
```

Hidden items get the `hidden` attribute, so make sure your CSS hides them (`.card[hidden] { display: none; }`). The grid can use any layout: flex, CSS grid or floats.

Options: `itemSelector` (default `:scope > *`), `duration` (`400`), `easing` (`'ease'`).

## Browser support

Current versions of Chrome, Edge, Firefox and Safari (desktop and mobile).

## Development

```bash
npm install
npm run build
```

Open `demo/index.html` through a local web server to try it.

### Releases

Releases are automatic. When a change to `src/` is merged into `main`, the release workflow bumps the version, rebuilds `dist/`, writes the `CHANGELOG.md` entry and publishes a GitHub release with the minified files.

- **In a PR, change `src/` (and docs) only.** Don't commit `dist/` or `CHANGELOG.md`, and don't change version numbers; the release does that. CI fails if a PR touches `dist/` or `CHANGELOG.md`, so open PRs never conflict with a release.
- **Changelog:** one line per issue closed since the previous release, so link your PR to its issue (`Fixes #12`).
- **Version:** patch by default. Label the PR `release: minor` or `release: major` for a bigger bump.

## Licence

[MIT](LICENSE) © WPGenius
