# Cognitive Load Blocker

I got tired of ad blockers that only work off a domain blocklist, so I built this to also catch the sketchier stuff — fake "3 people are viewing this" countdown timers, popups with a close button you can barely tap, videos that just start blasting audio. It's a Chrome extension (Manifest V3) that does normal network-level ad blocking, plus a small DOM scoring system that flags manipulative UI patterns as they get added to the page.

## Setup

```bash
git clone https://github.com/samoff04/cognitive-load-blocker.git
cd cognitive-load-blocker
```

```bash
npm install
npm test
```

## Files

## Files

```
cognitive-load-blocker/
├── manifest.json
├── background.js
├── content.js
├── lib/heuristics.js
├── rules/ad_rules.json
├── popup/
├── options/
├── dashboard/
├── icons/
├── tests/
├── .github/workflows/test.yml
├── package.json
├── package-lock.json
├── .gitignore
├── README.md
└── LICENSE
```

## Stuff that's not done yet

- The domain list is small (~10 entries) just to prove the concept works — it's not trying to compete with EasyList
- The default threshold is still a guess, I haven't tuned it against a bunch of real sites yet so expect some false positives on weird layouts
- Stats are stored forever in `chrome.storage.local`, there's no clear/reset button yet
- Tests only cover the scoring logic, not the content script or the popup

## License

This project is licensed under the MIT License.

## Author

Samarth Varshney