// Compile-only check of types/foldbox.d.ts (npm run test:types).
import Foldbox = require( 'foldbox' );

const lightbox: Foldbox.Lightbox = Foldbox.open(
	[
		'photo.jpg',
		{ src: 'https://youtu.be/aqz-KE-bpKQ?t=90', caption: '<b>Video</b>' },
		{ type: 'video', sources: [ { src: 'clip.webm', type: 'video/webm' } ], poster: 'poster.jpg', download: false },
	],
	{
		theme: 'auto',
		animation: 'fade',
		origin: document.querySelector( 'img' ),
		labels: { close: 'Fermer' },
		onChange( index, item, box ) {
			const n: number = index + box.items.length;
			console.log( n, item.src, this.index );
		},
	}
);
lightbox.next().prev().goTo( 2 ).play().pause();
lightbox.toggleZoom();
lightbox.close();

const unbind: () => void = Foldbox.bind( '#gallery', { selector: 'a.photo', htmlCaptions: false } );
unbind();

const grid = Foldbox.grid( document.body, { itemSelector: '.card', duration: 300 } );
grid.filter( '.nature' ).filter( ( el ) => el.classList.contains( 'city' ), true );

Foldbox.defaults.labels = { close: 'Schließen' };
Foldbox.defaults.theme = 'light';
const version: string = Foldbox.version;
new Foldbox.Lightbox( [ 'a.jpg' ] ).open();
Foldbox.close();
console.log( version );

// @ts-expect-error: unknown theme.
Foldbox.open( [], { theme: 'blue' } );
// @ts-expect-error: unknown option.
Foldbox.open( [], { colour: 'red' } );
