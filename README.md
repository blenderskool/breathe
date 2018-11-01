<p align="center">
  <img src="https://github.com/blenderskool/breathe/raw/gh-pages/resources/images/Breathe%20Logo%20With%20Text.png" alt="Breathe app">
</p>

Breathe is a **progressive web app(PWA)** that provides you with air quality data for many places in an easy to understand interface.

The main goals of creating Breathe were:
- Creating an **interface** that presents Air quality data in a beautiful manner.
- Making it into a **PWA** that works very well when offline.

Technologies used:
- Bulma CSS for responsive flex layout structure.
- JSTS Library for extensive Boolean operations.
- Service Workers for PWA.
- Local Forage for using IndexedDB in an easier way.
- Axios for API calls.
- Google Maps Places, Geometry API.
- AQICN API for Air quality data.


Site is live at: https://breathe.netlify.com

## Development
Breathe works with latest LTS version of Node.js for development. The build process is written on Gulp. Babel is used to use ES6 features, along with SASS pre-processor for CSS.

```bash
git clone https://github.com/blenderskool/breathe.git
cd breathe
npm install
npm run dev
```