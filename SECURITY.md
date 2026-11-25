# Security policy

## Supported versions

Security fixes go into the latest release only. Foldbox follows semantic versioning, so updating within 1.x is safe.

| Version | Supported |
|---|---|
| Latest 1.x | Yes |
| Older | No |

## Reporting a vulnerability

Please don't report security problems in public issues, discussions or pull requests.

Report them privately through GitHub: open the [**Security** tab](https://github.com/wpgenius/foldbox/security) and choose **Report a vulnerability**. If you can't use GitHub, email support@wpgenius.in.

Please include:

- what an attacker can do, and under which options or input (for example a caption, a link or an item field);
- the Foldbox version, and the browser if it matters;
- steps or a small page that shows the problem.

## What to expect

- We confirm we've received your report within a few working days.
- We look into it, keep you updated, and agree on a disclosure date with you.
- The fix ships as a new release, and the published advisory credits you unless you'd rather stay anonymous.

## Scope

Foldbox runs in the browser and inserts content you give it. With `Foldbox.open()`, captions are inserted as HTML by default, so a page that passes untrusted text as captions should escape it or set `htmlCaptions: false`; that's documented behaviour, not a vulnerability. `Foldbox.bind()` shows captions as plain text by default, and download links accept only http(s) and `blob:` URLs. A way around those defaults is a vulnerability. See [Captions and security](https://wpgenius.github.io/foldbox/docs.html#security) in the documentation.
