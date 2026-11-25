// A small static server for the browser tests: serves the repository root,
// with "/" mapped to test/fixtures/. Usage: node test/server.mjs [port]
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath( new URL( '..', import.meta.url ) );
const port = Number( process.argv[ 2 ] ) || 4173;
const types = {
	'.html': 'text/html; charset=utf-8',
	'.js': 'text/javascript; charset=utf-8',
	'.mjs': 'text/javascript; charset=utf-8',
	'.css': 'text/css; charset=utf-8',
	'.svg': 'image/svg+xml',
};

createServer( async ( req, res ) => {
	let path = decodeURIComponent( new URL( req.url, 'http://localhost' ).pathname );
	if ( ! /^\/(src|dist)\//.test( path ) ) {
		path = '/test/fixtures' + ( path === '/' ? '/index.html' : path );
	}
	const file = normalize( join( root, path ) );
	if ( ! file.startsWith( root.endsWith( sep ) ? root : root + sep ) ) {
		res.writeHead( 403 ).end();
		return;
	}
	try {
		const body = await readFile( file );
		res.writeHead( 200, { 'Content-Type': types[ extname( file ) ] || 'application/octet-stream' } ).end( body );
	} catch {
		res.writeHead( 404 ).end( 'Not found' );
	}
} ).listen( port, '127.0.0.1', () => {
	console.log( `Test server on http://127.0.0.1:${ port }` );
} );
