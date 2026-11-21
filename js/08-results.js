'use strict';
/* ---------------- your results: the title above the list, and what comes after the answer ---------------- */
function renderResults() {
  if (MODE !== 'yours') {
    $('resPanel').hidden = true;
    return;
  }
  $('resHead').textContent = L('resTitle');
  // after the answer: how many answers it rests on, and the two ways to make it more precise
  const n = QUIZ.filter(answered).length,
    m = moreLeft().length;
  $('sharpen').hidden = !n;
  $('sharpenNote').textContent = fmt(L('madeFrom'), { n });
  $('fullQuiz').textContent = fmt(L('doneMore'), { m });
  $('fullQuiz').hidden = !m;
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
    .forEach(b => (b.onclick = () => openPlace(byKey[b.dataset.key])));
}
