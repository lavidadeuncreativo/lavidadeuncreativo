// Año en footer
document.getElementById('year').textContent = new Date().getFullYear();

// Cargar posts desde /posts/posts.json y mostrarlos en tarjetas
async function loadPosts() {
  const grid = document.getElementById('posts-grid');
  if (!grid) return;
  try {
    const res = await fetch('./posts/posts.json');
    const posts = await res.json();
    grid.innerHTML = posts.slice(0, 6).map(p => `
      <article class="border rounded-2xl overflow-hidden hover:shadow-sm transition">
        <a href="./blog.html?slug=${encodeURIComponent(p.slug)}" class="block">
          ${p.cover ? `<img src="${p.cover}" alt="${p.title}" class="aspect-video object-cover">` : ''}
          <div class="p-4">
            <h3 class="font-semibold">${p.title}</h3>
            <p class="text-sm text-zinc-600 mt-1">${p.excerpt ?? ''}</p>
            <p class="text-xs text-zinc-400 mt-2">${p.date}</p>
          </div>
        </a>
      </article>
    `).join('');
  } catch (e) {
    console.error(e);
    grid.innerHTML = `<p>No se pudieron cargar los artículos.</p>`;
  }
}
loadPosts();
