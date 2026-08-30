# Cognitive Load Blocker

I got tired of ad blockers that only work off a domain blocklist, so I built this to also catch the sketchier stuff — fake "3 people are viewing this" countdown timers, popups with a close button you can barely tap, videos that just start blasting audio. It's a Chrome extension (Manifest V3) that does normal network-level ad blocking, plus a small DOM scoring system that flags manipulative UI patterns as they get added to the page.

## How it actually works

Two layers:

1. Network blocking through `declarativeNetRequest` — a static list of known ad/tracker domains (see `rules/ad_rules.json`). Nothing fancy here, this part is standard.
2. A `MutationObserver` in `content.js` watches the page as it grows and runs every new element through `lib/heuristics.js`, which scores it based on stuff like: is it a fixed-position overlay covering a big chunk of the screen, does it have a hidden/tiny close button, does the text match urgency language ("hurry", "ends in", "only X left"), is it a video with autoplay + sound on. Cross a score threshold and it gets hidden.

Every block (network or heuristic) gets logged with a reason, so you can actually open the dashboard and see *why* something got blocked instead of just trusting it.

## Setup

```bash
git clone https://github.com/samoff04/cognitive-load-blocker.git
cd cognitive-load-blocker
```

Then:
- go to `chrome://extensions`
- turn on Developer mode (top right)
- Load unpacked → pick the folder

That's it, no build step.

## Files

```
cognitive-load-blocker/
├── manifest.json
├── background.js       
├── content.js           
├── lib/heuristics.js    
├── rules/ad_rules.json  
├── popup/
├── dashboard/
├── .gitignore
├── README.md                
└── LICENSE/            
```

## Stuff that's not done yet

- The domain list is small (~10 entries) just to prove the concept works — it's not trying to compete with EasyList
- Threshold for the heuristic scoring is a guess right now, I haven't tuned it against a bunch of real sites yet so expect some false positives on weird layouts
- No way to whitelist a site yet if it misbehaves — on the to-do list
- No options page, thresholds are hardcoded in `heuristics.js` for now

## License

This project is licensed under the MIT License.

## Author

Samarth Varshney