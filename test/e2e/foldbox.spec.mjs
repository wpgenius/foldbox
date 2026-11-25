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
		await openFirst( page );
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
		for ( let i = 0; i < 15; i++ ) {
			await page.keyboard.press( 'Tab' );
			expect( await page.evaluate( () => !! document.activeElement.closest( '.foldbox' ) ) ).toBe( true );
		}
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
	} );
} );
