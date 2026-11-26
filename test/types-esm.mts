// The ES module entry has the same default export, plus named exports (npm run test:types).
import Foldbox, { open, grid, version } from 'foldbox';
import type { Options } from 'foldbox';

const options: Options = { loop: false };
Foldbox.open( [ 'photo.jpg' ], options ).close();
open( [ 'photo.jpg' ] ).next();
grid( '#grid' ).filter( '*' );
const v: string = version;
void v;
