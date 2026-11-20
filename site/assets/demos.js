/* Live demos on the Foldbox home page. Photos: picsum.photos (Unsplash). */
( function () {
	'use strict';

	if ( ! window.Foldbox ) {
		return;
	}

	const pic = function ( id, w, h ) {
		return 'https://picsum.photos/id/' + id + '/' + w + '/' + h;
	};
	const photo = function ( id, title, place ) {
		return {
			src: pic( id, 1600, 1067 ),
			thumb: pic( id, 200, 200 ),
			alt: title,
			caption: '<strong>' + title + '</strong>' + ( place ? ' · ' + place : '' ),
		};
	};
	const videos = {
		mp4: {
			src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
			poster: pic( 152, 1200, 800 ),
			thumb: pic( 152, 200, 200 ),
			caption: '<strong>MP4 video</strong> · native player',
		},
		youtube: {
			src: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ',
			caption: '<strong>YouTube</strong> · loads when you press play',
		},
		vimeo: {
			src: 'https://vimeo.com/76979871',
			thumb: pic( 180, 200, 200 ),
			poster: pic( 180, 1200, 800 ),
			caption: '<strong>Vimeo</strong> · loads when you press play',
		},
	};

	/* 1. Albums with an animated filter. */
	const albums = [
		{ title: 'Forest walk', cat: 'nature', cover: 1043, items: [ photo( 1043, 'Forest', 'Pacific Northwest' ), photo( 1044, 'Lake' ), photo( 1047, 'Bridge' ), photo( 1050, 'Waves' ) ] },
		{ title: 'Downtown', cat: 'city', cover: 1067, items: [ photo( 1067, 'Skyline' ), photo( 1076, 'Street' ), photo( 1078, 'Market' ) ] },
		{ title: 'Mixed media', cat: 'video', cover: 1080, items: [ photo( 1080, 'Strawberries' ), videos.mp4, videos.youtube, videos.vimeo ] },
		{ title: 'Mountains', cat: 'nature', cover: 1036, items: [ photo( 1036, 'Peak' ), photo( 1039, 'Falls' ), photo( 1018, 'Ridge' ) ] },
		{ title: 'Night city', cat: 'city', cover: 1033, items: [ photo( 1033, 'Lights' ), photo( 1031, 'Tower' ) ] },
		{ title: 'Coastline', cat: 'nature', cover: 1019, items: [ photo( 1019, 'Coast' ), photo( 1015, 'River valley' ), photo( 1016, 'Canyon' ) ] },
		{ title: 'Short clips', cat: 'video', cover: 152, items: [ videos.mp4, videos.vimeo ] },
		{ title: 'Architecture', cat: 'city', cover: 1048, items: [ photo( 1048, 'Facade' ), photo( 1054, 'Rooftops' ) ] },
	];

	const grid = document.getElementById( 'album-grid' );
	if ( grid ) {
		albums.forEach( function ( album ) {
			const btn = document.createElement( 'button' );
			btn.type = 'button';
			btn.className = 'album';
			btn.setAttribute( 'data-cat', album.cat );
			btn.innerHTML =
				'<span class="cover"><img loading="lazy" width="600" height="400" alt=""><span class="count"></span></span>' +
				'<span class="title"></span><span class="meta"></span>';
			btn.querySelector( 'img' ).src = pic( album.cover, 600, 400 );
			btn.querySelector( '.count' ).textContent = album.items.length + ( album.items.length === 1 ? ' item' : ' items' );
			btn.querySelector( '.title' ).textContent = album.title;
			btn.querySelector( '.meta' ).textContent = album.cat.charAt( 0 ).toUpperCase() + album.cat.slice( 1 );
			btn.setAttribute( 'aria-label', 'Open album: ' + album.title );
			btn.addEventListener( 'click', function () {
				window.Foldbox.open( album.items, {
					origin: btn.querySelector( 'img' ),
					theme: 'auto',
					download: true,
				} );
			} );
			grid.appendChild( btn );
		} );

		const filterGrid = window.Foldbox.grid( grid, { itemSelector: ':scope > .album' } );
		const chips = document.querySelectorAll( '#album-filters button' );
		chips.forEach( function ( chip ) {
			chip.addEventListener( 'click', function () {
				chips.forEach( function ( c ) {
					c.setAttribute( 'aria-pressed', c === chip ? 'true' : 'false' );
				} );
				const cat = chip.getAttribute( 'data-filter' );
				filterGrid.filter( cat === '*' ? '*' : '[data-cat="' + cat + '"]' );
			} );
		} );
	}

	/* 2. Every media type in one gallery. */
	const media = [ photo( 1025, 'Pug', 'Image' ), videos.mp4, videos.youtube, videos.vimeo, photo( 1084, 'Walrus', 'Image' ) ];
	const mediaRow = document.getElementById( 'media-row' );
	if ( mediaRow ) {
		const labels = [ 'Image', 'MP4', 'YouTube', 'Vimeo', 'Image' ];
		const thumbs = [ pic( 1025, 300, 300 ), pic( 152, 300, 300 ), 'https://i.ytimg.com/vi/aqz-KE-bpKQ/hqdefault.jpg', pic( 180, 300, 300 ), pic( 1084, 300, 300 ) ];
		media.forEach( function ( item, i ) {
			const btn = document.createElement( 'button' );
			btn.type = 'button';
			btn.setAttribute( 'aria-label', 'Open ' + labels[ i ] + ' in the gallery' );
			btn.innerHTML = '<img loading="lazy" width="300" height="300" alt=""><span class="badge"></span>';
			btn.querySelector( 'img' ).src = thumbs[ i ];
			btn.querySelector( '.badge' ).textContent = labels[ i ];
			btn.addEventListener( 'click', function () {
				window.Foldbox.open( media, { index: i, origin: btn.querySelector( 'img' ), theme: 'auto' } );
			} );
			mediaRow.appendChild( btn );
		} );
	}

	/* 3. Plain links with bind(). */
	if ( document.getElementById( 'bind-demo' ) ) {
		window.Foldbox.bind( '#bind-demo', { animation: 'fade', theme: 'auto' } );
	}

	/* 4. Playground. */
	const form = document.getElementById( 'playground' );
	if ( form ) {
		const out = document.getElementById( 'playground-code' );
		const defaults = window.Foldbox.defaults;
		const sample = [ photo( 1015, 'River valley' ), photo( 1016, 'Canyon' ), videos.youtube, photo( 1018, 'Mountains' ), videos.mp4, photo( 1019, 'Coast' ) ];

		const read = function () {
			const opts = {};
			form.querySelectorAll( 'input[type="checkbox"]' ).forEach( function ( input ) {
				opts[ input.name ] = input.checked;
			} );
			form.querySelectorAll( 'select' ).forEach( function ( select ) {
				opts[ select.name ] = /^\d+$/.test( select.value ) ? Number( select.value ) : select.value;
			} );
			return opts;
		};

		const render = function () {
			const opts = read();
			const changed = Object.keys( opts ).filter( function ( key ) {
				return opts[ key ] !== defaults[ key ];
			} );
			let text = 'Foldbox.open( items';
			if ( changed.length ) {
				text +=
					', {\n' +
					changed
						.map( function ( key ) {
							const v = opts[ key ];
							return '\t' + key + ': ' + ( typeof v === 'string' ? "'" + v + "'" : String( v ) ) + ',';
						} )
						.join( '\n' ) +
					'\n}';
			}
			text += ' );';
			out.querySelector( 'code' ).textContent = text;
			window.FoldboxSite.enhanceCode( out );
		};

		form.addEventListener( 'change', render );
		form.addEventListener( 'submit', function ( e ) {
			e.preventDefault();
			const opts = read();
			opts.origin = document.getElementById( 'playground-open' );
			window.Foldbox.open( sample, opts );
		} );
		render();
	}
} )();
