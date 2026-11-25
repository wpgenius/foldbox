# Contributing to Foldbox

Thanks for helping. Bug reports, ideas, docs fixes and code are all welcome. Please follow the [code of conduct](CODE_OF_CONDUCT.md), and report security problems privately as described in [SECURITY.md](SECURITY.md).

## Set up and build

You need Node.js 22 or later.

```bash
git clone https://github.com/wpgenius/foldbox.git
cd foldbox
npm install
npm run build   # dist/foldbox.min.js and dist/foldbox.min.css
npm run site    # assemble the website (site/ + dist/) into _site/
```

| Folder | What it is |
|---|---|
| `src/` | The library: `foldbox.js` and `foldbox.css`. Edit these. |
| `demo/` | A development demo that loads `src/` directly. |
| `site/` | The website on GitHub Pages: demos and documentation. |
| `dist/` | Minified files, written by the release workflow. Don't edit or commit. |

Open `demo/index.html` or `_site/index.html` through a local web server (for example `npx serve`), not as a `file://` page, so the YouTube and Vimeo players load.

## How a change gets in

1. **Open an issue** describing the bug or the change, or comment on an existing one. One issue per change.
2. **Work on a branch** in your fork.
3. **Open a pull request** that closes the issue: put `Closes #12` (one line per issue) in the description. The changelog lists one line per issue closed since the previous release.
4. CI must pass. A maintainer reviews it and **squash-merges** it, so your PR becomes one commit on `main` with the PR title and description as its message.

### What a pull request may change

- Change `src/`, `site/`, `demo/` and the docs (README, `site/docs.html`) as needed. When you add or change an option, update the documentation in the same PR.
- **Don't commit `dist/` or `CHANGELOG.md`**, and don't change version numbers. The release workflow writes them when your PR is merged. CI fails if a PR touches `dist/` or `CHANGELOG.md`.
- Keep Foldbox free of runtime dependencies, and keep it working without a build step (a plain `<script>` tag).
- Test in at least one Chromium browser and one other (Firefox or Safari), with the keyboard as well as the mouse or touch.

## Releases and version numbers

Releases are automatic: when a PR that changes `src/` is merged, the release workflow bumps the version, rebuilds `dist/`, writes the changelog, publishes a GitHub release and publishes the package to npm. PRs that change only the website, docs or CI make no release.

The version goes up by a **patch** (1.2.0 → 1.2.1) by default. A maintainer adds a label to the PR before merging for a bigger bump:

| Label | Bump | Use for |
|---|---|---|
| *(none)* | Patch | Bug fixes and small improvements |
| `release: minor` | Minor (1.2.0 → 1.3.0) | New options, item fields or features; backward compatible |
| `release: major` | Major (1.2.0 → 2.0.0) | Changes that can break existing pages |

## Style

- Plain modern JavaScript (ES2018), no dependencies. Tabs for indentation, spaces inside parentheses, as in the existing code.
- Comments explain *why*, not *what*.
- User-facing text goes through the `labels` option, so it can be translated.
