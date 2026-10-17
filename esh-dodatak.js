// ESH dodatak: učitaj NAKON postojećeg script.js (defer ili na dnu body).
document.addEventListener('DOMContentLoaded', () => {
  const result = document.querySelector('.calculator-result');
  if (!result) return;
  const panel = document.createElement('section');
  panel.className = 'esh-nutrition';
  panel.innerHTML = `
    <h2>Kalorije i makronutrijenti</h2>
    <p class="esh-note">Okvirna dnevna preporuka za odrasle. Vrijednosti nisu medicinski savjet.</p>
    <div class="esh-calories"><strong id="esh-kcal">—</strong><span>kcal / dan</span></div>
    <div class="esh-rings" id="esh-rings"></div>
    <h2>Preporučeni proizvodi za tvoj cilj</h2>
    <p class="esh-note">Suplementi su opcionalni dodatak uravnoteženoj prehrani.</p>
    <div class="esh-products" id="esh-products"></div>`;
  result.appendChild(panel);

  // PRIVREMENI DEMO PROIZVODI. Kasnije zamijeni s API-jem /api/products/recommendations?goal=...
  const demoProducts = [
    {id:1, name:'Whey protein — demo', category:'whey', price:null, image:'/images/whey.jpg', url:'/proizvod/whey'},
    {id:2, name:'Kreatin monohidrat — demo', category:'creatine', price:null, image:'/images/kreatin.jpg', url:'/proizvod/kreatin'},
    {id:3, name:'Mass gainer — demo', category:'gainer', price:null, image:'/images/gainer.jpg', url:'/proizvod/gainer'}
  ];
  const categoriesByGoal = {
    muscle: ['whey', 'creatine', 'gainer'],
    'fat-loss': ['whey', 'creatine'],
    maintenance: ['whey', 'creatine']
  };
  // Zamijeni ovu funkciju kasnije pozivom svog backenda. Očekivani format je niz objekata
  // {id, name, category, price, image, url}. Podatke validiraj i na backendu.
  async function loadRecommendedProducts(goal) {
    return demoProducts.filter(p => categoriesByGoal[goal]?.includes(p.category));
    // Primjer povezivanja (ukloni gornji return):
    // const res = await fetch(`/api/products/recommendations?goal=${encodeURIComponent(goal)}`);
    // if (!res.ok) throw new Error('Proizvodi nisu dostupni');
    // return await res.json();
  }
  const round = n => Math.round(n);
  const factors = {none:1.2, low:1.375, medium:1.55, high:1.725};
  const proteinFactors = {
    muscle: {none:[1.6,1.8],low:[1.6,1.8],medium:[1.8,2.0],high:[1.8,2.2]},
    'fat-loss': {none:[1.6,1.8],low:[1.6,1.8],medium:[1.8,2.2],high:[2.0,2.4]},
    maintenance: {none:[1.4,1.6],low:[1.4,1.6],medium:[1.6,1.8],high:[1.8,2.0]}
  };
  function renderRing(label, grams, kcal, total, color) {
    const percent = Math.round(kcal / total * 100);
    const el = document.createElement('div');
    el.className = 'esh-ring-item';
    const ring = document.createElement('div');
    ring.className = 'esh-ring';
    ring.style.setProperty('--ring-color', color);
    ring.style.setProperty('--ring-percent', `${percent}%`);
    const center = document.createElement('strong');
    center.textContent = `${grams} g`;
    ring.appendChild(center);
    const title = document.createElement('b'); title.textContent = label;
    const detail = document.createElement('span'); detail.textContent = `${percent}% kalorija`;
    el.append(ring, title, detail);
    return el;
  }
  function renderProducts(products) {
    const container = document.getElementById('esh-products');
    container.replaceChildren();
    if (!products.length) { container.textContent = 'Trenutno nema preporučenih proizvoda.'; return; }
    for (const p of products) {
      const card = document.createElement('article'); card.className = 'esh-product';
      const img = document.createElement('img'); img.src = p.image || '/images/placeholder.png'; img.alt = p.name || 'Proizvod'; img.loading = 'lazy';
      img.onerror = () => { img.onerror = null; img.src = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="320" height="220"><rect width="100%" height="100%" fill="#222"/><text x="50%" y="50%" fill="#aaa" font-size="18" text-anchor="middle">ESH proizvod</text></svg>'); };
      const name = document.createElement('h3'); name.textContent = p.name || 'Proizvod';
      const price = document.createElement('p'); price.textContent = p.price == null ? 'Cijena uskoro' : `${Number(p.price).toFixed(2)} KM`;
      const link = document.createElement('a'); link.textContent = 'Pogledaj proizvod'; link.href = p.url || '#';
      card.append(img, name, price, link); container.appendChild(card);
    }
  }
  async function updateNutrition() {
    const gender = document.getElementById('gender')?.value;
    const age = Number(document.getElementById('age')?.value);
    const weight = Number(document.getElementById('weight')?.value);
    const height = Number(document.getElementById('height')?.value);
    const goal = document.querySelector('input[name="goal"]:checked')?.value;
    const activity = document.querySelector('input[name="activity"]:checked')?.value;
    if (!age || !weight || !height || !factors[activity] || !proteinFactors[goal]) return;
    // Mifflin-St Jeor, odrasli: rezultat je samo orijentacijska procjena.
    if (age < 18) {
      document.getElementById('esh-kcal').textContent = '—';
      document.getElementById('esh-rings').textContent = 'Procjena kalorija i makronutrijenata ovdje je namijenjena odraslima (18+).';
      document.getElementById('esh-products').replaceChildren();
      return;
    }
    const offset = gender === 'male' ? 5 : gender === 'female' ? -161 : null;
    if (offset === null) return;
    const bmr = 10 * weight + 6.25 * height - 5 * age + offset;
    const maintenance = bmr * factors[activity];
    const target = Math.round((maintenance + (goal === 'muscle' ? 250 : goal === 'fat-loss' ? -350 : 0)) / 10) * 10;
    const range = proteinFactors[goal][activity];
    const protein = round(weight * (range[0] + range[1]) / 2);
    const fat = round(Math.max(0.7 * weight, target * 0.25 / 9));
    const carbs = Math.max(0, round((target - protein * 4 - fat * 9) / 4));
    const totalMacroKcal = protein * 4 + fat * 9 + carbs * 4;
    document.getElementById('esh-kcal').textContent = target.toLocaleString('hr-HR');
    const rings = document.getElementById('esh-rings');
    rings.replaceChildren(
      renderRing('Proteini',protein,protein*4,totalMacroKcal,'#ff6a00'),
      renderRing('Ugljikohidrati',carbs,carbs*4,totalMacroKcal,'#459dff'),
      renderRing('Masti',fat,fat*9,totalMacroKcal,'#35bba0')
    );
    try { renderProducts(await loadRecommendedProducts(goal)); }
    catch { document.getElementById('esh-products').textContent = 'Proizvodi se trenutno ne mogu učitati.'; }
  }
  // Postojeći script.js računa i otvara rezultat na klik. Ovaj listener ga nadopunjuje.
  document.getElementById('calculate')?.addEventListener('click', () => {
    if (!document.querySelector('input[name="activity"]:checked')) return;
    updateNutrition();
  });
});
