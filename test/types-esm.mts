// The ES module entry has the same default export (npm run test:types).
import Foldbox from 'foldbox';
import type { Options } from 'foldbox';

const options: Options = { loop: false };
Foldbox.open( [ 'photo.jpg' ], options ).close();
