import { test, expect } from '@playwright/test';

const dialog = ( page ) => page.getByRole( 'dialog' );
const counter = ( page ) => page.locator( '.foldbox__counter' );

// Opens the gallery from the first thumbnail and waits for it to settle.
async function openFirst( page ) {
	await page.goto( '/' );
	await page.getByRole( 'link', { name: 'Photo one' } ).click();
	await expect( dialog( page ) ).toBeVisible();
	await expect( page.locator( '.foldbox' ) ).toHaveClass( /is-open/ );
}

test.describe( 'opening', () => {
	test( 'opens from a thumbnail at that item', async ( { page } ) => {
		await page.goto( '/' );
		await page.getByRole( 'link', { name: 'Photo two' } ).click();
		await expect( dialog( page ) ).toBeVisible();
		await expect( dialog( page ) ).toHaveAttribute( 'aria-modal', 'true' );
		await expect( counter( page ) ).toHaveText( '2 / 3' );
		await expect( page.locator( '.foldbox__caption' ) ).toHaveText( 'Photo two' );
		await expect( page.getByRole( 'button', { name: 'Close' } ) ).toBeFocused();
	} );

	test( 'locks page scroll while open', async ( { page } ) => {
		await openFirst( page );
		expect( await page.evaluate( () => document.documentElement.style.overflow ) ).toBe( 'hidden' );
		await page.keyboard.press( 'Escape' );
		await expect( dialog( page ) ).toHaveCount( 0 );
		expect( await page.evaluate( () => document.documentElement.style.overflow ) ).toBe( '' );
	} );
} );

test.describe( 'navigation', () => {
	test( 'next and previous buttons', async ( { page } ) => {
		await openFirst( page );
		await page.getByRole( 'button', { name: 'Next' } ).click();
		await expect( counter( page ) ).toHaveText( '2 / 3' );
		await page.getByRole( 'button', { name: 'Previous' } ).click();
		await expect( counter( page ) ).toHaveText( '1 / 3' );
	} );

	test( 'arrow, Home and End keys, looping at the ends', async ( { page } ) => {
		await openFirst( page );
		await page.keyboard.press( 'ArrowRight' );
		await expect( counter( page ) ).toHaveText( '2 / 3' );
		await page.keyboard.press( 'End' );
		await expect( counter( page ) ).toHaveText( '3 / 3' );
		await page.keyboard.press( 'ArrowRight' );
		await expect( counter( page ) ).toHaveText( '1 / 3' );
		await page.keyboard.press( 'ArrowLeft' );
		await expect( counter( page ) ).toHaveText( '3 / 3' );
		await page.keyboard.press( 'Home' );
		await expect( counter( page ) ).toHaveText( '1 / 3' );
	} );

	test( 'thumbnail strip', async ( { page } ) => {
		await openFirst( page );
		await page.locator( '.foldbox__thumb' ).nth( 2 ).click();
		await expect( counter( page ) ).toHaveText( '3 / 3' );
	} );

	test( 'swipe left goes to the next item', async ( { page } ) => {
		await openFirst( page );
		const box = await page.locator( '.foldbox__stage' ).boundingBox();
		const y = box.y + box.height / 2;
		await page.mouse.move( box.x + box.width * 0.7, y );
		await page.mouse.down();
		await page.mouse.move( box.x + box.width * 0.4, y, { steps: 8 } );
		await page.mouse.move( box.x + box.width * 0.2, y, { steps: 8 } );
		await page.mouse.up();
		await expect( counter( page ) ).toHaveText( '2 / 3' );
	} );
} );

test.describe( 'zoom', () => {
	test( 'zooms, pans with the arrow keys, and zooms out', async ( { page } ) => {
		await openFirst( page );
		const zoomLayer = page.locator( '.foldbox__slide.is-active .foldbox__zoom' );
		await page.getByRole( 'button', { name: 'Zoom in' } ).click();
		await expect( page.locator( '.foldbox' ) ).toHaveClass( /is-zoomed/ );

		// While zoomed, the arrow keys pan instead of changing items.
		const before = await zoomLayer.evaluate( ( el ) => el.style.transform );
		await page.keyboard.press( 'ArrowRight' );
		await expect( counter( page ) ).toHaveText( '1 / 3' );
		await expect.poll( () => zoomLayer.evaluate( ( el ) => el.style.transform ) ).not.toBe( before );

		await page.getByRole( 'button', { name: 'Zoom out' } ).click();
		await expect( page.locator( '.foldbox' ) ).not.toHaveClass( /is-zoomed/ );
		await page.keyboard.press( 'ArrowRight' );
		await expect( counter( page ) ).toHaveText( '2 / 3' );
	} );
} );

test.describe( 'closing', () => {
	test( 'close button returns focus to the thumbnail link', async ( { page } ) => {
		// Opened from the keyboard: Safari doesn't focus links on click.
		await page.goto( '/' );
		await page.getByRole( 'link', { name: 'Photo one' } ).focus();
		await page.keyboard.press( 'Enter' );
		await expect( dialog( page ) ).toBeVisible();
		await page.getByRole( 'button', { name: 'Close' } ).click();
		await expect( dialog( page ) ).toHaveCount( 0 );
		await expect( page.getByRole( 'link', { name: 'Photo one' } ) ).toBeFocused();
	} );

	test( 'Escape closes', async ( { page } ) => {
		await openFirst( page );
		await page.keyboard.press( 'Escape' );
		await expect( dialog( page ) ).toHaveCount( 0 );
	} );

	test( 'clicking the backdrop closes', async ( { page } ) => {
		await openFirst( page );
		// The stage around the image is the backdrop.
		const box = await page.locator( '.foldbox__stage' ).boundingBox();
		await page.mouse.click( box.x + 5, box.y + box.height / 2 );
		await expect( dialog( page ) ).toHaveCount( 0 );
	} );
} );

test.describe( 'keyboard focus', () => {
	test( 'Tab stays inside the gallery', async ( { page } ) => {
		await openFirst( page );
		const seen = new Set();
		for ( let i = 0; i < 15; i++ ) {
			await page.keyboard.press( 'Tab' );
			expect( await page.evaluate( () => !! document.activeElement.closest( '.foldbox' ) ) ).toBe( true );
			seen.add( await page.evaluate( () => document.activeElement.getAttribute( 'aria-label' ) ) );
		}
		// Every browser, Safari included, steps through the gallery's buttons.
		expect( seen ).toContain( 'Next' );
		expect( seen ).toContain( 'Close' );
		for ( let i = 0; i < 5; i++ ) {
			await page.keyboard.press( 'Shift+Tab' );
			expect( await page.evaluate( () => !! document.activeElement.closest( '.foldbox' ) ) ).toBe( true );
		}
	} );
} );

test.describe( 'failed image', () => {
	test( 'shows the error and hides zoom and download', async ( { page } ) => {
		await page.goto( '/' );
		await page.evaluate( () => {
			Foldbox.open( [ 'images/missing.jpg', 'images/photo-2.svg' ], { download: true, speed: 50 } );
		} );
		const slide = page.locator( '.foldbox__slide' ).first();
		await expect( slide ).toHaveClass( /has-error/ );
		await expect( slide ).toContainText( 'This item could not be loaded.' );
		await expect( page.getByRole( 'button', { name: 'Zoom in' } ) ).toBeHidden();
		await expect( page.getByRole( 'link', { name: 'Download' } ) ).toBeHidden();

		// The next, working image gets its controls back.
		await page.keyboard.press( 'ArrowRight' );
		await expect( page.getByRole( 'button', { name: 'Zoom in' } ) ).toBeVisible();
		await expect( page.getByRole( 'link', { name: 'Download' } ) ).toBeVisible();
	} );
} );

test.describe( 'grid', () => {
	test( 'filters items and shows them all again', async ( { page } ) => {
		await page.goto( '/' );
		await page.evaluate( () => window.grid.filter( '.nature', true ) );
		await expect( page.locator( '#grid .city' ) ).toBeHidden();
		await expect( page.locator( '#grid .nature' ) ).toHaveCount( 2 );
		await page.evaluate( () => window.grid.filter( '*', true ) );
		await expect( page.locator( '#grid .city' ) ).toBeVisible();
	} );

	test( 'fading copies have no ids, form names or media', async ( { page } ) => {
		await page.goto( '/' );
		await page.evaluate( () => {
			const card = document.querySelector( '#grid .city' );
			card.id = 'city-card';
			card.innerHTML = 'B <input type="radio" name="pick" checked><iframe src="about:blank" title="x"></iframe>';
			window.grid.options.duration = 2000;
			window.grid.filter( '.nature' );
		} );
		const ghost = page.locator( '#grid > .foldbox-ghost' );
		await expect( ghost ).toHaveCount( 1 );
		expect( await ghost.evaluate( ( g ) => [ g.id, g.querySelectorAll( '[id], [name], iframe' ).length ] ) ).toEqual( [ '', 0 ] );
		expect( await page.evaluate( () => document.querySelector( '#city-card input' ).checked ) ).toBe( true );
	} );

	test( 'hides items that set their own display, animated or not', async ( { page } ) => {
		await page.goto( '/' );
		await page.addStyleTag( { content: '#grid div { display: flex; }' } );
		for ( const instant of [ true, false ] ) {
			await page.evaluate( ( i ) => window.grid.filter( '.nature', i ), instant );
			await expect( page.locator( '#grid > .city:not(.foldbox-ghost)' ) ).toBeHidden();
			await page.evaluate( ( i ) => window.grid.filter( '*', i ), instant );
			await expect( page.locator( '#grid > .city:not(.foldbox-ghost)' ) ).toBeVisible();
			expect( await page.locator( '#grid > .city:not(.foldbox-ghost)' ).evaluate( ( n ) => n.style.display ) ).toBe( '' );
		}
	} );
} );

test.describe( 'API and gestures', () => {
	const items = [ 'images/photo-1.svg', 'images/photo-2.svg', 'images/photo-3.svg' ];

	test( 'manual navigation restarts the slideshow interval', async ( { page } ) => {
		await page.goto( '/' );
		const gap = await page.evaluate( async ( list ) => {
			const lb = Foldbox.open( list, { slideshowInterval: 600, speed: 0 } );
			const wait = ( ms ) => new Promise( ( r ) => setTimeout( r, ms ) );
			let changed = 0;
			lb.options.onChange = () => ( changed = performance.now() );
			lb.play();
			await wait( 450 );
			lb.next();
			const manual = performance.now();
			await wait( 400 );
			const auto = changed;
			lb.close( true );
			return auto - manual; // ~0 when the next tick waited a full interval
		}, items );
		expect( gap ).toBeLessThan( 50 );
	} );

	test( 'a drag released outside the page stops following the mouse', async ( { page } ) => {
		await openFirst( page );
		const box = await page.locator( '.foldbox__stage' ).boundingBox();
		const x = box.x + box.width / 2;
		const y = box.y + box.height / 2;
		// The mouse's pointer ID differs between browsers; read the real one.
		await page.evaluate( () => window.addEventListener( 'pointerdown', ( e ) => ( window.mouseId = e.pointerId ), { once: true } ) );
		await page.mouse.move( x, y );
		await page.mouse.down();
		await page.mouse.move( x - 30, y, { steps: 4 } );
		// The release happened outside the window: next move has no button held.
		const transform = await page.evaluate( ( [ cx, cy ] ) => {
			const id = window.mouseId;
			window.dispatchEvent( new PointerEvent( 'pointermove', { pointerId: id, clientX: cx - 300, clientY: cy, buttons: 0 } ) );
			window.dispatchEvent( new PointerEvent( 'pointermove', { pointerId: id, clientX: cx - 400, clientY: cy, buttons: 0 } ) );
			return document.querySelector( '.foldbox__track' ).style.transform;
		}, [ x, y ] );
		expect( transform ).not.toContain( 'px' );
		await page.mouse.up();
	} );

	test( 'two fingers without pinch zoom do not swipe', async ( { page } ) => {
		await page.goto( '/' );
		const index = await page.evaluate( ( list ) => {
			const lb = Foldbox.open( list, { zoom: false, speed: 0 } );
			const stage = document.querySelector( '.foldbox__stage' );
			const send = ( type, id, x ) =>
				( type === 'pointerdown' ? stage : window ).dispatchEvent(
					new PointerEvent( type, { pointerId: id, clientX: x, clientY: 300, button: 0, buttons: 1, bubbles: true } )
				);
			send( 'pointerdown', 11, 300 );
			send( 'pointerdown', 12, 500 );
			send( 'pointermove', 12, 510 );
			send( 'pointerup', 12, 510 );
			send( 'pointerup', 11, 300 );
			const i = lb.index;
			lb.close( true );
			return i;
		}, items );
		expect( index ).toBe( 0 );
	} );

	test( 'goTo rounds the index and ignores non-numbers', async ( { page } ) => {
		await page.goto( '/' );
		const result = await page.evaluate( ( list ) => {
			const lb = Foldbox.open( list, { speed: 0 } );
			lb.goTo( 1.4 );
			const a = lb.index;
			lb.goTo( NaN );
			const b = lb.index;
			lb.close( true );
			return [ a, b, document.querySelectorAll( '.foldbox' ).length ];
		}, items );
		expect( result ).toEqual( [ 1, 1, 0 ] );
	} );

	test( 'a key event dispatched on document works', async ( { page } ) => {
		await openFirst( page );
		const errors = [];
		page.on( 'pageerror', ( e ) => errors.push( e.message ) );
		await page.evaluate( () => {
			document.dispatchEvent( new KeyboardEvent( 'keydown', { key: 'ArrowRight', bubbles: true } ) );
		} );
		await expect( counter( page ) ).toHaveText( '2 / 3' );
		await page.evaluate( () => document.dispatchEvent( new KeyboardEvent( 'keydown', { key: 'Escape' } ) ) );
		await expect( dialog( page ) ).toHaveCount( 0 );
		expect( errors ).toEqual( [] );
	} );

	test( 'wrong arguments throw a clear TypeError', async ( { page } ) => {
		await page.goto( '/' );
		const errors = await page.evaluate( () => {
			const error = ( fn ) => {
				try {
					fn();
					return 'no error';
				} catch ( e ) {
					return e.constructor.name + ': ' + e.message;
				}
			};
			return [
				error( () => Foldbox.open( 'photo.jpg' ) ),
				error( () => Foldbox.open( null ) ),
				error( () => Foldbox.grid( '#missing' ) ),
				error( () => Foldbox.grid( null ) ),
			];
		} );
		expect( errors[ 0 ] ).toMatch( /^TypeError: Foldbox: items must be an array/ );
		expect( errors[ 1 ] ).toMatch( /^TypeError: Foldbox: items must be an array/ );
		expect( errors[ 2 ] ).toBe( 'TypeError: Foldbox.grid: no element found for "#missing".' );
		expect( errors[ 3 ] ).toMatch( /^TypeError: Foldbox.grid: no element found/ );
	} );

	test( 'grid() takes a selector', async ( { page } ) => {
		await page.goto( '/' );
		await page.evaluate( () => Foldbox.grid( '#grid', { duration: 0 } ).filter( '.city', true ) );
		await expect( page.locator( '#grid .nature' ).first() ).toBeHidden();
		await expect( page.locator( '#grid .city' ) ).toBeVisible();
	} );

	test( 'numeric options out of range fall back to the defaults', async ( { page } ) => {
		await page.goto( '/' );
		const options = await page.evaluate( () => {
			const read = ( o ) => {
				const lb = new Foldbox.Lightbox( [ 'images/photo-1.svg' ], o );
				return [ lb.options.slideshowInterval, lb.options.maxZoom, lb.options.speed ];
			};
			return [
				read( { slideshowInterval: 0, maxZoom: 'big', speed: -5 } ),
				read( { slideshowInterval: NaN, maxZoom: 0.5, speed: null } ),
				read( { slideshowInterval: '2500', maxZoom: '4', speed: '200' } ),
			];
		} );
		expect( options ).toEqual( [
			[ 5000, 3, 400 ],
			[ 5000, 3, 400 ],
			[ 2500, 4, 200 ],
		] );
	} );

	test( 'the zoom button only changes when the zoom state does', async ( { page } ) => {
		await openFirst( page );
		await page.getByRole( 'button', { name: 'Zoom in' } ).click();
		const writes = await page.evaluate( async () => {
			let count = 0;
			new MutationObserver( ( list ) => ( count += list.length ) ).observe( document.querySelector( '.foldbox__btn--zoomIn' ), { childList: true, attributes: true } );
			for ( let i = 0; i < 30; i++ ) {
				window.dispatchEvent( new Event( 'resize' ) );
			}
			await new Promise( ( r ) => setTimeout( r, 50 ) );
			return count;
		} );
		expect( writes ).toBe( 0 );
		await page.getByRole( 'button', { name: 'Zoom out' } ).click();
		await expect( page.getByRole( 'button', { name: 'Zoom in' } ) ).toBeVisible();
	} );

	test( 'each gallery has its own youtubeParams and vimeoParams', async ( { page } ) => {
		await page.goto( '/' );
		const defaults = await page.evaluate( () => {
			const lb = new Foldbox.Lightbox( [ 'images/photo-1.svg' ] );
			lb.options.youtubeParams.mute = 1;
			lb.options.vimeoParams.muted = 1;
			return [ Foldbox.defaults.youtubeParams, Foldbox.defaults.vimeoParams ];
		} );
		expect( defaults ).toEqual( [ { rel: 0 }, {} ] );
	} );

	test( 'the page behind the gallery is inert while it is open', async ( { page } ) => {
		await page.goto( '/' );
		await page.evaluate( () => {
			const already = document.createElement( 'div' );
			already.id = 'already-inert';
			already.inert = true;
			document.body.appendChild( already );
		} );
		await page.getByRole( 'link', { name: 'Photo one' } ).focus();
		await page.keyboard.press( 'Enter' );
		await expect( dialog( page ) ).toBeVisible();
		const open = await page.evaluate( () => [ document.getElementById( 'gallery' ).inert, document.getElementById( 'grid' ).inert, document.querySelector( '.foldbox' ).inert ] );
		expect( open ).toEqual( [ true, true, false ] );
		await page.keyboard.press( 'Escape' );
		await expect( dialog( page ) ).toHaveCount( 0 );
		const closed = await page.evaluate( () => [ document.getElementById( 'gallery' ).inert, document.getElementById( 'grid' ).inert, document.getElementById( 'already-inert' ).inert ] );
		expect( closed ).toEqual( [ false, false, true ] );
		await expect( page.getByRole( 'link', { name: 'Photo one' } ) ).toBeFocused();
	} );

	test( 'methods on an unopened or closed gallery do nothing', async ( { page } ) => {
		await page.goto( '/' );
		const result = await page.evaluate( async ( list ) => {
			let changes = 0;
			const lb = new Foldbox.Lightbox( list, { slideshowInterval: 50, onChange: () => changes++ } );
			lb.play();
			lb.next();
			lb.prev();
			lb.goTo( 2 );
			lb.toggleZoom();
			lb.toggleFullscreen();
			lb.open();
			lb.close( true );
			lb.play();
			lb.next();
			await new Promise( ( r ) => setTimeout( r, 250 ) );
			return [ changes, lb.timer ];
		}, items );
		expect( result ).toEqual( [ 0, null ] );
	} );
} );

test.describe( 'videos', () => {
	// The players are never loaded for real: the tests stay offline.
	test.beforeEach( async ( { page } ) => {
		await page.route( /youtube|vimeo|ytimg/, ( route ) => route.fulfill( { status: 200, contentType: 'text/html', body: '' } ) );
		await page.goto( '/' );
	} );

	test( 'YouTube shows a poster, then the privacy-enhanced player', async ( { page } ) => {
		await page.evaluate( () => Foldbox.open( [ { src: 'https://youtu.be/dQw4w9WgXcQ?t=90', alt: 'Clip' } ] ) );
		const play = page.getByRole( 'button', { name: 'Play video' } );
		await expect( play ).toBeVisible();
		await play.click();
		const frame = page.locator( '.foldbox__iframe' );
		await expect( frame ).toHaveAttribute( 'title', 'Clip' );
		const src = new URL( await frame.getAttribute( 'src' ) );
		expect( src.origin + src.pathname ).toBe( 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ' );
		expect( Object.fromEntries( src.searchParams ) ).toEqual( { autoplay: '1', playsinline: '1', start: '90', rel: '0' } );
	} );

	test( 'Vimeo plays with the private hash and start time', async ( { page } ) => {
		await page.evaluate( () => Foldbox.open( [ 'https://vimeo.com/123456789/abcdef1234#t=65s' ], { vimeoParams: { muted: 1 } } ) );
		await page.getByRole( 'button', { name: 'Play video' } ).click();
		const src = await page.locator( '.foldbox__iframe' ).getAttribute( 'src' );
		expect( src ).toBe( 'https://player.vimeo.com/video/123456789?autoplay=1&muted=1&h=abcdef1234#t=65s' );
	} );

	test( 'leaving a playing video puts its poster back', async ( { page } ) => {
		await page.evaluate( () => Foldbox.open( [ 'https://youtu.be/dQw4w9WgXcQ', 'images/photo-1.svg' ], { speed: 0 } ) );
		await page.getByRole( 'button', { name: 'Play video' } ).click();
		await expect( page.locator( '.foldbox__iframe' ) ).toHaveCount( 1 );
		await page.getByRole( 'button', { name: 'Next' } ).click();
		await expect( page.locator( '.foldbox__iframe' ) ).toHaveCount( 0 );
		await page.getByRole( 'button', { name: 'Previous' } ).click();
		await expect( page.getByRole( 'button', { name: 'Play video' } ) ).toBeVisible();
	} );

	test( 'video files get a video element with every source', async ( { page } ) => {
		await page.evaluate( () =>
			Foldbox.open( [ { sources: [ { src: 'clip.webm', type: 'video/webm' }, { src: 'clip.mp4', type: 'video/mp4' } ], poster: 'images/photo-1.svg' } ] )
		);
		const video = page.locator( 'video.foldbox__video' );
		await expect( video ).toHaveAttribute( 'poster', 'images/photo-1.svg' );
		expect( await video.locator( 'source' ).evaluateAll( ( nodes ) => nodes.map( ( n ) => n.getAttribute( 'type' ) ) ) ).toEqual( [ 'video/webm', 'video/mp4' ] );
	} );
} );

test.describe( 'options', () => {
	test( 'download button: same-origin file, explicit URL, or hidden', async ( { page } ) => {
		await page.goto( '/' );
		await page.evaluate( () =>
			Foldbox.open( [ 'images/photo-1.svg', { src: 'images/photo-2.svg', download: 'https://cdn.example/original.tiff' }, { src: 'images/photo-3.svg', download: false } ], { download: true, speed: 0 } )
		);
		const button = page.locator( '.foldbox__btn--download' );
		await expect( button ).toHaveAttribute( 'href', 'images/photo-1.svg' );
		await expect( button ).not.toHaveAttribute( 'target', /./ );
		await page.getByRole( 'button', { name: 'Next' } ).click();
		await expect( button ).toHaveAttribute( 'href', 'https://cdn.example/original.tiff' );
		await expect( button ).toHaveAttribute( 'target', '_blank' );
		await page.getByRole( 'button', { name: 'Next' } ).click();
		await expect( button ).toBeHidden();
	} );

	test( 'themes and extra class names', async ( { page } ) => {
		await page.goto( '/' );
		for ( const [ theme, expected ] of [ [ 'light', /foldbox--light/ ], [ 'auto', /foldbox--auto/ ] ] ) {
			await page.evaluate( ( t ) => Foldbox.open( [ 'images/photo-1.svg' ], { theme: t, className: 'mine' } ), theme );
			await expect( page.locator( '.foldbox' ) ).toHaveClass( expected );
			await expect( page.locator( '.foldbox' ) ).toHaveClass( /\bmine\b/ );
			await page.evaluate( () => Foldbox.close() );
			await expect( page.locator( '.foldbox' ) ).toHaveCount( 0 );
		}
	} );

	test( 'labels translate the gallery, and every %1 and %2 is filled in', async ( { page } ) => {
		await page.goto( '/' );
		await page.evaluate( () =>
			Foldbox.open( [ 'images/photo-1.svg', 'images/photo-2.svg' ], { labels: { close: 'Schließen', next: 'Weiter', counter: '%1 von %2 (%1/%2)' } } )
		);
		await expect( page.getByRole( 'button', { name: 'Schließen' } ) ).toBeVisible();
		await expect( page.getByRole( 'button', { name: 'Weiter' } ) ).toBeVisible();
		await expect( counter( page ) ).toHaveText( '1 von 2 (1/2)' );
		await expect( page.locator( '.foldbox__thumb' ).nth( 1 ) ).toHaveAttribute( 'aria-label', '2 von 2 (2/2)' );
	} );

	test( 'bind() shows captions as text, open() as HTML unless turned off', async ( { page } ) => {
		await page.goto( '/' );
		// Closed galleries fade out for a moment; look at the open one.
		const caption = page.locator( '.foldbox:not(.is-closing) .foldbox__caption' );
		await page.evaluate( () => document.querySelector( '#gallery a' ).setAttribute( 'data-caption', '<b>bold</b>' ) );
		await page.getByRole( 'link', { name: 'Photo one' } ).click();
		await expect( caption ).toHaveText( '<b>bold</b>' );
		await page.keyboard.press( 'Escape' );
		await page.evaluate( () => Foldbox.open( [ { src: 'images/photo-1.svg', caption: '<b>bold</b>' } ] ) );
		await expect( caption.locator( 'b' ) ).toHaveText( 'bold' );
		await page.evaluate( () => Foldbox.close() );
		await page.evaluate( () => Foldbox.open( [ { src: 'images/photo-1.svg', caption: '<b>bold</b>' } ], { htmlCaptions: false } ) );
		await expect( caption ).toHaveText( '<b>bold</b>' );
	} );

	test( 'closing from fullscreen raises no errors', async ( { page } ) => {
		const errors = [];
		page.on( 'pageerror', ( e ) => errors.push( e.message ) );
		await openFirst( page );
		const button = page.locator( '.foldbox__btn--fullscreen' );
		test.skip( ( await button.count() ) === 0, 'fullscreen not available in this browser' );
		await button.click();
		await page.evaluate( () => Foldbox.close() );
		await page.evaluate( () => new Promise( ( r ) => setTimeout( r, 300 ) ) );
		expect( errors ).toEqual( [] );
	} );
} );

test.describe( 'builds', () => {
	test( 'the ES module exports the API without a global', async ( { page } ) => {
		await page.goto( '/esm.html' );
		await page.waitForFunction( () => window.FoldboxModule );
		const api = await page.evaluate( () => ( {
			version: window.FoldboxModule.version,
			open: typeof window.FoldboxModule.open,
			leaked: window.leakedGlobal,
		} ) );
		expect( api.version ).toMatch( /^\d+\.\d+\.\d+$/ );
		expect( api.open ).toBe( 'function' );
		expect( api.leaked ).toBe( false );
		// The named exports are the same functions and objects as the default export's.
		const same = await page.evaluate( () =>
			Object.keys( window.namedExports ).filter( ( key ) => window.namedExports[ key ] !== window.FoldboxModule[ key ] )
		);
		expect( same ).toEqual( [] );
		expect( await page.evaluate( () => Object.keys( window.namedExports ).length ) ).toBe( 8 );
	} );
} );
