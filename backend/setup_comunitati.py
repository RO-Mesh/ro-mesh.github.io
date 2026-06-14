import re

path = '/home/stefan/Documents/Projects/RO-MESH/frontend/public/comunitati.html'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Update title
content = re.sub(r'<title>.*?</title>', '<title>Comunități Locale - RO-MESH</title>', content)

# Remove script related to dictionary index
content = re.sub(r'<script src="/js/dictionary.js"></script>', '', content)
content = re.sub(r'<script src="/js/search.js"></script>', '', content)

main_content = """<main class="pt-nav">
    <section class="container py-12">
      <h1 class="section-title">Comunități Locale</h1>
      <p class="section-lead">Aici găsești grupurile și rețelele locale din România, organizate pe protocoale.</p>

      <div class="table-responsive" style="margin-top: 3rem;">
        <h2 id="meshcore" style="color: var(--color-accent); margin-bottom: 1rem;">Meshcore</h2>
        <table class="dictionary-table" style="margin-bottom: 3rem;">
          <thead>
            <tr>
              <th style="width: 25%;">Nume Comunitate</th>
              <th>Descriere</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><a href="https://brasovmesh.com" target="_blank" rel="noopener noreferrer" style="color: var(--color-text-primary); font-weight: 600; text-decoration: none;">Brașov Mesh <svg style="display:inline; vertical-align:text-bottom; margin-left:4px; opacity:0.7;" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg></a></td>
              <td>Rețea urbană și comunitate activă în zona Brașovului.</td>
            </tr>
            <tr>
              <td><a href="https://meshcore-iasi.ro" target="_blank" rel="noopener noreferrer" style="color: var(--color-text-primary); font-weight: 600; text-decoration: none;">Meshcore Iași <svg style="display:inline; vertical-align:text-bottom; margin-left:4px; opacity:0.7;" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg></a></td>
              <td>Infrastructură fixă și repetoare în zona Iași.</td>
            </tr>
          </tbody>
        </table>

        <h2 id="meshtastic" style="color: var(--color-accent); margin-bottom: 1rem;">Meshtastic</h2>
        <table class="dictionary-table" style="margin-bottom: 3rem;">
          <thead>
            <tr>
              <th style="width: 25%;">Nume Comunitate</th>
              <th>Descriere</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><a href="https://meshtasticyo.ro" target="_blank" rel="noopener noreferrer" style="color: var(--color-text-primary); font-weight: 600; text-decoration: none;">Meshtastic YO <svg style="display:inline; vertical-align:text-bottom; margin-left:4px; opacity:0.7;" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg></a></td>
              <td>Cea mai mare comunitate de radioamatori și pasionați de rețele ad-hoc Meshtastic din România.</td>
            </tr>
          </tbody>
        </table>

        <h2 id="reticulum" style="color: var(--color-accent); margin-bottom: 1rem;">Reticulum</h2>
        <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--color-border); padding: 2rem; border-radius: 8px; text-align: center; color: var(--color-text-secondary);">
          Momentan nu există un grup dedicat mapat pentru Reticulum în România. Fii tu primul care inițiază unul!
        </div>
      </div>
    </section>
  </main>"""

content = re.sub(r'<main class="pt-nav">.*?</main>', main_content, content, flags=re.DOTALL)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated comunitati.html")
