// LaTeX (tryb matematyczny) -> drzewo do rysowania 2D na zegarku.
// Węzły: r=wiersz, t=tekst, fr=ułamek, sc=indeksy, op=operator (lim, ∑, ∫), sq=pierwiastek,
//        fe=nawiasy, mx=macierz/układ, ac=akcent (wektor, kreska, daszek)
import { SYM, GREEK, BB, SUP, SUB } from './symbols'

const UNI = {}
for (const [cmd, u] of SYM) UNI[cmd] = u
const REL_CMDS = new Set(['leq', 'le', 'geq', 'ge', 'neq', 'ne', 'approx', 'equiv', 'sim', 'propto', 'to', 'rightarrow', 'leftarrow',
  'Rightarrow', 'implies', 'Leftrightarrow', 'iff', 'mapsto', 'in', 'notin', 'subset', 'subseteq', 'perp', 'parallel'])
const BIN_CMDS = new Set(['cdot', 'times', 'div', 'pm', 'mp', 'cup', 'cap', 'setminus', 'land', 'lor', 'wedge', 'vee'])
const RELS = new Set(['=', '<', '>', '≤', '≥', '≠', '≈', '≡', '~', '∝', '→', '←', '⇒', '⇔', '↦', '∈', '∉', '⊂', '⊆', '⊥', '∥'])
const BINS = new Set(['+', '−', '·', '×', '÷', '±', '∓', '∪', '∩', '∖', '∧', '∨'])

const OPS_LIM = { lim: 'lim', sum: '∑', prod: '∏', max: 'max', min: 'min', sup: 'sup', inf: 'inf', bigcup: '∪', bigcap: '∩', limsup: 'lim sup', liminf: 'lim inf' }
const OPS_SIDE = { int: '∫', iint: '∬', iiint: '∭', oint: '∮' }
const FUNCS = new Set(['sin', 'cos', 'tan', 'tg', 'cot', 'ctg', 'log', 'ln', 'lg', 'exp', 'det', 'arcsin', 'arccos', 'arctan', 'arctg', 'arcctg',
  'sinh', 'cosh', 'tanh', 'mod', 'gcd', 'NWD', 'NWW', 'deg', 'dim', 'ker', 'sgn'])
const RAW = new Set(['text', 'textrm', 'textit', 'textbf', 'mbox', 'mathrm', 'operatorname', 'textnormal'])
const SKIP = new Set(['displaystyle', 'textstyle', 'scriptstyle', 'limits', 'nolimits', 'hline', 'mathstrut', 'strut', 'nonumber', 'notag', 'left.', 'qed'])
const BIGS = new Set(['big', 'Big', 'bigg', 'Bigg', 'bigl', 'bigr', 'Bigl', 'Bigr', 'biggl', 'biggr', 'Biggl', 'Biggr', 'bigm', 'Bigm'])
const DELIMS = { '{': '{', '}': '}', langle: '⟨', rangle: '⟩', '|': '‖', Vert: '‖', vert: '|', lvert: '|', rvert: '|', lVert: '‖', rVert: '‖',
  lfloor: '⌊', rfloor: '⌋', lceil: '⌈', rceil: '⌉' }
const ENV_FENCE = { pmatrix: ['(', ')'], bmatrix: ['[', ']'], Bmatrix: ['{', '}'], vmatrix: ['|', '|'], Vmatrix: ['‖', '‖'], matrix: ['', ''], smallmatrix: ['', ''], array: ['', ''] }

function tokenize(s) {
  const out = []
  let i = 0
  while (i < s.length) {
    const c = s[i]
    if (c === '\\') {
      const m = /^\\([a-zA-Z]+)\*?/.exec(s.slice(i))
      if (!m) { out.push({ c: s[i + 1] || '' }); i += 2; continue }
      const name = m[1]
      i += m[0].length
      if (RAW.has(name) || name === 'begin' || name === 'end') {
        while (s[i] === ' ') i++
        if (s[i] === '{') {
          let d = 0, j = i
          for (; j < s.length; j++) {
            if (s[j] === '{') d++
            else if (s[j] === '}' && --d === 0) break
          }
          const raw = s.slice(i + 1, j)
          i = j + 1
          if (name === 'begin') out.push({ begin: raw.replace('*', '') })
          else if (name === 'end') out.push({ end: raw.replace('*', '') })
          else out.push({ raw })
          continue
        }
      }
      out.push({ c: name })
      continue
    }
    if (/\s/.test(c)) { i++; continue }
    out.push({ ch: c })
    i++
  }
  return out
}

const R = (c) => ({ k: 'r', c })
const T = (v, extra) => Object.assign({ k: 't', v }, extra || {})

class Parser {
  constructor(toks) { this.t = toks; this.i = 0 }
  peek() { return this.t[this.i] }
  next() { return this.t[this.i++] }

  row(stop) {
    const c = []
    for (;;) {
      const t = this.peek()
      if (!t || stop(t)) break
      const a = this.atom()
      if (a) c.push(this.scripts(a))
    }
    return R(c)
  }

  group() {
    const t = this.peek()
    if (!t) return R([])
    if (t.ch === '{') {
      this.next()
      const r = this.row((x) => x.ch === '}')
      this.next()
      return r
    }
    const a = this.atom()
    return R(a ? [a] : [])
  }

  scripts(base) {
    let p = null, s = null
    for (;;) {
      const t = this.peek()
      if (!t) break
      if (t.ch === '^' && !p) { this.next(); p = this.group() }
      else if (t.ch === '_' && !s) { this.next(); s = this.group() }
      else if (t.ch === "'") { this.next(); base = R([base, T('′')]) }
      else if (t.c === 'limits' || t.c === 'nolimits') this.next()
      else break
    }
    if (!p && !s) return base
    if (p && !s && p.c.length === 1 && p.c[0].k === 't' && p.c[0].v === '∘') return R([base, T('°')])
    if (base.k === 'op') { if (p) base.p = p; if (s) base.s = s; return base }
    const n = { k: 'sc', b: base }
    if (p) n.p = p
    if (s) n.s = s
    return n
  }

  delim() {
    const t = this.next()
    if (!t) return ''
    if (t.ch !== undefined) return t.ch === '.' ? '' : t.ch === '|' ? '|' : t.ch
    return DELIMS[t.c] || ''
  }

  env(name) {
    if (name === 'array' && this.peek() && this.peek().ch === '{') this.group()
    const rows = []
    let cells = []
    for (;;) {
      const cell = this.row((x) => x.ch === '&' || x.c === '\\' || x.end !== undefined)
      cells.push(cell)
      const t = this.next()
      if (!t) break
      if (t.ch === '&') continue
      if (t.c === '\\') {
        if (this.peek() && this.peek().ch === '[') { while (this.peek() && this.peek().ch !== ']') this.next(); this.next() }
        rows.push(cells); cells = []
        continue
      }
      break // \end
    }
    if (cells.some((c) => c.c.length)) rows.push(cells)
    const cols = Math.max(1, ...rows.map((r) => r.length))
    if (/^(cases|dcases|rcases)$/.test(name)) return { k: 'mx', rows, l: name === 'rcases' ? '' : '{', r: name === 'rcases' ? '}' : '', al: 'l'.repeat(cols) }
    if (/^(aligned|align|alignat|split|eqnarray|flalign)$/.test(name)) return { k: 'mx', rows, l: '', r: '', al: 'rl'.repeat(cols) }
    if (/^(gathered|gather|multline)$/.test(name)) return { k: 'mx', rows, l: '', r: '', al: 'c'.repeat(cols) }
    const f = ENV_FENCE[name] || ['', '']
    return { k: 'mx', rows, l: f[0], r: f[1], al: 'c'.repeat(cols) }
  }

  atom() {
    const t = this.next()
    if (t.ch !== undefined) {
      const ch = t.ch
      if (ch === '{') { const r = this.row((x) => x.ch === '}'); this.next(); return r }
      if (ch === '}' || ch === '&' || ch === ']' && false) return null
      if (ch === '^' || ch === '_') { this.i--; return T('') }
      if (ch === '-') return T('−', { o: 1 })
      if (ch === '*') return T('·', { o: 1 })
      if (RELS.has(ch)) return T(ch, { o: 2 })
      if (BINS.has(ch)) return T(ch, { o: 1 })
      return T(ch)
    }
    if (t.raw !== undefined) return T(t.raw)
    if (t.begin !== undefined) return this.env(t.begin)
    if (t.end !== undefined) return null
    const c = t.c
    if (c === 'frac' || c === 'dfrac' || c === 'tfrac' || c === 'cfrac') return { k: 'fr', n: this.group(), d: this.group() }
    if (c === 'binom' || c === 'dbinom' || c === 'tbinom') return { k: 'fe', l: '(', r: ')', c: R([{ k: 'fr', n: this.group(), d: this.group(), nl: 1 }]) }
    if (c === 'sqrt') {
      let idx = null
      if (this.peek() && this.peek().ch === '[') { this.next(); idx = this.row((x) => x.ch === ']'); this.next() }
      const n = { k: 'sq', c: this.group() }
      if (idx) n.i = idx
      return n
    }
    if (c === 'left') {
      const l = this.delim()
      const inner = this.row((x) => x.c === 'right')
      this.next()
      return { k: 'fe', l, r: this.delim(), c: inner }
    }
    if (c === 'right' || c === 'middle') { this.delim(); return null }
    if (BIGS.has(c)) { const d = this.delim(); return d ? T(d) : null }
    if (OPS_LIM[c]) return { k: 'op', v: OPS_LIM[c], L: 1 }
    if (OPS_SIDE[c]) return { k: 'op', v: OPS_SIDE[c], L: 0 }
    if (FUNCS.has(c)) return T(c, { fn: 1 })
    if (c === 'mathbb') { const g = this.group(); return T(g.c.map((x) => BB[x.v] || x.v).join('')) }
    if (c === 'mathbf' || c === 'boldsymbol' || c === 'mathit' || c === 'mathsf' || c === 'mathcal' || c === 'bm') return this.group()
    if (c === 'vec' || c === 'overrightarrow') return { k: 'ac', a: 'arrow', c: this.group() }
    if (c === 'overline' || c === 'bar' || c === 'tilde' || c === 'widetilde') return { k: 'ac', a: 'line', c: this.group() }
    if (c === 'hat' || c === 'widehat') return { k: 'ac', a: 'hat', c: this.group() }
    if (c === 'quad') return T('  ')
    if (c === 'qquad') return T('    ')
    if (c === ',' || c === ':' || c === ';' || c === ' ') return T(' ')
    if (c === '!' || c === '\\' || SKIP.has(c)) return null
    if (c === '{' || c === '}' || c === '%' || c === '$' || c === '&' || c === '#' || c === '_') return T(c)
    if (c === '|') return T('‖')
    if (c === 'circ') return T('∘')
    if (c === 'degree') return T('°')
    if (GREEK[c]) return T(GREEK[c])
    if (UNI[c] !== undefined) return T(UNI[c].trim() || ' ', REL_CMDS.has(c) ? { o: 2 } : BIN_CMDS.has(c) ? { o: 1 } : undefined)
    return T(c)
  }
}

// scala sąsiednie teksty, dodaje odstępy wokół = + itd. Relacje zostają osobno (do łamania linii).
function tidy(n) {
  if (!n || typeof n !== 'object') return n
  for (const key of ['b', 'p', 's', 'n', 'd', 'c', 'i']) if (n[key] && n.k !== 't') n[key] = tidy(n[key])
  if (n.rows) n.rows = n.rows.map((r) => r.map(tidy))
  if (n.k !== 'r') return n
  n.c = n.c.map((x) => (x.k === 't' ? x : tidy(x)))
  const out = []
  n.c.forEach((x, idx) => {
    if (x.k === 'r' && x.c.length === 1) x = x.c[0]
    const prev = out[out.length - 1]
    if (x.k === 't') {
      let v = x.v
      if (x.o) {
        const unary = !prev || (prev.k === 't' && (prev.rel || /[(\[{,]\s*$/.test(prev.v)))
        v = unary ? v : x.o === 2 ? ' ' + v + ' ' : ' ' + v + ' '
      }
      if (x.fn) {
        const nx = n.c[idx + 1]
        if (nx && !(nx.k === 't' && nx.v[0] === '(') && !(nx.k === 'fe')) v += ' '
      }
      if (x.o === 2) { out.push(T(v, { rel: 1 })); return }
      if (prev && prev.k === 't' && !prev.rel) { prev.v += v; return }
      out.push(T(v))
      return
    }
    if (x.k === 'sc' && x.b.k === 't' && x.b.fn) x.b.v = x.b.v // funkcja z indeksem, np. log₂
    out.push(x)
  })
  n.c = out
  return n
}

export function parseMath(src) {
  src = src.replace(/(^|[^\\a-zA-Z])(lim|sum|int|sqrt|frac)(?=\s*[_{^])/g, '$1\\$2') // "lim_{...}" bez backslasha
  const p = new Parser(tokenize(src.replace(/\\\\/g, ' \\\\ ')))
  const lines = []
  for (;;) {
    lines.push(p.row((x) => x.c === '\\'))
    if (!p.next()) break
  }
  const root = lines.length > 1 ? { k: 'mx', rows: lines.filter((l) => l.c.length).map((l) => [l]), l: '', r: '', al: 'l' } : lines[0]
  return tidy(root)
}

const unicodeScript = (row, map) =>
  row.c.every((x) => x.k === 't' && [...x.v.trim()].every((ch) => map[ch]))

// czy wzór wymaga rysowania 2D (inaczej zostaje w linii tekstu)
export function needs2D(n) {
  if (!n || typeof n !== 'object') return false
  switch (n.k) {
    case 't': return false
    case 'fr': case 'mx': return true
    case 'op': return !!(n.L && (n.s || n.p)) || needs2D(n.s) || needs2D(n.p)
    case 'sq': return !(n.c.c.length === 1 && n.c.c[0].k === 't' && n.c.c[0].v.length <= 3) || !!n.i
    case 'sc': return needs2D(n.b) || (n.p && !unicodeScript(n.p, SUP)) || (n.s && !unicodeScript(n.s, SUB)) || false
    case 'fe': return needs2D(n.c)
    case 'ac': return n.a !== 'line' || needs2D(n.c)
    case 'r': return n.c.some(needs2D)
  }
  return false
}
