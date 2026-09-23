# Validation — 2026-09-23

## Scope and decisions

- Keep the existing left-aligned introduction, tag cloud, article rows and project cards. Share spacing, typography and interaction styles across home, exploration, projects, about, taxonomy and reading pages.
- About remains Markdown-driven. Project and exploration introductions use page metadata; the theme contains no personal-site content.
- Keep readable CSS in the repository; Hugo minifies and fingerprints the published CSS/JS.
- `exampleSite/` is self-contained and uses demonstration content. Python checks use only the standard library.

## Reproducible checks

From the theme root with Hugo 0.166.0 and Python 3:

```sh
python -m unittest discover -s tests -v
hugo --source exampleSite --themesDir ../.. --minify
```

The documented preview command assumes the checkout directory is `nightnote`. The tests also work with other checkout names.

Two theme tests passed: Chinese taxonomy links and chronological navigation; standalone example build under `/preview/`, fingerprinted assets, search URLs and project/article relations. The surrounding personal site's three tests also passed. JavaScript syntax and `git diff --check` passed.

## Browser checks

- Desktop light and dark: exploration, project listing and about. Home retains the approved structure and revised spacing.
- 390px viewport: home, exploration, project listing and about; no horizontal overflow on checked pages.
- 768px viewport: home and project cards use two columns without horizontal overflow.
- Project cards in the same row have aligned lower metadata. Coverless projects render without a fabricated cover.
- Mobile menu opens and Escape closes it. Search returns matches and a no-result message. Chinese collection navigation works; image dialog fits its viewport; code copy reports success.

These are local Chromium-based browser checks, not physical iOS/Safari acceptance. No remote deployment or release has been performed.
