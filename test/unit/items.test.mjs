// Item detection and option handling, without a browser (npm run test:unit).
// The Lightbox constructor only normalises items and options; the DOM is
// built by open(), so these run in plain Node.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const Foldbox = createRequire( import.meta.url )( '../../src/foldbox.js' );
const item = ( raw, options ) => new Foldbox.Lightbox( [ raw ], options ).items[ 0 ];
const pick = ( obj, keys ) => Object.fromEntries( keys.map( ( key ) => [ key, obj[ key ] ] ) );

const ID = 'dQw4w9WgXcQ';

test( 'YouTube links of every form', () => {
	for ( const src of [
		`https://www.youtube.com/watch?v=${ ID }`,
		`https://youtube.com/watch?feature=share&v=${ ID }`,
		`https://m.youtube.com/watch?v=${ ID }`,
		`https://youtu.be/${ ID }`,
		`https://www.youtube.com/embed/${ ID }`,
		`https://www.youtube-nocookie.com/embed/${ ID }`,
		`https://www.youtube.com/shorts/${ ID }`,
		`https://www.youtube.com/live/${ ID }`,
		`https://www.youtube.com/v/${ ID }`,
	] ) {
		assert.deepEqual( pick( item( src ), [ 'type', 'videoId', 'start' ] ), { type: 'youtube', videoId: ID, start: 0 }, src );
	}
} );

test( 'YouTube start times', () => {
	const cases = {
		[ `https://youtu.be/${ ID }?t=90` ]: 90,
		[ `https://www.youtube.com/watch?v=${ ID }&t=1m30s` ]: 90,
		[ `https://www.youtube.com/watch?v=${ ID }&t=1h2m3s` ]: 3723,
		[ `https://www.youtube.com/embed/${ ID }?start=45` ]: 45,
		[ `https://www.youtube.com/watch?v=${ ID }&t=90s` ]: 90,
		[ `https://www.youtube.com/watch?v=${ ID }&t=nonsense` ]: 0,
	};
	for ( const [ src, start ] of Object.entries( cases ) ) {
		assert.equal( item( src ).start, start, src );
	}
	assert.equal( item( { src: `https://youtu.be/${ ID }?t=90`, start: 12 } ).start, 12, 'an explicit start wins' );
	assert.equal( item( { src: `https://youtu.be/${ ID }`, start: -5.7 } ).start, 0, 'negative starts become 0' );
	assert.equal( item( { src: `https://youtu.be/${ ID }`, start: '30.9' } ).start, 30, 'starts are whole seconds' );
} );

test( 'YouTube thumbnails', () => {
	assert.equal( item( `https://youtu.be/${ ID }` ).thumb, `https://i.ytimg.com/vi/${ ID }/hqdefault.jpg` );
	assert.equal( item( `https://youtu.be/${ ID }`, { youtubeThumbnails: false } ).thumb, undefined );
	assert.equal( item( { src: `https://youtu.be/${ ID }`, poster: 'poster.jpg' } ).thumb, 'poster.jpg' );
	assert.equal( item( { src: `https://youtu.be/${ ID }`, thumb: 't.jpg', poster: 'p.jpg' } ).thumb, 't.jpg' );
} );

test( 'Vimeo links, private hashes and start times', () => {
	const cases = [
		[ 'https://vimeo.com/123456789', { videoId: '123456789', hash: '', start: 0 } ],
		[ 'https://vimeo.com/123456789/abcdef1234', { videoId: '123456789', hash: 'abcdef1234', start: 0 } ],
		[ 'https://player.vimeo.com/video/123456789?h=abcdef1234', { videoId: '123456789', hash: 'abcdef1234', start: 0 } ],
		[ 'https://vimeo.com/channels/staffpicks/123456789', { videoId: '123456789', hash: '', start: 0 } ],
		[ 'https://vimeo.com/showcase/1234567/video/987654321', { videoId: '987654321', hash: '', start: 0 } ],
		[ 'https://vimeo.com/123456789#t=90s', { videoId: '123456789', hash: '', start: 90 } ],
		[ 'https://vimeo.com/123456789#t=1m5s', { videoId: '123456789', hash: '', start: 65 } ],
	];
	for ( const [ src, expected ] of cases ) {
		const it = item( src );
		assert.equal( it.type, 'vimeo', src );
		assert.deepEqual( pick( it, [ 'videoId', 'hash', 'start' ] ), expected, src );
	}
} );

test( 'video files', () => {
	for ( const src of [ 'clip.mp4', 'clip.WEBM', 'a/b/clip.ogv?v=2', 'clip.mov#t=5', 'https://cdn.example/clip.m4v' ] ) {
		const it = item( src );
		assert.equal( it.type, 'video', src );
		assert.deepEqual( it.sources, [ { src } ], src );
	}
	const multi = item( { sources: [ { src: 'a.webm', type: 'video/webm' }, { src: 'a.mp4', type: 'video/mp4' } ], poster: 'p.jpg' } );
	assert.equal( multi.type, 'video' );
	assert.equal( multi.sources.length, 2 );
	assert.equal( multi.thumb, 'p.jpg', 'the poster is the thumbnail' );
} );

test( 'images and fallbacks', () => {
	assert.deepEqual( pick( item( 'photo.jpg' ), [ 'type', 'src', 'thumb' ] ), { type: 'image', src: 'photo.jpg', thumb: 'photo.jpg' } );
	assert.equal( item( 'clip.mp4.jpg' ).type, 'image', 'only the extension counts' );
	assert.equal( item( 'https://example.com/youtube-video' ).type, 'image', 'no video ID, no YouTube' );
	assert.equal( item( { src: new URL( 'https://example.com/a.png' ) } ).src, 'https://example.com/a.png', 'URL objects as src' );
	assert.equal( item( { src: 'photo.jpg', thumb: 'small.jpg' } ).thumb, 'small.jpg' );
	assert.equal( item( {} ).type, 'image', 'an empty item is an image' );
	assert.equal( item( null ).type, 'image', 'null is an empty item' );
} );

test( 'explicit types', () => {
	assert.equal( item( { src: `https://youtu.be/${ ID }`, type: 'image' } ).type, 'image', 'an explicit type wins' );
	assert.equal( item( { src: 'stream', type: 'video' } ).sources[ 0 ].src, 'stream' );
	assert.equal( item( { type: 'youtube', videoId: ID } ).videoId, ID, 'a video ID without a link' );
	assert.equal( item( { src: 'photo.jpg', type: 'youtube' } ).type, 'image', 'youtube without an ID is detected from the URL' );
	assert.equal( item( { src: 'clip.mp4', type: 'gif' } ).type, 'video', 'unknown types are detected from the URL' );
} );

test( 'the caller’s items are not changed', () => {
	const raw = { src: `https://youtu.be/${ ID }?t=5` };
	item( raw );
	assert.deepEqual( raw, { src: `https://youtu.be/${ ID }?t=5` } );
} );

test( 'numeric options fall back to the defaults', () => {
	const options = ( o ) => pick( new Foldbox.Lightbox( [], o ).options, [ 'speed', 'slideshowInterval', 'maxZoom' ] );
	assert.deepEqual( options( { speed: -1, slideshowInterval: 0, maxZoom: 0.5 } ), { speed: 400, slideshowInterval: 5000, maxZoom: 3 } );
	assert.deepEqual( options( { speed: 'fast', slideshowInterval: Infinity, maxZoom: null } ), { speed: 400, slideshowInterval: 5000, maxZoom: 3 } );
	assert.deepEqual( options( { speed: '0', slideshowInterval: ' 2500 ', maxZoom: 1 } ), { speed: 0, slideshowInterval: 2500, maxZoom: 1 } );
} );

test( 'wrong items throw a TypeError', () => {
	for ( const items of [ 'photo.jpg', null, undefined, {}, 5 ] ) {
		assert.throws( () => new Foldbox.Lightbox( items ), TypeError, String( items ) );
	}
} );

test( 'labels and nested options are per gallery', () => {
	const a = new Foldbox.Lightbox( [], { labels: { close: 'Schließen' } } ).options;
	const b = new Foldbox.Lightbox( [] ).options;
	assert.equal( a.labels.close, 'Schließen' );
	assert.equal( a.labels.next, 'Next', 'missing labels stay in English' );
	assert.equal( b.labels.close, 'Close' );
	a.youtubeParams.mute = 1;
	assert.deepEqual( Foldbox.defaults.youtubeParams, { rel: 0 } );
} );
