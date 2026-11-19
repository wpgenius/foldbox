/*!
 * Foldbox 1.0.1 – lightbox and filterable grid for photos and videos.
 * https://github.com/wpgenius/foldbox
 * (c) WPGenius. Released under the MIT License.
 */
( function ( root, factory ) {
	if ( typeof define === 'function' && define.amd ) {
		define( [], factory );
	} else if ( typeof module === 'object' && module.exports ) {
		module.exports = factory();
	} else {
		root.Foldbox = factory();
	}
} )( typeof self !== 'undefined' ? self : this, function () {
	'use strict';

	const VERSION = '1.0.1';

	const DEFAULTS = {
		index: 0,
		loop: true,
		animation: 'slide', // 'slide' or 'fade'.
		speed: 400,
		origin: null, // Element the gallery opens from (zoom-in effect).
		className: '',
		counter: true,
		captions: true,
		htmlCaptions: true, // false inserts captions as plain text. bind() defaults to false.
		thumbnails: true,
		hideThumbsInFullscreen: false,
		zoom: true,
		maxZoom: 3,
		fullscreen: true,
		slideshow: true,
		slideshowAutostart: false,
		slideshowInterval: 5000,
		download: false,
		keyboard: true,
		swipe: true,
		swipeToClose: true,
		closeOnBackdrop: true,
		youtubeNoCookie: true,
		youtubeThumbnails: true, // Fetch the thumbnail from i.ytimg.com when no thumb/poster is given.
		youtubeParams: { rel: 0 },
		vimeoParams: {},
		labels: {
			dialog: 'Gallery',
			close: 'Close',
			prev: 'Previous',
			next: 'Next',
			zoomIn: 'Zoom in',
			zoomOut: 'Zoom out',
			fullscreen: 'Fullscreen',
			exitFullscreen: 'Exit fullscreen',
			play: 'Start slideshow',
			pause: 'Pause slideshow',
			download: 'Download',
			playVideo: 'Play video',
			counter: '%1 / %2',
			error: 'This item could not be loaded.',
		},
		onOpen: null,
		onChange: null,
		onClose: null,
	};

	const ICONS = {
		close: '<path d="M6 6l12 12M18 6L6 18"/>',
		prev: '<path d="M15 5l-7 7 7 7"/>',
		next: '<path d="M9 5l7 7-7 7"/>',
		zoomIn: '<circle cx="11" cy="11" r="6"/><path d="M20 20l-4.5-4.5M11 8v6M8 11h6"/>',
		zoomOut: '<circle cx="11" cy="11" r="6"/><path d="M20 20l-4.5-4.5M8 11h6"/>',
		fullscreen: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
		exitFullscreen: '<path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"/>',
		play: '<path d="M8 5l11 7-11 7z"/>',
		pause: '<path d="M8 5v14M16 5v14"/>',
		download: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
	};

	const reducedMotion = function () {
		return (
			typeof window.matchMedia === 'function' &&
			window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches
		);
	};

	function el( tag, className, attrs ) {
		const node = document.createElement( tag );
		if ( className ) {
			node.className = className;
		}
		if ( attrs ) {
			Object.keys( attrs ).forEach( function ( key ) {
				node.setAttribute( key, attrs[ key ] );
			} );
		}
		return node;
	}

	function icon( name ) {
		return (
			'<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
			ICONS[ name ] +
			'</svg>'
		);
	}

	function button( name, label ) {
		const node = el( 'button', 'foldbox__btn foldbox__btn--' + name, {
			type: 'button',
			'aria-label': label,
			title: label,
		} );
		node.innerHTML = icon( name );
		return node;
	}

	function query( params ) {
		return Object.keys( params || {} )
			.map( function ( key ) {
				return (
					encodeURIComponent( key ) +
					'=' +
					encodeURIComponent( params[ key ] )
				);
			} )
			.join( '&' );
	}

	/**
	 * Return the URL if it is http(s) or blob (relative URLs included), else ''.
	 *
	 * @param {string} url URL to check.
	 * @return {string} The URL or ''.
	 */
	function safeUrl( url ) {
		if ( ! url ) {
			return '';
		}
		try {
			const protocol = new URL( url, document.baseURI ).protocol;
			return protocol === 'http:' || protocol === 'https:' || protocol === 'blob:' ? url : '';
		} catch ( e ) {
			return '';
		}
	}

	/* ------------------------------------------------------------------ */
	/* Items                                                               */
	/* ------------------------------------------------------------------ */

	const YOUTUBE =
		/(?:youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/|v\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/;
	const VIMEO = /vimeo\.com\/(?:.*\/)?(?:video\/)?(\d{5,})(?:\/([A-Za-z0-9]+))?/;
	const VIDEO_FILE = /\.(mp4|webm|ogv|mov|m4v)(?:[?#]|$)/i;

	/**
	 * Fill in the type of an item from its fields or URL.
	 *
	 * @param {Object} raw     Item as given by the caller.
	 * @param {Object} options Lightbox options.
	 * @return {Object} Normalised copy.
	 */
	function normalize( raw, options ) {
		const item = Object.assign( {}, typeof raw === 'string' ? { src: raw } : raw );
		const src = item.src || '';
		let m;

		if ( ! item.type ) {
			if ( item.sources && item.sources.length ) {
				item.type = 'video';
			} else if ( ( m = src.match( YOUTUBE ) ) ) {
				item.type = 'youtube';
				item.videoId = m[ 1 ];
			} else if ( ( m = src.match( VIMEO ) ) ) {
				item.type = 'vimeo';
				item.videoId = m[ 1 ];
				const hash = src.match( /[?&]h=([A-Za-z0-9]+)/ );
				item.hash = m[ 2 ] || ( hash ? hash[ 1 ] : '' );
			} else if ( VIDEO_FILE.test( src ) ) {
				item.type = 'video';
			} else {
				item.type = 'image';
			}
		}
		if ( item.type === 'video' && ! ( item.sources && item.sources.length ) ) {
			item.sources = [ { src } ];
		}
		if ( item.type === 'youtube' && ! item.videoId && ( m = src.match( YOUTUBE ) ) ) {
			item.videoId = m[ 1 ];
		}
		if ( item.type === 'vimeo' && ! item.videoId && ( m = src.match( VIMEO ) ) ) {
			item.videoId = m[ 1 ];
			item.hash = m[ 2 ] || '';
		}
		if ( ! item.thumb && item.poster ) {
			item.thumb = item.poster;
		}
		if ( ! item.thumb && item.type === 'youtube' && item.videoId && options.youtubeThumbnails ) {
			item.thumb = 'https://i.ytimg.com/vi/' + item.videoId + '/hqdefault.jpg';
		}
		if ( ! item.thumb && item.type === 'image' ) {
			item.thumb = src;
		}
		return item;
	}

	/* ------------------------------------------------------------------ */
	/* Lightbox                                                            */
	/* ------------------------------------------------------------------ */

	let openInstance = null;

	/**
	 * A lightbox showing a list of items.
	 *
	 * @param {Array}  items   Items: { src, thumb, alt, caption, type, sources, poster, download }.
	 * @param {Object} options See DEFAULTS.
	 */
	function Lightbox( items, options ) {
		this.options = Object.assign( {}, DEFAULTS, options || {} );
		this.options.labels = Object.assign(
			{},
			DEFAULTS.labels,
			( options && options.labels ) || {}
		);
		const self = this;
		this.items = ( items || [] ).map( function ( item ) {
			return normalize( item, self.options );
		} );
		this.index = 0;
		this.slides = [];
		this.zoomState = { scale: 1, x: 0, y: 0 };
		this.pointers = new Map();
		this.timer = null;
		this.isOpen = false;
		this.handlers = {};
	}

	Lightbox.prototype = {
		/**
		 * Build the DOM and show the gallery.
		 */
		open() {
			if ( ! this.items.length || this.isOpen ) {
				return this;
			}
			if ( openInstance ) {
				openInstance.close( true );
			}
			openInstance = this;
			this.isOpen = true;
			this.lastFocus = document.activeElement;
			this.build();
			this.lockScroll();
			this.bind();

			const start = Math.min(
				Math.max( parseInt( this.options.index, 10 ) || 0, 0 ),
				this.items.length - 1
			);
			this.goTo( start, true );

			const self = this;
			window.requestAnimationFrame( function () {
				self.root.classList.add( 'is-open' );
				self.zoomFromOrigin();
			} );
			this.buttons.close.focus( { preventScroll: true } );

			if ( this.options.slideshow && this.options.slideshowAutostart ) {
				this.play();
			}
			this.emit( 'onOpen' );
			return this;
		},

		build() {
			const o = this.options;
			const L = o.labels;
			const root = el( 'div', 'foldbox foldbox--' + ( o.animation === 'fade' ? 'fade' : 'slide' ), {
				role: 'dialog',
				'aria-modal': 'true',
				'aria-label': L.dialog,
				tabindex: '-1',
			} );
			if ( o.className ) {
				root.className += ' ' + o.className;
			}
			if ( o.hideThumbsInFullscreen ) {
				root.classList.add( 'foldbox--hide-thumbs-fs' );
			}
			if ( this.items.length < 2 ) {
				root.classList.add( 'foldbox--single' );
			}
			root.style.setProperty( '--foldbox-speed', o.speed + 'ms' );

			const backdrop = el( 'div', 'foldbox__backdrop' );
			const toolbar = el( 'div', 'foldbox__toolbar' );
			const counter = el( 'div', 'foldbox__counter', { 'aria-live': 'polite' } );
			const actions = el( 'div', 'foldbox__actions' );
			const progress = el( 'div', 'foldbox__progress' );
			progress.appendChild( el( 'span' ) );

			this.buttons = {};
			if ( o.zoom ) {
				this.buttons.zoom = actions.appendChild( button( 'zoomIn', L.zoomIn ) );
			}
			if ( o.slideshow && this.items.length > 1 ) {
				this.buttons.play = actions.appendChild( button( 'play', L.play ) );
			}
			if ( o.fullscreen && ( document.fullscreenEnabled || document.webkitFullscreenEnabled ) ) {
				this.buttons.fullscreen = actions.appendChild( button( 'fullscreen', L.fullscreen ) );
			}
			if ( o.download ) {
				const link = el( 'a', 'foldbox__btn foldbox__btn--download', {
					'aria-label': L.download,
					title: L.download,
					download: '',
				} );
				link.innerHTML = icon( 'download' );
				this.buttons.download = actions.appendChild( link );
			}
			this.buttons.close = actions.appendChild( button( 'close', L.close ) );

			if ( o.counter ) {
				toolbar.appendChild( counter );
			}
			toolbar.appendChild( actions );

			const stage = el( 'div', 'foldbox__stage' );
			const track = el( 'div', 'foldbox__track' );
			this.slides = this.items.map( function ( item, i ) {
				const slide = el( 'div', 'foldbox__slide foldbox__slide--' + item.type, {
					'data-index': String( i ),
					'aria-hidden': 'true',
				} );
				track.appendChild( slide );
				return slide;
			} );
			stage.appendChild( track );

			const prev = button( 'prev', L.prev );
			const next = button( 'next', L.next );
			prev.classList.add( 'foldbox__nav', 'foldbox__nav--prev' );
			next.classList.add( 'foldbox__nav', 'foldbox__nav--next' );
			this.buttons.prev = prev;
			this.buttons.next = next;

			const footer = el( 'div', 'foldbox__footer' );
			const caption = el( 'div', 'foldbox__caption' );
			footer.appendChild( caption );

			let thumbs = null;
			if ( o.thumbnails && this.items.length > 1 ) {
				thumbs = el( 'div', 'foldbox__thumbs' );
				const total = String( this.items.length );
				this.thumbButtons = this.items.map( function ( item, i ) {
					const thumb = el( 'button', 'foldbox__thumb foldbox__thumb--' + item.type, {
						type: 'button',
						'aria-label': L.counter.replace( '%1', String( i + 1 ) ).replace( '%2', total ),
						'data-index': String( i ),
					} );
					if ( item.thumb ) {
						const img = el( 'img', '', { alt: '', loading: 'lazy', draggable: 'false' } );
						img.src = item.thumb;
						thumb.appendChild( img );
					}
					thumbs.appendChild( thumb );
					return thumb;
				} );
				footer.appendChild( thumbs );
			}

			root.appendChild( backdrop );
			root.appendChild( toolbar );
			root.appendChild( progress );
			root.appendChild( stage );
			if ( this.items.length > 1 ) {
				root.appendChild( prev );
				root.appendChild( next );
			}
			root.appendChild( footer );
			document.body.appendChild( root );

			this.root = root;
			this.stage = stage;
			this.track = track;
			this.counter = counter;
			this.caption = caption;
			this.footer = footer;
			this.thumbs = thumbs;
			this.progress = progress;
			this.backdrop = backdrop;
		},

		bind() {
			const self = this;
			const on = function ( target, type, fn, opts ) {
				target.addEventListener( type, fn, opts );
				( self.handlers[ type ] = self.handlers[ type ] || [] ).push( [ target, fn, opts ] );
			};

			on( this.buttons.close, 'click', function () {
				self.close();
			} );
			on( this.buttons.prev, 'click', function () {
				self.prev();
			} );
			on( this.buttons.next, 'click', function () {
				self.next();
			} );
			if ( this.buttons.zoom ) {
				on( this.buttons.zoom, 'click', function () {
					self.toggleZoom();
				} );
			}
			if ( this.buttons.play ) {
				on( this.buttons.play, 'click', function () {
					if ( self.timer ) {
						self.pause();
					} else {
						self.play();
					}
				} );
			}
			if ( this.buttons.fullscreen ) {
				on( this.buttons.fullscreen, 'click', function () {
					self.toggleFullscreen();
				} );
				on( document, 'fullscreenchange', function () {
					self.onFullscreenChange();
				} );
				on( document, 'webkitfullscreenchange', function () {
					self.onFullscreenChange();
				} );
			}
			if ( this.thumbs ) {
				on( this.thumbs, 'click', function ( event ) {
					const thumb = event.target.closest( '.foldbox__thumb' );
					if ( thumb ) {
						self.goTo( parseInt( thumb.getAttribute( 'data-index' ), 10 ) );
					}
				} );
			}

			on( document, 'keydown', function ( event ) {
				self.onKey( event );
			} );

			// Pointer: swipe, swipe to close, pan and pinch zoom.
			on( this.stage, 'pointerdown', function ( event ) {
				self.onPointerDown( event );
			} );
			on( window, 'pointermove', function ( event ) {
				self.onPointerMove( event );
			} );
			on( window, 'pointerup', function ( event ) {
				self.onPointerUp( event );
			} );
			on( window, 'pointercancel', function ( event ) {
				self.onPointerUp( event );
			} );
			on( this.stage, 'dblclick', function ( event ) {
				if ( self.options.zoom && event.target.classList.contains( 'foldbox__img' ) ) {
					self.toggleZoom( event.clientX, event.clientY );
				}
			} );
			on(
				this.stage,
				'wheel',
				function ( event ) {
					self.onWheel( event );
				},
				{ passive: false }
			);
			on( this.stage, 'click', function ( event ) {
				if ( self.dragged ) {
					self.dragged = false;
					return;
				}
				const play = event.target.closest( '.foldbox__play' );
				if ( play ) {
					self.playEmbed( parseInt( play.getAttribute( 'data-index' ), 10 ) );
					return;
				}
				if (
					self.options.closeOnBackdrop &&
					( event.target.classList.contains( 'foldbox__slide' ) ||
						event.target === self.stage ||
						event.target.classList.contains( 'foldbox__track' ) )
				) {
					self.close();
				}
			} );
			// Keep the zoom level (mobile address bars fire resize while panning);
			// only keep the image inside the new stage size.
			on( window, 'resize', function () {
				self.clampZoom();
				self.applyZoom( false );
			} );
		},

		unbind() {
			const handlers = this.handlers;
			Object.keys( handlers ).forEach( function ( type ) {
				handlers[ type ].forEach( function ( entry ) {
					entry[ 0 ].removeEventListener( type, entry[ 1 ], entry[ 2 ] );
				} );
			} );
			this.handlers = {};
		},

		/* Navigation ---------------------------------------------------- */

		goTo( index, instant ) {
			const count = this.items.length;
			if ( this.options.loop ) {
				index = ( ( index % count ) + count ) % count;
			} else {
				index = Math.min( Math.max( index, 0 ), count - 1 );
			}
			const previous = this.index;
			const changed = index !== previous || instant;
			if ( ! changed ) {
				return this;
			}
			if ( this.slides[ previous ] ) {
				this.leaveSlide( previous );
			}
			this.index = index;
			this.resetZoom();

			const self = this;
			this.slides.forEach( function ( slide, i ) {
				const active = i === index;
				slide.classList.toggle( 'is-active', active );
				slide.setAttribute( 'aria-hidden', active ? 'false' : 'true' );
				if ( self.isNear( i ) ) {
					self.load( i );
				}
			} );

			this.track.style.transition = instant ? 'none' : '';
			if ( this.options.animation !== 'fade' ) {
				this.track.style.transform = 'translate3d(' + -index * 100 + '%, 0, 0)';
			}
			if ( instant ) {
				// Force the jump, then restore transitions.
				void this.track.offsetWidth;
				this.track.style.transition = '';
			}

			this.updateUi();
			if ( this.timer ) {
				this.restartProgress();
			}
			if ( ! instant ) {
				this.emit( 'onChange' );
			}
			return this;
		},

		next() {
			if ( ! this.options.loop && this.index >= this.items.length - 1 ) {
				this.bounce( -1 );
				return this;
			}
			return this.goTo( this.index + 1 );
		},

		prev() {
			if ( ! this.options.loop && this.index <= 0 ) {
				this.bounce( 1 );
				return this;
			}
			return this.goTo( this.index - 1 );
		},

		bounce( direction ) {
			if ( reducedMotion() || ! this.track.animate ) {
				return;
			}
			const base = this.options.animation === 'fade' ? 0 : -this.index * 100;
			this.track.animate(
				[
					{ transform: 'translate3d(' + base + '%,0,0)' },
					{ transform: 'translate3d(calc(' + base + '% + ' + direction * 40 + 'px),0,0)' },
					{ transform: 'translate3d(' + base + '%,0,0)' },
				],
				{ duration: 300, easing: 'ease-out' }
			);
		},

		isNear( i ) {
			const count = this.items.length;
			const d = Math.abs( i - this.index );
			return d <= 1 || ( this.options.loop && count > 2 && d === count - 1 );
		},

		updateUi() {
			const o = this.options;
			const item = this.items[ this.index ];
			const count = this.items.length;

			this.counter.textContent = o.labels.counter
				.replace( '%1', String( this.index + 1 ) )
				.replace( '%2', String( count ) );

			if ( o.captions && item.caption ) {
				if ( o.htmlCaptions ) {
					this.caption.innerHTML = item.caption;
				} else {
					this.caption.textContent = item.caption;
				}
				this.caption.hidden = false;
			} else {
				this.caption.innerHTML = '';
				this.caption.hidden = true;
			}

			if ( this.buttons.prev ) {
				this.buttons.prev.disabled = ! o.loop && this.index === 0;
				this.buttons.next.disabled = ! o.loop && this.index === count - 1;
			}
			if ( this.buttons.zoom ) {
				this.buttons.zoom.hidden = item.type !== 'image';
			}
			if ( this.buttons.download ) {
				const url = safeUrl( item.download === false ? '' : item.download || ( item.type === 'image' ? item.src : item.type === 'video' ? item.sources[ 0 ].src : '' ) );
				this.buttons.download.hidden = ! url;
				if ( url ) {
					this.buttons.download.href = url;
				} else {
					this.buttons.download.removeAttribute( 'href' );
				}
			}
			if ( this.thumbButtons ) {
				const index = this.index;
				this.thumbButtons.forEach( function ( thumb, i ) {
					thumb.classList.toggle( 'is-active', i === index );
					if ( i === index ) {
						thumb.setAttribute( 'aria-current', 'true' );
					} else {
						thumb.removeAttribute( 'aria-current' );
					}
				} );
				const active = this.thumbButtons[ index ];
				const strip = this.thumbs;
				const left = active.offsetLeft - ( strip.clientWidth - active.offsetWidth ) / 2;
				if ( typeof strip.scrollTo === 'function' ) {
					strip.scrollTo( { left, behavior: reducedMotion() ? 'auto' : 'smooth' } );
				} else {
					strip.scrollLeft = left;
				}
			}
		},

		/* Slide content ------------------------------------------------- */

		load( i ) {
			const slide = this.slides[ i ];
			if ( slide.getAttribute( 'data-loaded' ) ) {
				return;
			}
			slide.setAttribute( 'data-loaded', '1' );
			const item = this.items[ i ];
			const L = this.options.labels;

			if ( item.type === 'image' ) {
				const wrap = el( 'div', 'foldbox__zoom' );
				const img = el( 'img', 'foldbox__img', { alt: item.alt || '', draggable: 'false' } );
				slide.classList.add( 'is-loading' );
				img.addEventListener( 'load', function () {
					slide.classList.remove( 'is-loading' );
				} );
				img.addEventListener( 'error', function () {
					slide.classList.remove( 'is-loading' );
					slide.classList.add( 'has-error' );
					wrap.textContent = L.error;
				} );
				if ( item.srcset ) {
					img.srcset = item.srcset;
					img.sizes = '100vw';
				}
				img.src = item.src;
				wrap.appendChild( img );
				slide.appendChild( wrap );
				return;
			}

			if ( item.type === 'video' ) {
				const video = el( 'video', 'foldbox__video', {
					controls: '',
					playsinline: '',
					preload: 'metadata',
				} );
				if ( item.poster ) {
					video.poster = item.poster;
				}
				item.sources.forEach( function ( source ) {
					const node = el( 'source' );
					node.src = source.src;
					if ( source.type ) {
						node.type = source.type;
					}
					video.appendChild( node );
				} );
				const self = this;
				video.addEventListener( 'play', function () {
					self.pause();
				} );
				slide.appendChild( video );
				return;
			}

			// YouTube and Vimeo: a poster with a play button. The player is only
			// loaded when the visitor presses play.
			const poster = el( 'button', 'foldbox__play', {
				type: 'button',
				'aria-label': L.playVideo,
				'data-index': String( i ),
			} );
			const image = item.poster || item.thumb;
			if ( image ) {
				const img = el( 'img', '', { alt: item.alt || '', draggable: 'false' } );
				img.src = image;
				poster.appendChild( img );
			}
			poster.appendChild( el( 'span', 'foldbox__play-icon' ) );
			slide.appendChild( poster );
		},

		embedUrl( item ) {
			const o = this.options;
			if ( item.type === 'youtube' ) {
				const host = o.youtubeNoCookie ? 'https://www.youtube-nocookie.com' : 'https://www.youtube.com';
				return host + '/embed/' + encodeURIComponent( item.videoId ) + '?' + query( Object.assign( { autoplay: 1, playsinline: 1 }, o.youtubeParams ) );
			}
			const params = Object.assign( { autoplay: 1 }, o.vimeoParams );
			if ( item.hash ) {
				params.h = item.hash;
			}
			return 'https://player.vimeo.com/video/' + encodeURIComponent( item.videoId ) + '?' + query( params );
		},

		playEmbed( i ) {
			const item = this.items[ i ];
			const slide = this.slides[ i ];
			if ( ! item || ( item.type !== 'youtube' && item.type !== 'vimeo' ) ) {
				return;
			}
			if ( i !== this.index ) {
				this.goTo( i );
			}
			this.pause();
			const frame = el( 'iframe', 'foldbox__iframe', {
				src: this.embedUrl( item ),
				title: item.title || item.alt || this.options.labels.playVideo,
				allow: 'autoplay; fullscreen; picture-in-picture; encrypted-media',
				allowfullscreen: '',
			} );
			const holder = el( 'div', 'foldbox__embed' );
			holder.appendChild( frame );
			slide.innerHTML = '';
			slide.appendChild( holder );
			slide.setAttribute( 'data-playing', '1' );
		},

		leaveSlide( i ) {
			const slide = this.slides[ i ];
			const video = slide.querySelector( 'video' );
			if ( video && ! video.paused ) {
				video.pause();
			}
			if ( slide.getAttribute( 'data-playing' ) ) {
				// Drop the player so it stops; show the poster again.
				slide.innerHTML = '';
				slide.removeAttribute( 'data-playing' );
				slide.removeAttribute( 'data-loaded' );
				this.load( i );
			}
		},

		/* Opening effect ------------------------------------------------- */

		zoomFromOrigin() {
			const origin = this.options.origin;
			const img = this.slides[ this.index ].querySelector( '.foldbox__img' );
			if ( ! origin || ! img || reducedMotion() || ! img.animate ) {
				return;
			}
			const self = this;
			const run = function () {
				const from = origin.getBoundingClientRect();
				const to = img.getBoundingClientRect();
				if ( ! from.width || ! to.width ) {
					return;
				}
				const scale = Math.max( from.width / to.width, from.height / to.height );
				const dx = from.left + from.width / 2 - ( to.left + to.width / 2 );
				const dy = from.top + from.height / 2 - ( to.top + to.height / 2 );
				img.animate(
					[
						{ transform: 'translate(' + dx + 'px,' + dy + 'px) scale(' + scale + ')', opacity: 0.6 },
						{ transform: 'none', opacity: 1 },
					],
					{ duration: self.options.speed, easing: 'cubic-bezier(.2,.8,.2,1)' }
				);
			};
			if ( img.complete && img.naturalWidth ) {
				run();
			} else {
				img.addEventListener( 'load', run, { once: true } );
			}
		},

		/* Zoom ---------------------------------------------------------- */

		currentImage() {
			const item = this.items[ this.index ];
			return item && item.type === 'image' ? this.slides[ this.index ].querySelector( '.foldbox__img' ) : null;
		},

		applyZoom( animate ) {
			const img = this.currentImage();
			if ( ! img ) {
				return;
			}
			const z = this.zoomState;
			const wrap = img.parentNode;
			wrap.style.transition = animate ? '' : 'none';
			wrap.style.transform = z.scale === 1 ? '' : 'translate3d(' + z.x + 'px,' + z.y + 'px,0) scale(' + z.scale + ')';
			this.root.classList.toggle( 'is-zoomed', z.scale > 1 );
			if ( this.buttons.zoom ) {
				const zoomed = z.scale > 1;
				const label = zoomed ? this.options.labels.zoomOut : this.options.labels.zoomIn;
				this.buttons.zoom.innerHTML = icon( zoomed ? 'zoomOut' : 'zoomIn' );
				this.buttons.zoom.setAttribute( 'aria-label', label );
				this.buttons.zoom.title = label;
			}
		},

		clampZoom() {
			const img = this.currentImage();
			if ( ! img ) {
				return;
			}
			const z = this.zoomState;
			const maxX = Math.max( 0, ( img.offsetWidth * z.scale - this.stage.clientWidth ) / 2 );
			const maxY = Math.max( 0, ( img.offsetHeight * z.scale - this.stage.clientHeight ) / 2 );
			z.x = Math.min( maxX, Math.max( -maxX, z.x ) );
			z.y = Math.min( maxY, Math.max( -maxY, z.y ) );
		},

		/**
		 * Zoom to a scale, keeping the point (clientX, clientY) under the pointer.
		 *
		 * @param {number} scale   Target scale.
		 * @param {number} clientX Pointer x (optional, default centre).
		 * @param {number} clientY Pointer y.
		 * @param {boolean} animate Use a transition.
		 */
		zoomTo( scale, clientX, clientY, animate ) {
			const img = this.currentImage();
			if ( ! img ) {
				return;
			}
			const z = this.zoomState;
			scale = Math.min( Math.max( scale, 1 ), this.options.maxZoom );
			const rect = this.stage.getBoundingClientRect();
			const cx = clientX === undefined ? rect.left + rect.width / 2 : clientX;
			const cy = clientY === undefined ? rect.top + rect.height / 2 : clientY;
			// Point relative to the image centre, in unscaled pixels.
			const px = ( cx - ( rect.left + rect.width / 2 ) - z.x ) / z.scale;
			const py = ( cy - ( rect.top + rect.height / 2 ) - z.y ) / z.scale;
			z.x = cx - ( rect.left + rect.width / 2 ) - px * scale;
			z.y = cy - ( rect.top + rect.height / 2 ) - py * scale;
			z.scale = scale;
			if ( scale === 1 ) {
				z.x = 0;
				z.y = 0;
			}
			this.clampZoom();
			this.applyZoom( animate );
		},

		toggleZoom( clientX, clientY ) {
			if ( this.zoomState.scale > 1 ) {
				this.zoomTo( 1, undefined, undefined, true );
			} else {
				this.zoomTo( Math.min( 2, this.options.maxZoom ), clientX, clientY, true );
			}
		},

		resetZoom() {
			const had = this.zoomState.scale !== 1;
			this.zoomState = { scale: 1, x: 0, y: 0 };
			if ( this.root ) {
				this.root.classList.remove( 'is-zoomed' );
				this.slides.forEach( function ( slide ) {
					const wrap = slide.querySelector( '.foldbox__zoom' );
					if ( wrap ) {
						wrap.style.transform = '';
					}
				} );
				if ( had || this.buttons.zoom ) {
					this.applyZoom( false );
				}
			}
		},

		onWheel( event ) {
			if ( ! this.options.zoom || ! this.currentImage() ) {
				return;
			}
			// Trackpad pinch arrives as ctrl + wheel; plain wheel zooms once zoomed in.
			if ( ! event.ctrlKey && this.zoomState.scale === 1 ) {
				return;
			}
			event.preventDefault();
			const factor = Math.exp( -event.deltaY * ( event.ctrlKey ? 0.01 : 0.002 ) );
			this.zoomTo( this.zoomState.scale * factor, event.clientX, event.clientY, false );
		},

		/* Pointer gestures ---------------------------------------------- */

		onPointerDown( event ) {
			if ( event.button !== undefined && event.button !== 0 ) {
				return;
			}
			// Leave native controls (video bar, iframes, buttons) alone.
			if ( event.target.closest( 'video, iframe, .foldbox__play, a, button' ) && this.zoomState.scale === 1 ) {
				if ( ! event.target.closest( '.foldbox__play' ) ) {
					return;
				}
			}
			this.pointers.set( event.pointerId, { x: event.clientX, y: event.clientY } );
			if ( this.pointers.size === 1 ) {
				this.gesture = {
					startX: event.clientX,
					startY: event.clientY,
					zoomX: this.zoomState.x,
					zoomY: this.zoomState.y,
					time: Date.now(),
					axis: null,
				};
				this.dragged = false;
			} else if ( this.pointers.size === 2 && this.options.zoom && this.currentImage() ) {
				const pts = Array.from( this.pointers.values() );
				this.pinch = {
					distance: Math.hypot( pts[ 0 ].x - pts[ 1 ].x, pts[ 0 ].y - pts[ 1 ].y ),
					scale: this.zoomState.scale,
				};
				this.resetDrag();
			}
		},

		onPointerMove( event ) {
			if ( ! this.pointers.has( event.pointerId ) ) {
				return;
			}
			this.pointers.set( event.pointerId, { x: event.clientX, y: event.clientY } );

			if ( this.pinch && this.pointers.size === 2 ) {
				const pts = Array.from( this.pointers.values() );
				const distance = Math.hypot( pts[ 0 ].x - pts[ 1 ].x, pts[ 0 ].y - pts[ 1 ].y );
				this.zoomTo( ( this.pinch.scale * distance ) / this.pinch.distance, ( pts[ 0 ].x + pts[ 1 ].x ) / 2, ( pts[ 0 ].y + pts[ 1 ].y ) / 2, false );
				this.dragged = true;
				return;
			}

			const g = this.gesture;
			if ( ! g ) {
				return;
			}
			const dx = event.clientX - g.startX;
			const dy = event.clientY - g.startY;
			if ( Math.abs( dx ) > 5 || Math.abs( dy ) > 5 ) {
				this.dragged = true;
			}

			if ( this.zoomState.scale > 1 ) {
				this.zoomState.x = g.zoomX + dx;
				this.zoomState.y = g.zoomY + dy;
				this.clampZoom();
				this.applyZoom( false );
				return;
			}

			if ( ! g.axis && this.dragged ) {
				g.axis = Math.abs( dx ) >= Math.abs( dy ) ? 'x' : 'y';
			}
			if ( g.axis === 'x' && this.options.swipe && this.items.length > 1 ) {
				this.track.style.transition = 'none';
				const base = this.options.animation === 'fade' ? 0 : -this.index * 100;
				this.track.style.transform = 'translate3d(calc(' + base + '% + ' + dx + 'px),0,0)';
			} else if ( g.axis === 'y' && this.options.swipeToClose ) {
				this.stage.style.transition = 'none';
				this.stage.style.transform = 'translate3d(0,' + dy + 'px,0)';
				this.backdrop.style.opacity = String( Math.max( 0.2, 1 - Math.abs( dy ) / 400 ) );
			}
		},

		onPointerUp( event ) {
			if ( ! this.pointers.has( event.pointerId ) ) {
				return;
			}
			this.pointers.delete( event.pointerId );
			if ( this.pinch ) {
				if ( this.pointers.size < 2 ) {
					this.pinch = null;
					this.gesture = null;
					// Let the finger still down keep panning the zoomed image.
					const rest = this.pointers.values().next().value;
					if ( rest && this.zoomState.scale > 1 ) {
						this.gesture = {
							startX: rest.x,
							startY: rest.y,
							zoomX: this.zoomState.x,
							zoomY: this.zoomState.y,
							time: Date.now(),
							axis: null,
						};
					}
				}
				return;
			}
			const g = this.gesture;
			this.gesture = null;
			if ( ! g || this.zoomState.scale > 1 ) {
				return;
			}
			const dx = event.clientX - g.startX;
			const dy = event.clientY - g.startY;
			const fast = Date.now() - g.time < 250;

			if ( g.axis === 'x' && this.options.swipe && this.items.length > 1 ) {
				this.track.style.transition = '';
				if ( dx < -60 || ( fast && dx < -20 ) ) {
					this.next();
				} else if ( dx > 60 || ( fast && dx > 20 ) ) {
					this.prev();
				}
				this.track.style.transform = this.options.animation === 'fade' ? '' : 'translate3d(' + -this.index * 100 + '%,0,0)';
			} else if ( g.axis === 'y' && this.options.swipeToClose ) {
				if ( Math.abs( dy ) > 120 || ( fast && Math.abs( dy ) > 50 ) ) {
					this.close();
				} else {
					this.resetDrag();
				}
			}
		},

		resetDrag() {
			this.stage.style.transition = '';
			this.stage.style.transform = '';
			this.backdrop.style.opacity = '';
			this.track.style.transition = '';
			if ( this.options.animation !== 'fade' ) {
				this.track.style.transform = 'translate3d(' + -this.index * 100 + '%,0,0)';
			}
		},

		/* Keyboard ------------------------------------------------------ */

		onKey( event ) {
			if ( ! this.isOpen || ! this.options.keyboard ) {
				return;
			}
			switch ( event.key ) {
				case 'Escape':
					event.preventDefault();
					this.close();
					break;
				case 'ArrowLeft':
					if ( ! event.target.closest( 'video' ) ) {
						event.preventDefault();
						this.prev();
					}
					break;
				case 'ArrowRight':
					if ( ! event.target.closest( 'video' ) ) {
						event.preventDefault();
						this.next();
					}
					break;
				case 'Home':
					event.preventDefault();
					this.goTo( 0 );
					break;
				case 'End':
					event.preventDefault();
					this.goTo( this.items.length - 1 );
					break;
				case 'Tab':
					this.trapFocus( event );
					break;
			}
		},

		trapFocus( event ) {
			const focusable = Array.prototype.filter.call(
				this.root.querySelectorAll( 'button, a[href], video, iframe, [tabindex]:not([tabindex="-1"])' ),
				function ( node ) {
					return ! node.disabled && ! node.hidden && node.offsetParent !== null && ! node.closest( '[aria-hidden="true"]' );
				}
			);
			if ( ! focusable.length ) {
				event.preventDefault();
				return;
			}
			const first = focusable[ 0 ];
			const last = focusable[ focusable.length - 1 ];
			if ( event.shiftKey && ( document.activeElement === first || ! this.root.contains( document.activeElement ) ) ) {
				event.preventDefault();
				last.focus();
			} else if ( ! event.shiftKey && ( document.activeElement === last || ! this.root.contains( document.activeElement ) ) ) {
				event.preventDefault();
				first.focus();
			}
		},

		/* Slideshow ----------------------------------------------------- */

		play() {
			if ( this.timer || this.items.length < 2 ) {
				return this;
			}
			const self = this;
			this.root.classList.add( 'is-playing' );
			this.setPlayButton( true );
			this.timer = window.setInterval( function () {
				if ( ! self.options.loop && self.index >= self.items.length - 1 ) {
					self.pause();
					return;
				}
				self.goTo( self.index + 1 );
			}, this.options.slideshowInterval );
			this.restartProgress();
			return this;
		},

		pause() {
			if ( ! this.timer ) {
				return this;
			}
			window.clearInterval( this.timer );
			this.timer = null;
			if ( this.root ) {
				this.root.classList.remove( 'is-playing' );
				this.progress.firstChild.style.transition = 'none';
				this.progress.firstChild.style.transform = 'scaleX(0)';
			}
			this.setPlayButton( false );
			return this;
		},

		setPlayButton( playing ) {
			const btn = this.buttons && this.buttons.play;
			if ( ! btn ) {
				return;
			}
			const label = playing ? this.options.labels.pause : this.options.labels.play;
			btn.innerHTML = icon( playing ? 'pause' : 'play' );
			btn.setAttribute( 'aria-label', label );
			btn.title = label;
			btn.setAttribute( 'aria-pressed', playing ? 'true' : 'false' );
		},

		restartProgress() {
			const bar = this.progress.firstChild;
			bar.style.transition = 'none';
			bar.style.transform = 'scaleX(0)';
			void bar.offsetWidth;
			bar.style.transition = 'transform ' + this.options.slideshowInterval + 'ms linear';
			bar.style.transform = 'scaleX(1)';
		},

		/* Fullscreen ---------------------------------------------------- */

		isFullscreen() {
			return ( document.fullscreenElement || document.webkitFullscreenElement ) === this.root;
		},

		toggleFullscreen() {
			if ( this.isFullscreen() ) {
				( document.exitFullscreen || document.webkitExitFullscreen ).call( document );
			} else {
				const request = this.root.requestFullscreen || this.root.webkitRequestFullscreen;
				if ( request ) {
					const result = request.call( this.root );
					if ( result && result.catch ) {
						result.catch( function () {} );
					}
				}
			}
		},

		onFullscreenChange() {
			const full = this.isFullscreen();
			this.root.classList.toggle( 'is-fullscreen', full );
			const btn = this.buttons.fullscreen;
			if ( btn ) {
				const label = full ? this.options.labels.exitFullscreen : this.options.labels.fullscreen;
				btn.innerHTML = icon( full ? 'exitFullscreen' : 'fullscreen' );
				btn.setAttribute( 'aria-label', label );
				btn.title = label;
			}
			this.resetZoom();
		},

		/* Scroll lock --------------------------------------------------- */

		lockScroll() {
			const html = document.documentElement;
			const gap = window.innerWidth - html.clientWidth;
			this.savedScroll = { overflow: html.style.overflow, paddingRight: html.style.paddingRight };
			html.style.overflow = 'hidden';
			if ( gap > 0 ) {
				html.style.paddingRight = gap + 'px';
			}
		},

		unlockScroll() {
			const html = document.documentElement;
			if ( this.savedScroll ) {
				html.style.overflow = this.savedScroll.overflow;
				html.style.paddingRight = this.savedScroll.paddingRight;
			}
		},

		/* Close --------------------------------------------------------- */

		/**
		 * Close the gallery.
		 *
		 * @param {boolean} immediate Skip the closing animation.
		 */
		close( immediate ) {
			if ( ! this.isOpen ) {
				return this;
			}
			this.isOpen = false;
			this.pause();
			if ( this.isFullscreen() ) {
				( document.exitFullscreen || document.webkitExitFullscreen ).call( document );
			}
			this.leaveSlide( this.index );
			this.unbind();
			this.unlockScroll();
			if ( openInstance === this ) {
				openInstance = null;
			}

			const root = this.root;
			const done = function () {
				if ( root.parentNode ) {
					root.parentNode.removeChild( root );
				}
			};
			root.classList.remove( 'is-open' );
			root.classList.add( 'is-closing' );
			if ( immediate || reducedMotion() ) {
				done();
			} else {
				window.setTimeout( done, this.options.speed );
			}

			if ( this.lastFocus && typeof this.lastFocus.focus === 'function' ) {
				this.lastFocus.focus( { preventScroll: true } );
			}
			this.emit( 'onClose' );
			return this;
		},

		destroy() {
			return this.close( true );
		},

		emit( name ) {
			const fn = this.options[ name ];
			if ( typeof fn === 'function' ) {
				fn.call( this, this.index, this.items[ this.index ], this );
			}
		},
	};

	/* ------------------------------------------------------------------ */
	/* Filterable grid                                                     */
	/* ------------------------------------------------------------------ */

	/**
	 * Animate a grid between filters. Items that stay glide to their new
	 * place, new ones scale in, removed ones scale out (FLIP technique).
	 *
	 * @param {Element} grid    Grid container.
	 * @param {Object}  options { itemSelector, duration, easing }.
	 */
	function Grid( grid, options ) {
		this.grid = grid;
		this.options = Object.assign( { itemSelector: ':scope > *', duration: 400, easing: 'ease' }, options || {} );
		if ( window.getComputedStyle( grid ).position === 'static' ) {
			grid.style.position = 'relative';
		}
	}

	Grid.prototype = {
		items() {
			return Array.prototype.filter.call( this.grid.querySelectorAll( this.options.itemSelector ), function ( item ) {
				return ! item.classList.contains( 'foldbox-ghost' );
			} );
		},

		/**
		 * Show only the items that match.
		 *
		 * @param {string|Function} filter '*' for all, a CSS selector, or a function( item ).
		 * @param {boolean}         instant Skip the animation.
		 */
		filter( filter, instant ) {
			const matches = function ( item ) {
				if ( typeof filter === 'function' ) {
					return !! filter( item );
				}
				return ! filter || filter === '*' || item.matches( filter );
			};
			const items = this.items();
			const o = this.options;

			if ( instant || reducedMotion() || typeof this.grid.animate !== 'function' ) {
				items.forEach( function ( item ) {
					item.hidden = ! matches( item );
				} );
				return this;
			}

			const grid = this.grid;
			const gridRect = grid.getBoundingClientRect();
			const before = new Map();
			items.forEach( function ( item ) {
				if ( ! item.hidden ) {
					before.set( item, item.getBoundingClientRect() );
				}
			} );
			// Positions above are where cards are on screen now. Stop animations
			// from an earlier filter so the new layout is measured without them.
			items.forEach( function ( item ) {
				if ( typeof item.getAnimations === 'function' ) {
					item.getAnimations().forEach( function ( animation ) {
						animation.cancel();
					} );
				}
			} );

			const ghosts = [];
			items.forEach( function ( item ) {
				if ( item.hidden || matches( item ) ) {
					return;
				}
				const rect = before.get( item );
				const ghost = item.cloneNode( true );
				ghost.setAttribute( 'aria-hidden', 'true' );
				ghost.classList.add( 'foldbox-ghost' );
				ghost.style.position = 'absolute';
				ghost.style.margin = '0';
				ghost.style.pointerEvents = 'none';
				ghost.style.left = rect.left - gridRect.left - grid.clientLeft + 'px';
				ghost.style.top = rect.top - gridRect.top - grid.clientTop + 'px';
				ghost.style.width = rect.width + 'px';
				ghosts.push( ghost );
			} );

			items.forEach( function ( item ) {
				item.hidden = ! matches( item );
			} );

			ghosts.forEach( function ( ghost ) {
				grid.appendChild( ghost );
				ghost
					.animate(
						[
							{ opacity: 1, transform: 'scale(1)' },
							{ opacity: 0, transform: 'scale(0.6)' },
						],
						{ duration: o.duration, easing: 'ease-in' }
					)
					.finished.then( function () {
						ghost.remove();
					} );
			} );

			items.forEach( function ( item ) {
				if ( item.hidden ) {
					return;
				}
				const old = before.get( item );
				if ( ! old ) {
					item.animate(
						[
							{ opacity: 0, transform: 'scale(0.6)' },
							{ opacity: 1, transform: 'scale(1)' },
						],
						{ duration: o.duration, easing: 'ease-out' }
					);
					return;
				}
				const now = item.getBoundingClientRect();
				const dx = old.left - now.left;
				const dy = old.top - now.top;
				if ( dx || dy ) {
					item.animate( [ { transform: 'translate(' + dx + 'px, ' + dy + 'px)' }, { transform: 'none' } ], {
						duration: o.duration,
						easing: o.easing,
					} );
				}
			} );
			return this;
		},
	};

	/* ------------------------------------------------------------------ */
	/* Public API                                                          */
	/* ------------------------------------------------------------------ */

	/**
	 * Bind links inside a container: each <a href> opens the gallery of all of
	 * them. Optional data attributes: data-thumb, data-caption, data-type,
	 * data-poster, data-download.
	 *
	 * @param {Element|string} container Element or selector.
	 * @param {Object}         options   Lightbox options plus { selector }.
	 * @return {Function} Call to unbind.
	 */
	function bind( container, options ) {
		const rootEl = typeof container === 'string' ? document.querySelector( container ) : container;
		if ( ! rootEl ) {
			return function () {};
		}
		// Captions come from page markup here, so treat them as text unless asked.
		const opts = Object.assign( { selector: 'a[href]', htmlCaptions: false }, options || {} );
		const handler = function ( event ) {
			const link = event.target.closest( opts.selector );
			if ( ! link || ! rootEl.contains( link ) ) {
				return;
			}
			event.preventDefault();
			const links = Array.prototype.slice.call( rootEl.querySelectorAll( opts.selector ) );
			const items = links.map( function ( a ) {
				const img = a.querySelector( 'img' );
				return {
					src: a.getAttribute( 'href' ),
					thumb: a.getAttribute( 'data-thumb' ) || ( img ? img.currentSrc || img.src : '' ),
					alt: img ? img.alt : '',
					caption: a.getAttribute( 'data-caption' ) || '',
					type: a.getAttribute( 'data-type' ) || undefined,
					poster: a.getAttribute( 'data-poster' ) || undefined,
					download: a.hasAttribute( 'data-download' ) ? a.getAttribute( 'data-download' ) : undefined,
				};
			} );
			open(
				items,
				Object.assign( {}, opts, {
					index: links.indexOf( link ),
					origin: link.querySelector( 'img' ) || link,
				} )
			);
		};
		rootEl.addEventListener( 'click', handler );
		return function () {
			rootEl.removeEventListener( 'click', handler );
		};
	}

	function open( items, options ) {
		return new Lightbox( items, options ).open();
	}

	return {
		version: VERSION,
		defaults: DEFAULTS,
		open,
		bind,
		grid( element, options ) {
			return new Grid( element, options );
		},
		close() {
			if ( openInstance ) {
				openInstance.close();
			}
		},
		Lightbox,
		Grid,
	};
} );
