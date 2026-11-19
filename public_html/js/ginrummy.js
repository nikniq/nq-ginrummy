/* NQ Gin Rummy — single-player gin rummy against a computer opponent.
 * Rules: 10 cards each; draw from stock or discard pile, then discard.
 * Knock with 10 or less deadwood; gin (0 deadwood) scores a 25 bonus and the
 * opponent cannot lay off. Undercut (defender ≤ knocker) scores 25 + difference.
 * First to 100 wins; game bonus 100 plus 25 per hand won. */
(() => {
    'use strict';
    const SUITS = ['♠', '♥', '♦', '♣'];
    const RANKS = ['', 'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    const TARGET = 100;
    const val = c => Math.min(c.r, 10);
    const sum = cs => cs.reduce((t, c) => t + val(c), 0);
    const byRank = (a, b) => a.r - b.r || a.s - b.s;
    const bySuit = (a, b) => a.s - b.s || a.r - b.r;
    const sleep = ms => new Promise(r => setTimeout(r, ms));
    const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
    const root = document.getElementById('gin');
    if (!root) return;

    // ---------- melds ----------
    function candidates(cards) {
        const out = [];
        for (let r = 1; r <= 13; r++) {
            const ix = cards.map((c, i) => c.r === r ? i : -1).filter(i => i >= 0);
            if (ix.length >= 3) {
                out.push(ix);
                if (ix.length === 4) for (let k = 0; k < 4; k++) out.push(ix.filter((_, j) => j !== k));
            }
        }
        for (let s = 0; s < 4; s++) {
            const ix = cards.map((c, i) => c.s === s ? i : -1).filter(i => i >= 0).sort((a, b) => cards[a].r - cards[b].r);
            for (let a = 0; a < ix.length; a++) {
                let b = a;
                while (b + 1 < ix.length && cards[ix[b + 1]].r === cards[ix[b]].r + 1) {
                    b++;
                    if (b - a >= 2) out.push(ix.slice(a, b + 1));
                }
            }
        }
        return out.map(ix => ({ ix, mask: ix.reduce((m, i) => m | (1 << i), 0), v: ix.reduce((t, i) => t + val(cards[i]), 0) }));
    }

    function analyze(cards) {
        const cand = candidates(cards);
        const total = sum(cards);
        let best = { melds: [], dw: total, mask: 0 };
        const stack = [];
        (function dfs(start, used, meldVal) {
            const dw = total - meldVal;
            if (dw < best.dw) best = { melds: stack.slice(), dw, mask: used };
            for (let j = start; j < cand.length; j++) {
                if (cand[j].mask & used) continue;
                stack.push(cand[j].ix);
                dfs(j + 1, used | cand[j].mask, meldVal + cand[j].v);
                stack.pop();
            }
        })(0, 0, 0);
        return {
            melds: best.melds.map(ix => ix.map(i => cards[i]).sort(byRank)),
            deadwood: cards.filter((_, i) => !((best.mask >> i) & 1)).sort(byRank),
            dw: best.dw,
        };
    }

    function bestDiscard(hand, forbidId) {
        let best = null;
        for (const c of hand) {
            if (c.id === forbidId) continue;
            const a = analyze(hand.filter(x => x !== c));
            const score = a.dw * 100 - val(c);
            if (!best || score < best.score) best = { card: c, a, score };
        }
        return best;
    }

    const isSet = m => m.every(c => c.r === m[0].r);
    function layOff(melds, dead) {
        melds = melds.map(m => m.slice());
        dead = dead.slice();
        const laid = [];
        let changed = true;
        while (changed) {
            changed = false;
            for (const c of dead.slice()) {
                for (const m of melds) {
                    const fits = isSet(m)
                        ? c.r === m[0].r && m.length < 4
                        : c.s === m[0].s && (c.r === m[0].r - 1 || c.r === m[m.length - 1].r + 1);
                    if (fits) {
                        m.push(c); m.sort(byRank); laid.push(c);
                        dead.splice(dead.indexOf(c), 1); changed = true; break;
                    }
                }
            }
        }
        return { melds, dead, laid };
    }

    // ---------- state ----------
    const S = {
        scores: { p: 0, o: 0 }, wins: { p: 0, o: 0 }, dealer: 'o',
        stock: [], discard: [], hand: { p: [], o: [] },
        turn: 'p', phase: 'draw', selected: null, takenId: null,
        lastId: null, dealing: false, arrange: 'melds', busy: false, hint: null,
    };
    let stats = { won: 0, lost: 0 };
    try { stats = JSON.parse(localStorage.getItem('gin.stats')) || stats; } catch (e) { /* storage unavailable */ }
    const saveStats = () => { try { localStorage.setItem('gin.stats', JSON.stringify(stats)); } catch (e) { /* ignore */ } };

    function deal() {
        const d = [];
        for (let s = 0; s < 4; s++) for (let r = 1; r <= 13; r++) d.push({ r, s, id: r + '-' + s });
        for (let i = d.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [d[i], d[j]] = [d[j], d[i]]; }
        S.hand.p = d.splice(0, 10);
        S.hand.o = d.splice(0, 10);
        S.discard = [d.pop()];
        S.stock = d;
        S.turn = S.dealer === 'o' ? 'p' : 'o';
        S.phase = 'draw'; S.selected = null; S.takenId = null; S.lastId = null; S.hint = null;
        S.dealing = true;
        render();
        setTimeout(() => { S.dealing = false; }, 1400);
        if (S.turn === 'o') aiTurn(); else msg('Your turn — draw from the stock or take the up-card.');
    }

    // ---------- rendering ----------
    root.innerHTML = `
      <div class="scorebar">
        <div class="seat you"><span class="who">You</span><span class="pts" data-s="p">0</span></div>
        <div class="race"><div class="bar"><i data-b="p"></i></div><span>to ${TARGET}</span><div class="bar"><i data-b="o"></i></div></div>
        <div class="seat cpu"><span class="pts" data-s="o">0</span><span class="who">Computer</span></div>
      </div>
      <div class="felt">
        <div class="row opp"><div class="hand backs" data-h="o"></div></div>
        <div class="row center">
          <div class="pile stock" data-pile="stock" title="Draw from stock"></div>
          <div class="pile discard" data-pile="discard" title="Take the up-card"></div>
          <div class="msg" aria-live="polite"></div>
        </div>
        <div class="row you"><div class="hand" data-h="p"></div></div>
        <div class="controls">
          <span class="dw"></span>
          <button class="gbtn" data-act="discard" disabled>Discard</button>
          <button class="gbtn gold" data-act="knock" disabled>Knock</button>
          <button class="gbtn ghosty" data-act="hint">Hint</button>
          <button class="gbtn ghosty" data-act="arrange">Sort: melds</button>
        </div>
        <div class="overlay" hidden></div>
      </div>
      <p class="small center-text">Record: <b data-st="won">0</b> won · <b data-st="lost">0</b> lost.
         Click a pile to draw; click a card to select it, click again (or press Discard) to throw it.</p>`;

    const q = s => root.querySelector(s);
    const msg = t => { q('.msg').textContent = t; };

    function cardEl(c, opts = {}) {
        const red = c.s === 1 || c.s === 2;
        const face = c.r > 10;
        const e = el('div', 'card ' + (red ? 'red' : 'black') + (face ? ' face' : ''));
        e.dataset.id = c.id;
        const idx = `<span class="rk">${RANKS[c.r]}</span><span class="st">${SUITS[c.s]}</span>`;
        let center;
        if (face) center = `<div class="court"><span>${RANKS[c.r]}</span><em>${SUITS[c.s]}</em></div>`;
        else if (c.r === 1) center = `<div class="ace">${SUITS[c.s]}</div>`;
        else center = `<div class="pips p${c.r}">${Array(c.r).fill(`<i>${SUITS[c.s]}</i>`).join('')}</div>`;
        e.innerHTML = `<div class="corner tl">${idx}</div>${center}<div class="corner br">${idx}</div>`;
        if (opts.cls) e.classList.add(...opts.cls.split(' '));
        return e;
    }
    const backEl = () => el('div', 'card back');

    function arranged() {
        const h = S.hand.p;
        if (S.arrange === 'rank') return [{ cards: h.slice().sort(byRank) }];
        if (S.arrange === 'suit') return [{ cards: h.slice().sort(bySuit) }];
        const a = analyze(h);
        return [...a.melds.map(m => ({ cards: m, meld: true })), { cards: a.deadwood }];
    }

    function render() {
        // scores
        for (const k of ['p', 'o']) {
            q(`[data-s="${k}"]`).textContent = S.scores[k];
            q(`[data-b="${k}"]`).style.width = Math.min(100, S.scores[k] / TARGET * 100) + '%';
        }
        q('[data-st="won"]').textContent = stats.won;
        q('[data-st="lost"]').textContent = stats.lost;

        // opponent
        const oh = q('[data-h="o"]'); oh.innerHTML = '';
        S.hand.o.forEach((c, i) => {
            const b = backEl();
            if (S.dealing) { b.classList.add('deal'); b.style.animationDelay = (i * 2 + 1) * 55 + 'ms'; }
            if (c.id === S.lastId && S.turn === 'o') b.classList.add('fly');
            oh.appendChild(b);
        });

        // piles
        const st = q('[data-pile="stock"]'); st.innerHTML = '';
        if (S.stock.length) {
            for (let i = 0; i < Math.min(4, Math.ceil(S.stock.length / 8)); i++) { const b = backEl(); b.style.transform = `translate(${-i * 2}px, ${-i * 2}px)`; st.appendChild(b); }
        }
        st.appendChild(el('span', 'count', S.stock.length));
        const dp = q('[data-pile="discard"]'); dp.innerHTML = '';
        const under = S.discard[S.discard.length - 2];
        if (under) dp.appendChild(cardEl(under, { cls: 'under' }));
        const top = S.discard[S.discard.length - 1];
        if (top) dp.appendChild(cardEl(top, { cls: top.id === S.lastId ? 'fly' : '' }));
        else dp.appendChild(el('div', 'card empty'));
        const canDraw = S.turn === 'p' && S.phase === 'draw' && !S.busy;
        st.classList.toggle('live', canDraw && S.stock.length > 0);
        dp.classList.toggle('live', canDraw && !!top);
        st.classList.toggle('hinted', S.hint === 'stock');
        dp.classList.toggle('hinted', S.hint === 'discard');

        // player hand
        const ph = q('[data-h="p"]'); ph.innerHTML = '';
        let n = 0;
        for (const g of arranged()) {
            if (!g.cards.length) continue;
            const grp = el('div', 'group' + (g.meld ? ' meld' : ''));
            for (const c of g.cards) {
                const ce = cardEl(c);
                if (S.dealing) { ce.classList.add('deal'); ce.style.animationDelay = (n * 2) * 55 + 'ms'; }
                if (c.id === S.lastId && S.turn === 'p') ce.classList.add('fly');
                if (S.selected === c.id) ce.classList.add('sel');
                if (S.hint === c.id) ce.classList.add('hinted');
                if (c.id === S.takenId) ce.classList.add('locked');
                ce.addEventListener('click', () => onCard(c));
                grp.appendChild(ce); n++;
            }
            ph.appendChild(grp);
        }

        // controls
        const curDw = S.hand.p.length === 10 ? analyze(S.hand.p).dw : null;
        const dwAfter = S.hand.p.length === 11 && S.selected ? analyze(S.hand.p.filter(c => c.id !== S.selected)).dw : null;
        q('.dw').innerHTML = dwAfter != null
            ? `Deadwood after discard: <b>${dwAfter}</b>`
            : curDw != null ? `Deadwood: <b>${curDw}</b>` : 'Pick a card to discard';
        const canDiscard = S.turn === 'p' && S.phase === 'discard' && S.selected && !S.busy;
        q('[data-act="discard"]').disabled = !canDiscard;
        const kb = q('[data-act="knock"]');
        kb.disabled = !(canDiscard && dwAfter != null && dwAfter <= 10);
        kb.textContent = dwAfter === 0 ? 'Gin!' : 'Knock';
        q('[data-act="hint"]').disabled = !(S.turn === 'p' && S.phase !== 'over' && !S.busy);
        q('[data-act="arrange"]').textContent = 'Sort: ' + S.arrange;
    }

    // ---------- player actions ----------
    root.addEventListener('click', e => {
        const pile = e.target.closest('[data-pile]');
        if (pile) return draw(pile.dataset.pile);
        const b = e.target.closest('[data-act]');
        if (!b || b.disabled) return;
        const act = b.dataset.act;
        if (act === 'discard') playerDiscard(false);
        if (act === 'knock') playerDiscard(true);
        if (act === 'arrange') { S.arrange = { melds: 'rank', rank: 'suit', suit: 'melds' }[S.arrange]; render(); }
        if (act === 'hint') hint();
    });

    function draw(which) {
        if (S.turn !== 'p' || S.phase !== 'draw' || S.busy) return;
        let c;
        if (which === 'stock') { if (!S.stock.length) return; c = S.stock.pop(); S.takenId = null; }
        else { if (!S.discard.length) return; c = S.discard.pop(); S.takenId = c.id; }
        S.hand.p.push(c); S.lastId = c.id; S.phase = 'discard'; S.hint = null; S.selected = null;
        msg(which === 'stock' ? `You drew the ${RANKS[c.r]}${SUITS[c.s]}. Choose a card to discard.` : 'Choose a card to discard (not the one you just took).');
        render();
    }

    function onCard(c) {
        if (S.turn !== 'p' || S.phase !== 'discard' || S.busy) return;
        if (c.id === S.takenId) { msg("You can't discard the card you just took from the pile."); return; }
        if (S.selected === c.id) return playerDiscard(false);
        S.selected = c.id; S.hint = null; render();
    }

    function playerDiscard(knock) {
        const c = S.hand.p.find(x => x.id === S.selected);
        if (!c) return;
        S.hand.p = S.hand.p.filter(x => x !== c);
        S.discard.push(c); S.lastId = c.id; S.selected = null; S.takenId = null; S.hint = null;
        if (knock) return endHand('p');
        if (S.stock.length <= 2) return endHand(null);
        S.turn = 'o'; S.phase = 'draw';
        render();
        aiTurn();
    }

    function hint() {
        if (S.phase === 'draw') {
            const up = S.discard[S.discard.length - 1];
            S.hint = up && aiWantsUpcard(S.hand.p, up) ? 'discard' : 'stock';
            msg(S.hint === 'discard' ? 'Hint: take the up-card — it fits a meld.' : 'Hint: draw from the stock.');
        } else {
            const bd = bestDiscard(S.hand.p, S.takenId);
            S.hint = bd.card.id;
            msg(`Hint: discard the ${RANKS[bd.card.r]}${SUITS[bd.card.s]} (leaves ${bd.a.dw} deadwood${bd.a.dw <= 10 ? ' — you can knock!' : ''}).`);
        }
        render();
    }

    // ---------- computer ----------
    function aiWantsUpcard(hand, up) {
        const bd = bestDiscard([...hand, up], up.id);
        return bd.a.dw < analyze(hand).dw && !bd.a.deadwood.includes(up);
    }

    async function aiTurn() {
        S.busy = true; render();
        msg('Computer is thinking…');
        await sleep(S.dealing ? 1500 : 800);
        const o = S.hand.o;
        const up = S.discard[S.discard.length - 1];
        const take = up && aiWantsUpcard(o, up);
        const c = take ? S.discard.pop() : S.stock.pop();
        o.push(c); S.lastId = c.id; render();
        msg(take ? `Computer took the ${RANKS[c.r]}${SUITS[c.s]}.` : 'Computer drew from the stock.');
        await sleep(800);
        const bd = bestDiscard(o, take ? c.id : null);
        S.hand.o = o.filter(x => x !== bd.card);
        S.discard.push(bd.card); S.lastId = bd.card.id;
        S.busy = false;
        const dw = bd.a.dw;
        if (dw === 0 || (dw <= 10 && (dw <= 5 || S.stock.length < 16))) return endHand('o');
        if (S.stock.length <= 2) return endHand(null);
        S.turn = 'p'; S.phase = 'draw';
        msg(`Computer discarded the ${RANKS[bd.card.r]}${SUITS[bd.card.s]}. Your turn.`);
        render();
    }

    // ---------- scoring ----------
    function endHand(knocker) {
        S.phase = 'over'; S.busy = false; render();
        if (!knocker) {
            showResult('Stock exhausted', 'The hand is a draw — no points scored.', null, null);
            S.dealer = S.dealer === 'p' ? 'o' : 'p';
            return;
        }
        const def = knocker === 'p' ? 'o' : 'p';
        const ka = analyze(S.hand[knocker]);
        const da = analyze(S.hand[def]);
        const gin = ka.dw === 0;
        const lo = gin ? { melds: ka.melds, dead: da.deadwood, laid: [] } : layOff(ka.melds, da.deadwood);
        const D = sum(lo.dead), K = ka.dw;
        let winner, pts, title;
        if (gin) { winner = knocker; pts = 25 + D; title = 'Gin!'; }
        else if (D <= K) { winner = def; pts = 25 + (K - D); title = 'Undercut!'; }
        else { winner = knocker; pts = D - K; title = 'Knock'; }
        S.scores[winner] += pts; S.wins[winner]++;
        S.dealer = winner; // winner deals the next hand
        const name = k => k === 'p' ? 'You' : 'Computer';
        const line = `${name(knocker)} ${gin ? 'went gin' : 'knocked with ' + K}. ${name(def)}: ${D} deadwood${lo.laid.length ? ' after laying off ' + lo.laid.length : ''}. <b>${name(winner)} score${winner === 'p' ? '' : 's'} ${pts}.</b>`;
        showResult(title, line, { k: knocker, melds: lo.melds, dead: ka.deadwood, laid: lo.laid }, { k: def, melds: da.melds, dead: lo.dead });
    }

    function showResult(title, line, kInfo, dInfo) {
        const ov = q('.overlay');
        const over = S.scores.p >= TARGET || S.scores.o >= TARGET;
        ov.innerHTML = '';
        const box = el('div', 'result');
        box.appendChild(el('h2', title.startsWith('Gin') ? 'gin' : '', title));
        box.appendChild(el('p', '', line));
        for (const info of [kInfo, dInfo]) {
            if (!info) continue;
            const row = el('div', 'reveal');
            row.appendChild(el('span', 'lbl', info.k === 'p' ? 'You' : 'Computer'));
            const cards = el('div', 'mini');
            for (const m of info.melds) {
                const g = el('div', 'group meld');
                m.forEach(c => g.appendChild(cardEl(c, { cls: info.laid && info.laid.includes(c) ? 'laid' : '' })));
                cards.appendChild(g);
            }
            if (info.dead.length) {
                const g = el('div', 'group dead');
                info.dead.forEach(c => g.appendChild(cardEl(c)));
                cards.appendChild(g);
            }
            row.appendChild(cards);
            box.appendChild(row);
        }
        if (over) {
            const w = S.scores.p >= TARGET ? 'p' : 'o';
            const final = { p: S.scores.p + S.wins.p * 25 + (w === 'p' ? 100 : 0), o: S.scores.o + S.wins.o * 25 + (w === 'o' ? 100 : 0) };
            box.appendChild(el('div', 'final', `<h3>${w === 'p' ? '🏆 You win the game!' : 'Computer wins the game'}</h3>
              <p>Final with game bonus (100) and 25 per hand won — You <b>${final.p}</b> · Computer <b>${final.o}</b></p>`));
            if (w === 'p') stats.won++; else stats.lost++;
            saveStats();
        }
        const btn = el('button', 'gbtn gold', over ? 'New game' : 'Next hand');
        btn.addEventListener('click', () => {
            ov.hidden = true;
            if (over) { S.scores = { p: 0, o: 0 }; S.wins = { p: 0, o: 0 }; }
            deal();
        });
        box.appendChild(btn);
        ov.appendChild(box);
        ov.hidden = false;
        render();
    }

    deal();
})();
