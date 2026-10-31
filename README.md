# Project Hestia

A self-contained OG Fortnite landing page with a winter night art direction. Built specifically for Hestia using its existing artwork and screenshots, Neo-inspired typography and scroll choreography, and Echo-inspired Fortnite button details. The original Neo and Echo projects are untouched.

## Preview

Open `index.html` in a modern browser. There is no build step, package installation, CDN, or external font dependency. The same directory can be served by any static web server.

## Connect the release

The download buttons link directly to https://hestiafn.dev/launcher. The social buttons open the community destinations in `config.js` in new tabs.

```js
window.HESTIA_CONFIG = Object.freeze({
  discordUrl: "http://discord.gg/hestiamp", // Official Hestia community invite
  youtubeUrl: "https://www.youtube.com/@PrivateUserDev", // Official Hestia YouTube channel
  tiktokUrl: "https://www.tiktok.com/@rewindmp"   // Official Hestia TikTok profile
});
```

## Included

- Staggered first-load typography and a cinematic background entrance.
- Canvas snowfall that pauses when the hero leaves the viewport or the tab is hidden, and respects reduced motion preferences.
- Scroll-linked hero parallax, a pinned expanding lobby image, reading progress, and section reveals.
- Pointer-responsive launcher perspective, original Hestia screenshots, and an island map feature. Images stay inline without zoom dialogs; the statistics card follows the source image's portrait proportions.
- Four local player arrows on the island map stay in fixed positions and make subtle, staggered changes in viewing direction. Map hover scales the artwork and its markers together; reduced motion disables the arrow animation.
- Subtle oversized snowflake decorations across the launcher, archive, and FAQ chapters, positioned to stay fully inside their sections as they drift and rotate.
- Neo-inspired three-column footer with Hestia branding, navigation, community links, and unboxed YouTube, TikTok, and Discord icons on the existing winter background.
- Upright sans-serif display headings with ice-blue accents, and a shared hover shine and lift on both download buttons.
- Larger supporting copy, a simplified hero, and a continuous animated winter backdrop with softly blurred artwork and drifting light.
- Neo-inspired glass surfaces, pointer-following highlights, animated edge paths, and smooth individual FAQ accordions without section dividers or heavy shadows.
- Mobile navigation, native FAQ accordions, keyboard controls, visible focus states, a skip link, and reduced motion support.
- All fonts and images served locally. Inter comes from Neo's existing assets, and Burbank comes from Echo's existing assets.

## Files

`index.html` — content and metadata  
`site.css` — responsive layout, typography, and motion  
`atmosphere.css` — continuous winter background and Neo-inspired glass interactions  
`site.js` — navigation, snowfall, scroll behavior, and social link handling  
`config.js` — official social destinations  
`assets/` — existing Hestia artwork plus local fonts

All links are connected.
