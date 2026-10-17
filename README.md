# Cognitive Load Blocker

I got tired of ad blockers that only work off a domain blocklist, so I built this to also catch the sketchier stuff — fake "3 people are viewing this" countdown timers, popups with a close button you can barely tap, videos that just start blasting audio. It's a Chrome extension (Manifest V3) that does normal network-level ad blocking, plus a small DOM scoring system that flags manipulative UI patterns as they get added to the page.

## Setup

```bash
git clone https://github.com/samoff04/cognitive-load-blocker.git
cd cognitive-load-blocker
```

Then open `chrome://extensions`, turn on Developer mode, click Load unpacked and select the folder.

## Tests

```bash
npm install
npm test
```

## Files

```
cognitive-load-blocker/
├── manifest.json
├── background.js
├── content.js
├── lib/heuristics.js
├── rules/ad_rules.json
├── scripts/build-rules.js
├── popup/
├── options/
├── dashboard/
├── icons/
├── tests/
│   ├── heuristics.test.js
│   ├── build-rules.test.js
│   └── manual/test-page.html
├── .github/workflows/test.yml
├── package.json
├── package-lock.json
├── .gitignore
├── README.md
└── LICENSE
```

## License

The code is MIT. The generated rule list is derived from EasyList (CC BY-SA 3.0 / GPLv3).

## Author

Samarth Varshney