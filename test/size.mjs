// Fails when a built file grows past its limit (npm run size, after npm run build).
// Raise a limit only on purpose, in the same PR as the change that needs it.
import { readFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';

const KB = 1024;
const limits = [
	{ file: 'dist/foldbox.min.js', min: 30 * KB, gzip: 9.75 * KB },
	{ file: 'dist/foldbox.mjs', min: 30 * KB, gzip: 9.75 * KB },
	{ file: 'dist/foldbox.min.css', min: 10 * KB, gzip: 2.75 * KB },
];

const kb = ( bytes ) => ( bytes / KB ).toFixed( 2 ) + ' KB';
let failed = false;

for ( const { file, min, gzip } of limits ) {
	const body = readFileSync( file );
	const zipped = gzipSync( body, { level: 9 } ).length;
	const ok = body.length <= min && zipped <= gzip;
	failed ||= ! ok;
	console.log(
		`${ ok ? 'ok  ' : 'FAIL' } ${ file }: ${ kb( body.length ) } minified (limit ${ kb( min ) }), ${ kb( zipped ) } gzipped (limit ${ kb( gzip ) })`
	);
}

if ( failed ) {
	console.error( '\nA file is over its size limit. Make it smaller, or raise the limit in test/size.mjs if the growth is worth it.' );
	process.exit( 1 );
}
