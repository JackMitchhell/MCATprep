/* srs.js — SuperMemo-2 spaced repetition scheduler.
   Grades: 0 = Again, 3 = Hard, 4 = Good, 5 = Easy. */
(function () {
  function allCards() {
    const custom = Store.get().customCards || [];
    return window.FlashcardSeed.concat(custom);
  }

  function meta(cardId) {
    const srs = Store.get().srs;
    if (!srs[cardId]) {
      srs[cardId] = { ease: 2.5, interval: 0, reps: 0, due: Store.todayISO(), lastReviewed: null, lapses: 0 };
    }
    return srs[cardId];
  }

  // Cards due today or earlier, plus brand-new cards.
  function dueCards(limitNew) {
    const today = Store.todayISO();
    const srs = Store.get().srs;
    const due = [];
    const fresh = [];
    allCards().forEach((c) => {
      const m = srs[c.id];
      if (!m) { fresh.push(c); return; }
      if (m.due <= today) due.push(c);
    });
    const newLimit = (limitNew == null) ? 20 : limitNew;
    return due.concat(fresh.slice(0, newLimit));
  }

  function review(cardId, grade) {
    const m = meta(cardId);
    if (grade < 3) {
      // lapse — reset interval, see again soon
      m.reps = 0;
      m.interval = 1;
      m.lapses += 1;
    } else {
      m.reps += 1;
      if (m.reps === 1) m.interval = 1;
      else if (m.reps === 2) m.interval = 6;
      else m.interval = Math.round(m.interval * m.ease);
      // update ease factor
      m.ease = Math.max(1.3, m.ease + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02)));
    }
    m.lastReviewed = Store.todayISO();
    m.due = Store.isoOffset(new Date(), m.interval);
    Store.save();
    return m;
  }

  function stats() {
    const srs = Store.get().srs;
    const cards = allCards();
    const today = Store.todayISO();
    let learned = 0, dueNow = 0, mature = 0;
    cards.forEach((c) => {
      const m = srs[c.id];
      if (m) {
        learned++;
        if (m.due <= today) dueNow++;
        if (m.interval >= 21) mature++;
      }
    });
    const newCount = cards.length - learned;
    // also count fresh as due-able
    return { total: cards.length, learned, dueNow: dueNow + Math.min(newCount, 20), mature, newCount };
  }

  function addCard(card) {
    Store.update((s) => {
      const id = "u-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6);
      s.customCards.push(Object.assign({ id }, card));
    });
  }

  function deleteCard(id) {
    Store.update((s) => {
      s.customCards = s.customCards.filter((c) => c.id !== id);
      delete s.srs[id];
    });
  }

  window.SRS = { allCards, dueCards, review, stats, addCard, deleteCard, meta };
})();
