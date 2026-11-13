// Module state shared by the page template and the intro. It resets on every full
// page load and becomes true once the app has mounted, so anything that should only
// play on a fresh load (the intro, skipping the curtain) can check it.
export const navState = { mounted: false };
