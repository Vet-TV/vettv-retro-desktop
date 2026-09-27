import { svelte } from '@sveltejs/vite-plugin-svelte'
import { defineConfig } from 'vite'

/**
 * GitHub Pages hosting (MVP).
 *
 * Default `base` is `./` (relative) so assets resolve from any Pages path
 * (user/org site root or project site). If you prefer an absolute project
 * path, set VITE_BASE when building, e.g.:
 *
 *   VITE_BASE=/vettv-retro-desktop/ npm run build
 *
 * Match VITE_BASE to the GitHub repo name when using a project Pages site
 * (https://<user>.github.io/<repo>/). Custom VetTV domain is post-MVP.
 */
export default defineConfig({
  plugins: [svelte()],
  base: process.env.VITE_BASE || './',
})
