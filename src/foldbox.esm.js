// Entry of the ES module build (dist/foldbox.mjs): the same API as the default
// export, also as named exports, such as import { open } from 'foldbox'.
import Foldbox from './foldbox.js';

export default Foldbox;
export const { version, defaults, open, bind, grid, close, Lightbox, Grid } = Foldbox;
