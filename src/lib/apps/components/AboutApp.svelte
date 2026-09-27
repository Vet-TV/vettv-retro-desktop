<script lang="ts">
  const YEAR = 2026
</script>

<div class="about">
  <div class="about-hero">
    <div class="about-logo" aria-hidden="true">V</div>
    <div>
      <h2>VetTV Retro Desktop</h2>
      <p class="tagline">Vet2000 skin · Milestone 3</p>
    </div>
  </div>

  <p>
    A browser nostalgia toy — a fake OS shell you run in a tab. Drag windows, browse a
    local virtual filesystem, jot notes, crunch numbers. Built for
    <strong>VetTV / Retro TV Archive</strong> with original Vet2000 chrome.
  </p>

  <ul>
    <li>Window manager, taskbar &amp; Start menu</li>
    <li>IndexedDB VFS (C:/ · D:/) · Files · Notepad · Image Viewer</li>
    <li>Working Calculator · session restore on reload</li>
  </ul>

  <div class="legal v2k-sunken-thin">
    <strong>Not affiliated with Microsoft.</strong>
    VetTV Retro Desktop is an independent fan/nostalgia project. It is
    <em>not</em> Windows, does not use Microsoft logos, Bliss wallpaper, or official Luna
    assets, and does not claim any Windows trademark as affiliation or endorsement.
    Window titles and chrome say <strong>VetTV Retro Desktop</strong> or
    <strong>Vet2000</strong> only.
  </div>

  <p class="muted">
    Does not run <code>.exe</code> or other Win32 binaries. For native BYO-ISO emulation,
    see sibling product <strong>VetTV Vintage PC</strong>.
  </p>

  <p class="footer muted">© {YEAR} VetTV / VetTV Studios · Original VetTV chrome</p>
</div>

<style>
  .about {
    display: flex;
    flex-direction: column;
    gap: 0;
    line-height: 1.4;
  }
  .about-hero {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
  }
  .about-logo {
    width: 40px;
    height: 40px;
    flex-shrink: 0;
    background: linear-gradient(135deg, #0a246a, #3a6ea5);
    border: 2px solid;
    border-color: #fff #404040 #404040 #fff;
    color: #fff;
    font-weight: bold;
    font-size: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .about h2 {
    margin: 0 0 2px;
    font-size: 14px;
  }
  .tagline {
    margin: 0;
    color: #555;
    font-size: 11px;
  }
  .about p {
    margin: 0 0 8px;
  }
  .about ul {
    margin: 0 0 10px;
    padding-left: 18px;
  }
  .about li {
    margin-bottom: 2px;
  }
  .legal {
    padding: 8px;
    margin: 0 0 10px;
    background: #ece9d8;
    font-size: 11px;
  }
  .legal strong {
    display: inline;
  }
  .muted {
    color: #555;
  }
  .about code {
    font-family: 'Courier New', monospace;
    font-size: 11px;
  }
  .footer {
    margin: 4px 0 0;
    font-size: 10px;
  }
</style>
