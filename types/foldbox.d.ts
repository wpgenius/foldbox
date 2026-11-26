// Type definitions for Foldbox: https://github.com/wpgenius/foldbox
// Documentation: https://wpgenius.github.io/foldbox/docs.html

declare namespace Foldbox {
	/** The kind of item. Detected from `src` when left out. */
	type ItemType = 'image' | 'video' | 'youtube' | 'vimeo';

	/** One video file of an item with several formats. */
	interface VideoSource {
		src: string;
		/** MIME type, such as `'video/webm'`. */
		type?: string;
	}

	/** One gallery item. A plain string is the same as `{ src }`. */
	interface Item {
		/** Image URL, video file URL, or YouTube or Vimeo link. The type is detected from it. */
		src?: string | URL;
		/** Set when detection from `src` isn't enough. */
		type?: ItemType;
		/** Video files to offer several formats. */
		sources?: VideoSource[];
		/** Thumbnail for the strip. Defaults to `poster`, and for YouTube to the video's thumbnail. */
		thumb?: string;
		/** Poster image for videos. */
		poster?: string;
		/** YouTube or Vimeo start time in seconds. Read from the link (`?t=90`, `#t=1m30s`) when left out. */
		start?: number;
		/** Alternative text for the image. */
		alt?: string;
		/** Title of the YouTube or Vimeo player frame. Defaults to `alt`. */
		title?: string;
		/** Caption. Inserted as HTML unless `htmlCaptions` is `false`. */
		caption?: string;
		/** Responsive image candidates, such as `'photo-1024.jpg 1024w, photo-2048.jpg 2048w'`. */
		srcset?: string;
		/** Download URL (such as the original file), or `false` to hide the button for this item. */
		download?: string | false;
		/** YouTube or Vimeo video ID, when there's no link in `src`. */
		videoId?: string;
		/** Hash of a private (unlisted) Vimeo video. */
		hash?: string;
	}

	/** Text shown or read out by the gallery. `counter` uses `%1` (position) and `%2` (total). */
	interface Labels {
		dialog: string;
		close: string;
		prev: string;
		next: string;
		zoomIn: string;
		zoomOut: string;
		fullscreen: string;
		exitFullscreen: string;
		play: string;
		pause: string;
		download: string;
		playVideo: string;
		counter: string;
		error: string;
	}

	/** Called with the current position (from 0), the current item and the lightbox. */
	type Callback = ( this: Lightbox, index: number, item: Item, lightbox: Lightbox ) => void;

	interface Options {
		/** Item to start at, from 0. Default `0`. */
		index?: number;
		/** Go from the last item to the first and back. Default `true`. */
		loop?: boolean;
		/** Transition between items. Default `'slide'`. */
		animation?: 'slide' | 'fade';
		/** Transition length in milliseconds. Default `400`. Values below 0 fall back to the default. */
		speed?: number;
		/** Element the gallery opens from, with a zoom effect. Default `null`. */
		origin?: Element | null;
		/** Colour theme. `'auto'` follows the system setting. Default `'dark'`. */
		theme?: 'dark' | 'light' | 'auto';
		/** Extra class names for the gallery element, for your own styles. */
		className?: string;
		/** Show the "1 / 10" counter. Default `true`. */
		counter?: boolean;
		/** Show captions. Default `true`. */
		captions?: boolean;
		/** Insert captions as HTML. Default `true` for `open()`, `false` for `bind()`. */
		htmlCaptions?: boolean;
		/** Show the thumbnail strip. Default `true`. */
		thumbnails?: boolean;
		/** Hide the thumbnail strip in fullscreen. Default `false`. */
		hideThumbsInFullscreen?: boolean;
		/** Allow zooming images. Default `true`. */
		zoom?: boolean;
		/** Largest zoom factor. Default `3`. Values below 1 fall back to the default. */
		maxZoom?: number;
		/** Show the fullscreen button. Default `true`. */
		fullscreen?: boolean;
		/** Show the slideshow button. Default `true`. */
		slideshow?: boolean;
		/** Start the slideshow when the gallery opens. Default `false`. */
		slideshowAutostart?: boolean;
		/** Time per item in the slideshow, in milliseconds. Default `5000`. Values below 100 fall back to the default. */
		slideshowInterval?: number;
		/** Show a download button. Default `false`. */
		download?: boolean;
		/** Keyboard navigation. Default `true`. */
		keyboard?: boolean;
		/** Swipe between items on touch screens. Default `true`. */
		swipe?: boolean;
		/** Swipe down to close. Default `true`. */
		swipeToClose?: boolean;
		/** Close when the backdrop is clicked. Default `true`. */
		closeOnBackdrop?: boolean;
		/** Play YouTube videos from youtube-nocookie.com. Default `true`. */
		youtubeNoCookie?: boolean;
		/** Load YouTube thumbnails from i.ytimg.com for items without `thumb` or `poster`. Default `true`. */
		youtubeThumbnails?: boolean;
		/** Extra YouTube player parameters. Replaces the default `{ rel: 0 }`. */
		youtubeParams?: Record<string, string | number | boolean>;
		/** Extra Vimeo player parameters. */
		vimeoParams?: Record<string, string | number | boolean>;
		/** Translations. Labels you leave out stay in English. */
		labels?: Partial<Labels>;
		/** Called once the gallery is open. */
		onOpen?: Callback | null;
		/** Called when another item is shown. */
		onChange?: Callback | null;
		/** Called when the gallery closes. */
		onClose?: Callback | null;
	}

	/** Options for `Foldbox.bind()`: lightbox options plus the link selector. */
	interface BindOptions extends Options {
		/** Which links inside the container open the gallery. Default `'a[href]'`. */
		selector?: string;
	}

	/** The gallery returned by `Foldbox.open()`. */
	interface Lightbox {
		/** The options in use, defaults included. */
		readonly options: Required<Omit<Options, 'labels'>> & { labels: Labels };
		/** The items, with their types and thumbnails filled in. */
		readonly items: Item[];
		/** Position of the current item, from 0. */
		readonly index: number;
		/** Whether the gallery is open. */
		readonly isOpen: boolean;
		/** Open the gallery (`Foldbox.open()` already does). */
		open(): this;
		/** Go to an item by its position, from 0. */
		goTo( index: number, instant?: boolean ): this;
		/** Go to the next item. */
		next(): this;
		/** Go to the previous item. */
		prev(): this;
		/** Start the slideshow. */
		play(): this;
		/** Stop the slideshow. */
		pause(): this;
		/** Zoom the current image in or out, around a point on the screen (default: the centre). */
		toggleZoom( clientX?: number, clientY?: number ): void;
		/** Enter or leave fullscreen. */
		toggleFullscreen(): void;
		/** Close the gallery. `immediate` skips the closing animation. */
		close( immediate?: boolean ): this;
		/** Close the gallery at once and remove it. */
		destroy(): this;
	}

	interface LightboxConstructor {
		new ( items: Array<Item | string>, options?: Options ): Lightbox;
		prototype: Lightbox;
	}

	interface GridOptions {
		/** Which children are grid items. Default `':scope > *'`. */
		itemSelector?: string;
		/** Animation length in milliseconds. Default `400`. */
		duration?: number;
		/** CSS easing of the animation. Default `'ease'`. */
		easing?: string;
	}

	/** A filterable grid returned by `Foldbox.grid()`. */
	interface Grid {
		/** The grid container. */
		readonly grid: Element;
		readonly options: Required<GridOptions>;
		/** The grid items. */
		items(): Element[];
		/**
		 * Show only the items that match: `'*'` for all, a CSS selector, or a function.
		 * `instant` skips the animation.
		 */
		filter( filter: string | ( ( item: Element ) => boolean ), instant?: boolean ): this;
	}

	interface GridConstructor {
		/** Throws a `TypeError` when no element is found. */
		new ( element: Element | string, options?: GridOptions ): Grid;
		prototype: Grid;
	}
}

declare const Foldbox: {
	/** The version, such as `'1.2.1'`. */
	readonly version: string;
	/** Default options, shared by every gallery. Change them to set options for the whole page. */
	defaults: Required<Omit<Foldbox.Options, 'labels'>> & { labels: Partial<Foldbox.Labels> };
	/** Open a gallery. Strings are image or video URLs. Throws a `TypeError` when `items` isn't an array. */
	open( items: Array<Foldbox.Item | string>, options?: Foldbox.Options ): Foldbox.Lightbox;
	/** Open the links inside a container in a gallery. Returns a function that undoes it. */
	bind( container: Element | string | null, options?: Foldbox.BindOptions ): () => void;
	/** Make a filterable grid from an element or a CSS selector. Throws a `TypeError` when no element is found. */
	grid( element: Element | string, options?: Foldbox.GridOptions ): Foldbox.Grid;
	/** Close whichever gallery is open. */
	close(): void;
	Lightbox: Foldbox.LightboxConstructor;
	Grid: Foldbox.GridConstructor;
};

export = Foldbox;
export as namespace Foldbox;
