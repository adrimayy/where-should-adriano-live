'use strict';
/* ---------------- your results: the header above the map and ranking ---------------- */
function renderResults() {
  if (MODE !== 'yours') {
    $('resPanel').hidden = true;
    return;
  }
  // the plain view is a header for the map and ranking below; the two short lists come with the calculations
  $('resHead').textContent = L(document.body.classList.contains('adv') ? 'resTitle' : 'resEyebrow');
  const top = t =>
    ents
      .filter(e => e.type === t && listable(e) && (t !== 'city' || inScope(e)))
      .sort(byRank)
      .slice(0, 5);
  const li = e =>
    `<li><button class="ghost" data-key="${e.key}" style="min-height:0;padding:0;font-size:inherit">${dn(e)}</button><span class="s">${r5(e.score)}</span></li>`;
  $('resLists').innerHTML = [
    ['city', 'yourTop'],
    ['country', 'yourTopC'],
  ]
    .map(
      ([t, k]) => `<div class="col"><span class="lab">${L(k)}</span><ol>${top(t).map(li).join('')}</ol></div>`
    )
    .join('');
  $('resLists')
    .querySelectorAll('button[data-key]')
    .forEach(
      b =>
        (b.onclick = () => {
          select(byKey[b.dataset.key], true);
          $('mapSec').scrollIntoView({ block: 'start' });
        })
    );
}
