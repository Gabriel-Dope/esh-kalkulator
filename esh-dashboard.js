// ESH rezultat: učitati NAKON script.js. Zamjenjuje stari esh-dodatak.js.
document.addEventListener('DOMContentLoaded', () => {
  const result = document.querySelector('.calculator-result');
  if (!result) return;
  result.classList.add('esh-unified-mode');
  const dashboard = document.createElement('section');
  dashboard.className = 'esh-dashboard';
  dashboard.innerHTML = `
    <div class="esh-head"><span class="esh-eyebrow">ESH • PERSONALIZIRANA PREPORUKA</span><h2>Tvoj plan prehrane</h2><p id="esh-goal-label">Rezultat kalkulatora</p></div>
    <div class="esh-top-grid">
      <div class="esh-kcal-panel"><span class="esh-eyebrow">DNEVNI KALORIJSKI CILJ</span><div class="esh-kcal-number"><strong id="esh-daily-calories">—</strong><span>kcal / dan</span></div><p>Okvirna procjena na temelju tvojih podataka.</p></div>
      <div class="esh-track-panel"><label for="esh-consumed">Koliko si kalorija danas unio?</label><div class="esh-input-row"><input type="number" id="esh-consumed" min="0" step="1" value="0" inputmode="numeric"><span>kcal</span></div><div class="esh-track-labels"><span>Napredak</span><strong id="esh-progress-percent">0%</strong></div><div class="esh-track" role="progressbar" aria-label="Unesene kalorije" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" id="esh-progress"><div id="esh-progress-fill"></div></div><p class="esh-remaining">Preostalo: <strong id="esh-remaining">—</strong> kcal</p></div>
    </div>
    <div class="esh-section-title"><div><span class="esh-eyebrow">MAKRONUTRIJENTI</span><h3>Tvoja dnevna raspodjela</h3></div><p>Udio ukupnih kalorija po makronutrijentu</p></div>
    <div class="esh-macros" id="esh-macros"></div>
    <div class="esh-section-title"><div><span class="esh-eyebrow">ESH PREPORUČUJE</span><h3>Proizvodi za tvoj cilj</h3></div><p>Dodaci prehrani su opcionalni.</p></div>
    <div class="esh-products-grid" id="esh-products-grid"></div>
    <p class="esh-disclaimer">Procjene su informativne i namijenjene odraslima (18+). Napredak prikazuje samo kalorije koje ovdje ručno uneseš; unos se ne sprema.</p>`;
  result.appendChild(dashboard);

  // DEMO PODACI: zamijeni odgovorom svog API-ja kada povežeš MySQL bazu.
  const demoProducts = [
    { id: 1, name: 'Whey protein', category: 'whey', price: null, image: '/images/whey.jpg', url: '/proizvod/whey' },
    { id: 2, name: 'Kreatin monohidrat', category: 'creatine', price: null, image: '/images/kreatin.jpg', url: '/proizvod/kreatin' },
    { id: 3, name: 'Mass gainer', category: 'gainer', price: null, image: '/images/gainer.jpg', url: '/proizvod/gainer' }
  ];
  const categoriesByGoal = { muscle: ['whey', 'creatine', 'gainer'], 'fat-loss': ['whey', 'creatine'], maintenance: ['whey', 'creatine'] };
  async function loadRecommendedProducts(goal) {
    return demoProducts.filter(p => (categoriesByGoal[goal] || []).includes(p.category));
    // KASNIJE: ukloni return iznad i koristi svoj endpoint:
    // const response = await fetch('/api/products/recommendations?goal=' + encodeURIComponent(goal));
    // if (!response.ok) throw new Error('Greška pri učitavanju proizvoda');
    // return await response.json();
  }
  const byId = id => document.getElementById(id);
  const goalNames = { muscle: 'Izgradnja mišića', 'fat-loss': 'Mršavljenje', maintenance: 'Održavanje težine' };
  const placeholder = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="360" height="240"><rect width="100%" height="100%" fill="#242424"/><text x="50%" y="50%" text-anchor="middle" fill="#bbb" font-size="20">ESH proizvod</text></svg>');
  let target = 0;
  let renderVersion = 0;

  function updateProgress() {
    const raw = Number(byId('esh-consumed').value);
    const consumed = Number.isFinite(raw) ? Math.max(0, raw) : 0;
    const percent = target > 0 ? Math.min(100, consumed / target * 100) : 0;
    byId('esh-progress-fill').style.width = percent + '%';
    byId('esh-progress-percent').textContent = Math.round(percent) + '%';
    byId('esh-remaining').textContent = Math.max(0, Math.round(target - consumed)).toLocaleString('hr-HR');
    byId('esh-progress').setAttribute('aria-valuenow', String(Math.round(percent)));
  }
  byId('esh-consumed').addEventListener('input', updateProgress);

  function renderMacros(data) {
    const items = [
      { title: 'Proteini', grams: data.protein, kcalPerGram: 4, color: '#ff7900' },
      { title: 'Ugljikohidrati', grams: data.carbs, kcalPerGram: 4, color: '#4d9eff' },
      { title: 'Masti', grams: data.fats, kcalPerGram: 9, color: '#36bda3' }
    ];
    const totalMacroCalories = items.reduce((sum, x) => sum + x.grams * x.kcalPerGram, 0);
    const container = byId('esh-macros');
    container.replaceChildren();
    for (const item of items) {
      const percent = totalMacroCalories > 0 ? Math.round(item.grams * item.kcalPerGram / totalMacroCalories * 100) : 0;
      const card = document.createElement('article');
      card.className = 'esh-macro-card';
      const ring = document.createElement('div');
      ring.className = 'esh-macro-ring';
      ring.style.setProperty('--ring-color', item.color);
      ring.style.setProperty('--ring-value', Math.max(0, Math.min(100, percent)) + '%');
      const number = document.createElement('strong');
      number.textContent = Math.round(item.grams) + ' g';
      ring.append(number);
      const title = document.createElement('h4'); title.textContent = item.title;
      const subtitle = document.createElement('p'); subtitle.textContent = percent + '% kalorija';
      card.append(ring, title, subtitle);
      container.append(card);
    }
  }
  function renderProducts(products) {
    const container = byId('esh-products-grid');
    container.replaceChildren();
    if (!Array.isArray(products) || !products.length) {
      container.textContent = 'Trenutačno nema preporučenih proizvoda.';
      return;
    }
    for (const product of products) {
      const card = document.createElement('article'); card.className = 'esh-product-card';
      const img = document.createElement('img'); img.src = product.image || placeholder; img.alt = product.name || 'ESH proizvod'; img.loading = 'lazy';
      img.onerror = () => { img.onerror = null; img.src = placeholder; };
      const content = document.createElement('div'); content.className = 'esh-product-content';
      const title = document.createElement('h4'); title.textContent = product.name || 'Proizvod';
      const price = document.createElement('p'); price.className = 'esh-product-price';
      price.textContent = product.price == null ? 'Cijena uskoro' : Number(product.price).toFixed(2) + ' KM';
      const link = document.createElement('a'); link.href = product.url || '#'; link.textContent = 'Pogledaj proizvod →';
      content.append(title, price, link); card.append(img, content); container.append(card);
    }
  }
  document.addEventListener('esh:calculated', async event => {
    const data = event.detail;
    if (!data || !Number.isFinite(data.calories)) return;
    const age = Number(byId('age')?.value);
    if (age < 18) {
      target = 0;
      byId('esh-daily-calories').textContent = '—';
      byId('esh-macros').textContent = 'Kalorijske procjene dostupne su samo za odrasle (18+).';
      byId('esh-products-grid').replaceChildren();
      updateProgress();
      return;
    }
    target = Math.max(0, data.calories);
    byId('esh-daily-calories').textContent = target.toLocaleString('hr-HR');
    byId('esh-goal-label').textContent = goalNames[data.goal] || 'Tvoj cilj';
    byId('esh-consumed').value = '0';
    updateProgress();
    renderMacros(data);
    const version = ++renderVersion;
    byId('esh-products-grid').textContent = 'Učitavanje proizvoda…';
    try {
      const products = await loadRecommendedProducts(data.goal);
      if (version === renderVersion) renderProducts(products);
    } catch (error) {
      if (version === renderVersion) byId('esh-products-grid').textContent = 'Proizvode trenutno nije moguće učitati.';
      console.error('ESH proizvodi:', error);
    }
  });
});
