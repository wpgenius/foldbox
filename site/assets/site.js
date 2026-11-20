/* Foldbox website: theme switch, code blocks, tabs, contributors, docs navigation. */
( function () {
	'use strict';

	const root = document.documentElement;
	const store = {
		get( key ) {
			try {
				return window.localStorage.getItem( key );
			} catch ( e ) {
				return null;
			}
		},
		set( key, value ) {
			try {
				window.localStorage.setItem( key, value );
			} catch ( e ) {}
		},
	};

	/* Site theme (the page, not the lightbox). */
	const saved = store.get( 'foldbox-site-theme' );
	if ( saved === 'light' || saved === 'dark' ) {
		root.setAttribute( 'data-theme', saved );
	}

	function isDark() {
		const set = root.getAttribute( 'data-theme' );
		if ( set ) {
			return set === 'dark';
		}
		return window.matchMedia( '(prefers-color-scheme: dark)' ).matches;
	}

	window.FoldboxSite = { isDark };

	document.querySelectorAll( '.theme-toggle' ).forEach( function ( btn ) {
		const sync = function () {
			btn.setAttribute( 'aria-pressed', isDark() ? 'true' : 'false' );
		};
		sync();
		btn.addEventListener( 'click', function () {
			const next = isDark() ? 'light' : 'dark';
			root.setAttribute( 'data-theme', next );
			store.set( 'foldbox-site-theme', next );
			sync();
		} );
	} );

	/* Library version. */
	if ( window.Foldbox ) {
		document.querySelectorAll( '[data-version]' ).forEach( function ( node ) {
			node.textContent = node.getAttribute( 'data-version' ) === 'v' ? 'v' + window.Foldbox.version : window.Foldbox.version;
		} );
	}

	/* Code blocks: light highlighting and a copy button. */
	function escapeHtml( s ) {
		return s.replace( /&/g, '&amp;' ).replace( /</g, '&lt;' ).replace( />/g, '&gt;' );
	}

	function highlight( code, lang ) {
		const source = code.textContent;
		let pattern;
		if ( lang === 'html' ) {
			pattern = /(<!--[\s\S]*?-->)|("[^"]*")|(<\/?[a-zA-Z][\w-]*)/g;
		} else if ( lang === 'css' ) {
			pattern = /(\/\*[\s\S]*?\*\/)|("[^"]*"|'[^']*')|(--[\w-]+|^\s*[.#]?[\w.-]+(?=\s*\{))/gm;
		} else if ( lang === 'bash' ) {
			pattern = /(#.*$)|("[^"]*"|'[^']*')|(^\s*\w[\w-]*)/gm;
		} else {
			pattern = /(\/\/.*$|\/\*[\s\S]*?\*\/)|('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*`)|(\b(?:const|let|var|function|return|new|true|false|null|if|else)\b)/gm;
		}
		let out = '';
		let last = 0;
		source.replace( pattern, function ( match, comment, string, keyword, offset ) {
			out += escapeHtml( source.slice( last, offset ) );
			const cls = comment ? 'tok-c' : string ? 'tok-s' : 'tok-k';
			out += '<span class="' + cls + '">' + escapeHtml( match ) + '</span>';
			last = offset + match.length;
			return match;
		} );
		out += escapeHtml( source.slice( last ) );
		code.innerHTML = out;
	}

	function enhanceCode( block ) {
		const code = block.querySelector( 'code' );
		if ( ! code ) {
			return;
		}
		highlight( code, block.getAttribute( 'data-lang' ) );
		if ( block.querySelector( '.copy' ) ) {
			return;
		}
		const btn = document.createElement( 'button' );
		btn.type = 'button';
		btn.className = 'copy';
		btn.textContent = 'Copy';
		btn.addEventListener( 'click', function () {
			const done = function ( text ) {
				btn.textContent = text;
				window.setTimeout( function () {
					btn.textContent = 'Copy';
				}, 1500 );
			};
			if ( navigator.clipboard ) {
				navigator.clipboard.writeText( code.textContent ).then(
					function () {
						done( 'Copied' );
					},
					function () {
						done( 'Press Ctrl+C' );
					}
				);
			} else {
				done( 'Press Ctrl+C' );
			}
		} );
		block.appendChild( btn );
	}

	document.querySelectorAll( '.code' ).forEach( enhanceCode );
	window.FoldboxSite.enhanceCode = enhanceCode;

	/* Tabs. */
	document.querySelectorAll( '.tabs' ).forEach( function ( tabs ) {
		const buttons = Array.prototype.slice.call( tabs.querySelectorAll( '[role="tab"]' ) );
		const select = function ( btn, focus ) {
			buttons.forEach( function ( b ) {
				const on = b === btn;
				b.setAttribute( 'aria-selected', on ? 'true' : 'false' );
				b.tabIndex = on ? 0 : -1;
				document.getElementById( b.getAttribute( 'aria-controls' ) ).hidden = ! on;
			} );
			if ( focus ) {
				btn.focus();
			}
		};
		buttons.forEach( function ( btn, i ) {
			btn.addEventListener( 'click', function () {
				select( btn );
			} );
			btn.addEventListener( 'keydown', function ( e ) {
				const step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
				if ( step ) {
					e.preventDefault();
					select( buttons[ ( i + step + buttons.length ) % buttons.length ], true );
				}
			} );
		} );
	} );

	/* Contributors, from the GitHub API (falls back to the static link). */
	const people = document.getElementById( 'contributors' );
	if ( people && window.fetch ) {
		window
			.fetch( 'https://api.github.com/repos/wpgenius/foldbox/contributors?per_page=100' )
			.then( function ( r ) {
				return r.ok ? r.json() : [];
			} )
			.then( function ( list ) {
				list = ( list || [] ).filter( function ( p ) {
					return p.type === 'User';
				} );
				if ( ! list.length ) {
					return;
				}
				people.textContent = '';
				list.forEach( function ( p ) {
					const li = document.createElement( 'li' );
					const a = document.createElement( 'a' );
					a.href = p.html_url;
					const img = document.createElement( 'img' );
					img.src = p.avatar_url + '&s=80';
					img.alt = '';
					img.width = 40;
					img.height = 40;
					img.loading = 'lazy';
					const text = document.createElement( 'div' );
					const name = document.createElement( 'strong' );
					name.textContent = p.login;
					const count = document.createElement( 'span' );
					count.textContent = p.contributions + ( p.contributions === 1 ? ' commit' : ' commits' );
					text.appendChild( name );
					text.appendChild( count );
					a.appendChild( img );
					a.appendChild( text );
					li.appendChild( a );
					people.appendChild( li );
				} );
			} )
			.catch( function () {} );
	}

	/* Docs: heading anchors and the current section in the table of contents. */
	const doc = document.querySelector( '.doc' );
	if ( doc ) {
		// The table of contents is a closed menu on small screens, a sidebar on wide ones.
		const tocMenu = document.querySelector( '.toc details' );
		const wide = window.matchMedia( '(min-width: 960px)' );
		const syncToc = function () {
			if ( tocMenu ) {
				tocMenu.open = wide.matches;
			}
		};
		syncToc();
		if ( wide.addEventListener ) {
			wide.addEventListener( 'change', syncToc );
		}
		document.querySelectorAll( '.toc a' ).forEach( function ( a ) {
			a.addEventListener( 'click', function () {
				if ( ! wide.matches && tocMenu ) {
					tocMenu.open = false;
				}
			} );
		} );

		doc.querySelectorAll( 'h2[id], h3[id]' ).forEach( function ( h ) {
			const a = document.createElement( 'a' );
			a.className = 'anchor';
			a.href = '#' + h.id;
			a.setAttribute( 'aria-label', 'Link to this section' );
			a.textContent = '#';
			h.appendChild( a );
		} );

		const links = {};
		document.querySelectorAll( '.toc a[href^="#"]' ).forEach( function ( a ) {
			links[ a.getAttribute( 'href' ).slice( 1 ) ] = a;
		} );
		const headings = Array.prototype.slice.call( doc.querySelectorAll( 'h2[id], h3[id]' ) ).filter( function ( h ) {
			return links[ h.id ];
		} );
		let current = null;
		const update = function () {
			let active = headings[ 0 ];
			headings.forEach( function ( h ) {
				if ( h.getBoundingClientRect().top < 120 ) {
					active = h;
				}
			} );
			if ( active && active !== current ) {
				if ( current ) {
					links[ current.id ].classList.remove( 'is-current' );
				}
				links[ active.id ].classList.add( 'is-current' );
				current = active;
			}
		};
		let ticking = false;
		window.addEventListener(
			'scroll',
			function () {
				if ( ! ticking ) {
					ticking = true;
					window.requestAnimationFrame( function () {
						ticking = false;
						update();
					} );
				}
			},
			{ passive: true }
		);
		update();
	}
} )();
