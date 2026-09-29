// Silnik składu wzorów 2D. Czysty JS (bez @zos), testowalny na PC.
// Box: { w, a (nad osią), b (pod osią), ops[] } – współrzędne względem lewej krawędzi i osi matematycznej (y=0).
// ops: {t:'txt', x, y(góra), v, s, w, h} | {t:'ln', x1, y1, x2, y2, lw}

const MIN = 12

function shift(ops, dx, dy) {
  return ops.map((o) =>
    o.t === 'txt' ? { ...o, x: o.x + dx, y: o.y + dy } : { ...o, x1: o.x1 + dx, x2: o.x2 + dx, y1: o.y1 + dy, y2: o.y2 + dy },
  )
}
const lw = (s) => Math.max(2, Math.round(s / 13))
const small = (s, f) => Math.max(MIN, Math.round(s * f))

export function createLayout(measure) {
  function text(v, s) {
    if (!v) return { w: 0, a: s * 0.35, b: s * 0.25, ops: [] }
    const m = measure(v, s)
    return { w: m.w, a: m.h / 2, b: m.h / 2, ops: [{ t: 'txt', x: 0, y: -m.h / 2, v, s, w: m.w, h: m.h }] }
  }

  function row(items) {
    let x = 0, a = 0, b = 0
    const ops = []
    for (const it of items) {
      ops.push(...shift(it.ops, x, 0))
      x += it.w
      a = Math.max(a, it.a)
      b = Math.max(b, it.b)
    }
    if (!items.length) { a = 0; b = 0 }
    return { w: x, a, b, ops }
  }

  function frac(n, d, s, noLine) {
    const t = lw(s), gap = Math.round(s * (noLine ? 0.25 : 0.14)), pad = Math.round(s * 0.14)
    const w = Math.max(n.w, d.w) + 2 * pad
    const ny = -(t / 2 + gap + n.b), dy = t / 2 + gap + d.a
    const ops = [...shift(n.ops, (w - n.w) / 2, ny), ...shift(d.ops, (w - d.w) / 2, dy)]
    if (!noLine) ops.push({ t: 'ln', x1: pad / 2, y1: 0, x2: w - pad / 2, y2: 0, lw: t })
    return { w: w + 2, a: -ny + n.a, b: dy + d.b, ops: shift(ops, 1, 0) }
  }

  function scripts(B, P, S, s) {
    let supC = P ? -Math.max(B.a - P.b * 0.45, s * 0.38) : 0
    let subC = S ? Math.max(B.b - S.a * 0.3, s * 0.3) : 0
    if (P && S) {
      const overlap = supC + P.b + 2 - (subC - S.a)
      if (overlap > 0) { supC -= overlap / 2; subC += overlap / 2 }
    }
    const x = B.w + 1
    const ops = [...B.ops]
    if (P) ops.push(...shift(P.ops, x, supC))
    if (S) ops.push(...shift(S.ops, x, subC))
    return {
      w: x + Math.max(P ? P.w : 0, S ? S.w : 0) + 2,
      a: Math.max(B.a, P ? -supC + P.a : 0),
      b: Math.max(B.b, S ? subC + S.b : 0),
      ops,
    }
  }

  // nawiasy rysowane liniami (skalują się do wysokości treści)
  function fence(C, l, r, s) {
    const top = -C.a - 2, bot = C.b + 2, H = bot - top, mid = (top + bot) / 2
    const flat = H <= measure('(', s).h * 1.15
    if (flat) {
      const L = l ? text(l, s) : null, Rr = r ? text(r, s) : null
      return row([L, C, Rr].filter(Boolean))
    }
    const pw = Math.round(Math.max(s * 0.38, Math.min(H * 0.14, s * 0.7)))
    const t = lw(s)
    const draw = (d, x0, mirror) => {
      const X = (fx) => (mirror ? x0 + pw - fx : x0 + fx)
      const L = []
      const seg = (pts) => { for (let i = 1; i < pts.length; i++) L.push({ t: 'ln', x1: X(pts[i - 1][0]), y1: pts[i - 1][1], x2: X(pts[i][0]), y2: pts[i][1], lw: t }) }
      if (d === '(' || d === ')') {
        const pts = []
        for (let k = 0; k <= 10; k++) { const u = -1 + k / 5; pts.push([pw * (0.25 + 0.55 * u * u), mid + (u * H) / 2]) }
        seg(pts)
      } else if (d === '[' || d === ']') seg([[pw * 0.75, top], [pw * 0.3, top], [pw * 0.3, bot], [pw * 0.75, bot]])
      else if (d === '{' || d === '}') {
        const q = Math.min(H * 0.08, pw * 0.6)
        seg([[pw * 0.85, top], [pw * 0.5, top + q], [pw * 0.5, mid - q], [pw * 0.15, mid], [pw * 0.5, mid + q], [pw * 0.5, bot - q], [pw * 0.85, bot]])
      } else if (d === '|') seg([[pw * 0.5, top], [pw * 0.5, bot]])
      else if (d === '‖') { seg([[pw * 0.35, top], [pw * 0.35, bot]]); seg([[pw * 0.65, top], [pw * 0.65, bot]]) }
      else if (d === '⟨' || d === '⟩') seg([[pw * 0.8, top], [pw * 0.2, mid], [pw * 0.8, bot]])
      else if (d === '⌊' || d === '⌋') seg([[pw * 0.3, top], [pw * 0.3, bot], [pw * 0.8, bot]])
      else if (d === '⌈' || d === '⌉') seg([[pw * 0.3, bot], [pw * 0.3, top], [pw * 0.8, top]])
      return L
    }
    const mir = { ')': 1, ']': 1, '}': 1, '⟩': 1, '⌋': 1, '⌉': 1 }
    const lw_ = l ? pw : 0, rw = r ? pw : 0
    const ops = [...(l ? draw(l, 0, !!mir[l]) : []), ...shift(C.ops, lw_, 0), ...(r ? draw(r, lw_ + C.w, !!mir[r]) : [])]
    return { w: lw_ + C.w + rw, a: -top + t, b: bot + t, ops }
  }

  function L(n, s, depth) {
    if (!n) return row([])
    switch (n.k) {
      case 'r': return row(n.c.map((x) => L(x, s, depth)))
      case 't': return text(n.v, s)
      case 'fr': {
        const fs = depth > 0 ? small(s, 0.82) : s
        return frac(L(n.n, fs, depth + 1), L(n.d, fs, depth + 1), s, n.nl)
      }
      case 'sc': {
        const ss = small(s, 0.68)
        return scripts(L(n.b, s, depth), n.p && L(n.p, ss, depth + 1), n.s && L(n.s, ss, depth + 1), s)
      }
      case 'op': {
        const big = n.v === '∑' || n.v === '∏' || n.v === '∪' || n.v === '∩'
        const isInt = /[∫∬∭∮]/.test(n.v)
        const O = text(n.v, big ? Math.round(s * 1.45) : isInt ? Math.round(s * 1.6) : s)
        const ss = small(s, 0.68)
        const P = n.p && L(n.p, ss, depth + 1), S = n.s && L(n.s, ss, depth + 1)
        const sp = Math.round(s * 0.18)
        if (!n.L) {
          const r = scripts(O, P, S, s)
          r.w += sp
          return r
        }
        const gap = Math.round(s * 0.08)
        const w = Math.max(O.w, P ? P.w : 0, S ? S.w : 0)
        const ops = [...shift(O.ops, (w - O.w) / 2, 0)]
        let a = O.a, b = O.b
        if (S) { const y = O.b + gap + S.a; ops.push(...shift(S.ops, (w - S.w) / 2, y)); b = y + S.b }
        if (P) { const y = -(O.a + gap + P.b); ops.push(...shift(P.ops, (w - P.w) / 2, y)); a = -y + P.a }
        return { w: w + sp, a, b, ops: shift(ops, sp / 2, 0) }
      }
      case 'sq': {
        const C = L(n.c, s, depth)
        const gap = Math.round(s * 0.12), t = lw(s), hw = Math.round(s * 0.62), pad = Math.round(s * 0.1)
        const top = -(C.a + gap), bot = C.b, H = bot - top
        const I = n.i ? L(n.i, small(s, 0.5), depth + 1) : null
        const ix = I ? Math.max(0, I.w - hw * 0.45) : 0
        const pts = [[0, top + H * 0.58], [hw * 0.22, top + H * 0.5], [hw * 0.55, bot], [hw, top], [hw + C.w + pad * 2, top]]
        const ops = []
        for (let i = 1; i < pts.length; i++) ops.push({ t: 'ln', x1: ix + pts[i - 1][0], y1: pts[i - 1][1], x2: ix + pts[i][0], y2: pts[i][1], lw: i === 2 ? t + 1 : t })
        ops.push(...shift(C.ops, ix + hw + pad, 0))
        let a = -top + t
        if (I) { const y = top + H * 0.5 - 2 - I.b; ops.push(...shift(I.ops, 0, y)); a = Math.max(a, -y + I.a) }
        return { w: ix + hw + C.w + pad * 2 + 2, a, b: bot + t, ops }
      }
      case 'fe': return fence(L(n.c, s, depth), n.l, n.r, s)
      case 'ac': {
        const C = L(n.c, s, depth)
        const t = lw(s)
        const y = -C.a - 2
        const ops = [...C.ops]
        let extra = t + 2
        if (n.a === 'line') ops.push({ t: 'ln', x1: 1, y1: y, x2: C.w - 1, y2: y, lw: t })
        else if (n.a === 'arrow') {
          const k = Math.round(s * 0.18)
          ops.push({ t: 'ln', x1: 1, y1: y - k / 2, x2: C.w, y2: y - k / 2, lw: t })
          ops.push({ t: 'ln', x1: C.w - k, y1: y - k, x2: C.w, y2: y - k / 2, lw: t })
          ops.push({ t: 'ln', x1: C.w - k, y1: y, x2: C.w, y2: y - k / 2, lw: t })
          extra = k + t + 2
        } else {
          const k = Math.round(s * 0.2), cx = C.w / 2
          ops.push({ t: 'ln', x1: cx - k, y1: y, x2: cx, y2: y - k, lw: t })
          ops.push({ t: 'ln', x1: cx, y1: y - k, x2: cx + k, y2: y, lw: t })
          extra = k + t + 2
        }
        return { w: C.w, a: C.a + extra, b: C.b, ops }
      }
      case 'mx': {
        const cells = n.rows.map((r) => r.map((c) => L(c, s, depth)))
        const cols = Math.max(1, ...cells.map((r) => r.length))
        const colW = []
        for (let j = 0; j < cols; j++) colW[j] = Math.max(0, ...cells.map((r) => (r[j] ? r[j].w : 0)))
        const rg = Math.round(s * 0.3)
        const isAlign = /^(rl)+$/.test(n.al)
        const cg = isAlign ? 0 : Math.round(s * (n.l === '{' ? 0.7 : 0.9))
        const rowsH = cells.map((r) => ({ a: Math.max(s * 0.35, ...r.map((c) => c.a)), b: Math.max(s * 0.25, ...r.map((c) => c.b)) }))
        const total = rowsH.reduce((acc, h) => acc + h.a + h.b, 0) + rg * (cells.length - 1)
        let y = -total / 2
        const ops = []
        const W = colW.reduce((p, c) => p + c, 0) + cg * (cols - 1)
        cells.forEach((r, i) => {
          y += rowsH[i].a
          let x = 0
          for (let j = 0; j < cols; j++) {
            const c = r[j]
            if (c) {
              const al = n.al[j] || 'c'
              const dx = al === 'l' ? 0 : al === 'r' ? colW[j] - c.w : (colW[j] - c.w) / 2
              ops.push(...shift(c.ops, x + dx, y))
            }
            x += colW[j] + cg
          }
          y += rowsH[i].b + rg
        })
        const pad = n.l || n.r ? Math.round(s * 0.15) : 0
        const C = { w: W + pad * 2, a: total / 2, b: total / 2, ops: shift(ops, pad, 0) }
        return n.l || n.r ? fence(C, n.l, n.r, s) : C
      }
    }
    return row([])
  }

  // Układa wzór w szerokości maxW: najpierw lekko zmniejsza czcionkę, potem łamie przy =, ≤ ..., na końcu zmniejsza dalej.
  function fit(tree, size, maxW) {
    const floor = Math.max(16, Math.round(size * 0.8))
    const tryRange = (t, from, to) => {
      for (let s = from; s >= to; s -= 2) {
        const box = L(t, s, 0)
        if (box.w <= maxW) return box
      }
      return null
    }
    let box = tryRange(tree, size, floor)
    if (box) return box
    if (tree.k === 'r') {
      const parts = [[]]
      tree.c.forEach((x, i) => {
        if (x.k === 't' && x.rel && i > 0) parts.push([])
        parts[parts.length - 1].push(x)
      })
      if (parts.length > 1) {
        box = tryRange({ k: 'mx', rows: parts.map((p) => [{ k: 'r', c: p }]), l: '', r: '', al: 'l' }, size, 14)
        if (box) return box
      }
    }
    return tryRange(tree, floor - 2, 14) // null = za szeroki, użyj wersji liniowej
  }

  return { layout: (tree, size) => L(tree, size, 0), fit }
}
