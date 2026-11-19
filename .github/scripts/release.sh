#!/usr/bin/env bash
# Prepare a release: next version, version bump in all files, changelog.
#
# Usage: release.sh <bump>   (bump = patch | minor | major)
# Env:   DRY_RUN=1 prints the plan and changes nothing.
#        GH_TOKEN for reading closed issues (gh CLI).
# Output (to $GITHUB_OUTPUT when set): version, tag, notes_file.
set -euo pipefail

bump="${1:-patch}"
root="$(git rev-parse --show-toplevel)"
cd "$root"

current="$(node -p "require('./package.json').version")"
IFS=. read -r major minor patch <<<"$current"
case "$bump" in
	major) major=$((major + 1)); minor=0; patch=0 ;;
	minor) minor=$((minor + 1)); patch=0 ;;
	*) patch=$((patch + 1)) ;;
esac
next="$major.$minor.$patch"
tag="v$next"
today="$(date -u +%Y-%m-%d)"
notes="$(mktemp)"

# Changelog lines: an "## Unreleased" section written in PRs wins. Otherwise
# one line per issue closed (as completed) since the previous release.
if grep -q '^## Unreleased' CHANGELOG.md; then
	awk '/^## Unreleased/{p=1;next} /^## /{p=0} p' CHANGELOG.md | sed -e '/./,$!d' > "$notes"
else
	since="$(git log -1 --format=%cI "v$current" 2>/dev/null || true)"
	query="repo:${GITHUB_REPOSITORY:-wpgenius/foldbox} is:issue is:closed reason:completed"
	[ -n "$since" ] && query="$query closed:>$since"
	gh api -X GET search/issues -f q="$query" -f per_page=100 \
		--jq '.items[] | select(.title | test("^Release ") | not) | "- \(.title) (#\(.number))"' > "$notes.lines" || true
	if [ ! -s "$notes.lines" ]; then
		# No issue: fall back to the commit subjects since the last release.
		range="HEAD"; git rev-parse -q --verify "v$current" >/dev/null && range="v$current..HEAD"
		git log --no-merges --format='- %s' "$range" -- src | grep -v '^- Release ' > "$notes.lines" || true
	fi
	[ -s "$notes.lines" ] || echo '- Maintenance release.' > "$notes.lines"
	{ echo '### Changes'; cat "$notes.lines"; } > "$notes"
	rm -f "$notes.lines"
fi

echo "Release $current -> $next ($bump)"
echo "--- notes ---"; cat "$notes"; echo "-------------"

if [ "${DRY_RUN:-}" != "1" ]; then
	npm version "$next" --no-git-tag-version --allow-same-version >/dev/null
	sed -i.bak -E "s/Foldbox [0-9]+\.[0-9]+\.[0-9]+ –/Foldbox $next –/" src/foldbox.js src/foldbox.css
	sed -i.bak -E "s/const VERSION = '[0-9]+\.[0-9]+\.[0-9]+';/const VERSION = '$next';/" src/foldbox.js
	rm -f src/*.bak

	# Write the section into CHANGELOG.md, replacing "## Unreleased" if present.
	NEXT="$next" TODAY="$today" NOTES="$notes" node -e '
		const fs = require("fs");
		const notes = fs.readFileSync(process.env.NOTES, "utf8").trim();
		const head = "## " + process.env.NEXT + " – " + process.env.TODAY;
		let log = fs.readFileSync("CHANGELOG.md", "utf8");
		const unreleased = /^## Unreleased\n[\s\S]*?(?=^## |(?![\s\S]))/m;
		const section = head + "\n\n" + notes + "\n\n";
		log = unreleased.test(log) ? log.replace(unreleased, section) : log.replace(/^(# Changelog\n\n)/, "$1" + section);
		fs.writeFileSync("CHANGELOG.md", log);
	'
fi

if [ -n "${GITHUB_OUTPUT:-}" ]; then
	{ echo "version=$next"; echo "tag=$tag"; echo "notes_file=$notes"; } >> "$GITHUB_OUTPUT"
fi
