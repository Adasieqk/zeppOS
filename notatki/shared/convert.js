// Gemini (Markdown + LaTeX) -> czysty tekst na zegarek.
// mode: 'unicode' (², √, ∫, π...) albo 'ascii' (^2, sqrt(), int, pi) – gdy font zegarka nie ma jakichś znaków.

import { SUP, SUB, GREEK, SYM, BB } from './symbols'
import { parseMath, needs2D } from './mathparse'
export { SUP, SUB, GREEK, SYM, BB }

const L = '\u0001', R = '\u0002' // placeholdery na \{ \}
const FN = '\u0004' // znacznik po nazwie funkcji (sin, log...)

function readArg(s, i) {
  while (s[i] === ' ') i++
  if (s[i] === '{') {
    let depth = 0, j = i
    for (; j < s.length; j++) {
      if (s[j] === '{') depth++
      else if (s[j] === '}' && --depth === 0) break
    }
    return { arg: s.slice(i + 1, j), end: j + 1 }
  }
  if (s[i] === '\\') {
    const m = /^\\[a-zA-Z]+/.exec(s.slice(i))
    if (m) return { arg: m[0], end: i + m[0].length }
  }
  return { arg: s[i] || '', end: i + 1 }
}

function replaceCmd(s, names, nArgs, fn, withOpt) {
  const re = new RegExp('\\\\(' + names + ')(?![a-zA-Z])')
  let m, guard = 0
  while ((m = re.exec(s)) && guard++ < 2000) {
    let i = m.index + m[0].length
    let opt = null
    if (withOpt && s[i] === '[') {
      const k = s.indexOf(']', i)
      if (k > 0) { opt = s.slice(i + 1, k); i = k + 1 }
    }
    const args = []
    for (let a = 0; a < nArgs; a++) {
      const r = readArg(s, i)
      args.push(r.arg)
      i = r.end
    }
    s = s.slice(0, m.index) + fn(args, opt, m[1]) + s.slice(i)
  }
  return s
}

const simple = (x) => /^√?[A-Za-z0-9ąćęłńóśźżĄĆĘŁŃÓŚŹŻα-ωΑ-Ω.,'′°²³·∞]+$/.test(x) || /^\\[a-zA-Z]+$/.test(x) || /^\\sqrt\{[^{}]+\}$/.test(x)
const wrap = (x) => (simple(x.trim()) ? x.trim() : '(' + x.trim() + ')')

function sup(x, mode) {
  if (mode === 'unicode' && x.length && [...x].every((c) => SUP[c])) return [...x].map((c) => SUP[c]).join('')
  return '^' + ([...x].length === 1 ? x : '(' + x + ')')
}
function sub(x, mode) {
  if (mode === 'unicode' && x.length && [...x].every((c) => SUB[c])) return [...x].map((c) => SUB[c]).join('')
  return '_' + ([...x].length === 1 ? x : '(' + x + ')')
}

function scripts(s, mode, doSub) {
  let out = ''
  for (let i = 0; i < s.length; i++) {
    const c = s[i]
    if (c === '^' || (doSub && c === '_')) {
      const r = readArg(s, i + 1)
      if (!r.arg || r.arg === ' ') { out += c; continue }
      const inner = scripts(r.arg, mode, doSub)
      out += c === '^' ? sup(inner, mode) : sub(inner, mode)
      i = r.end - 1
      if (mode !== 'unicode' && [...inner].length === 1 && /[A-Za-z]/.test(s[i + 1] || '')) out += ' '
    } else out += c
  }
  return out
}

export function convertMath(s, mode, isMath) {
  const U = mode === 'unicode'
  s = s.replace(/\\\{/g, L).replace(/\\\}/g, R)
  s = s.replace(/\^\s*\{?\s*\\circ\s*\}?/g, '°')
  s = s.replace(/\\(left|right)\s*\./g, '').replace(/\\(left|right|big|Big|bigg|Bigg|displaystyle|limits)(?![a-zA-Z])/g, '')
  s = s.replace(/\\\\/g, '\n').replace(/\\[,;:! ]/g, (m) => (m === '\\!' ? '' : ' '))
  s = s.replace(/\\([%$&#_])/g, '$1').replace(/\\\|/g, U ? '‖' : '||')
  s = s.replace(/\\begin\{[a-z*]+\}(\{[^}]*\})?|\\end\{[a-z*]+\}/g, '')
  if (isMath) s = s.replace(/&/g, ' ')

  s = replaceCmd(s, 'text|textrm|textbf|textit|mathrm|mathbf|mathit|mathsf|operatorname|boldsymbol|mbox', 1, ([a]) => a)
  s = replaceCmd(s, 'mathbb', 1, ([a]) => (U && BB[a] ? BB[a] : a))
  s = replaceCmd(s, 'frac|dfrac|tfrac', 2, ([a, b]) => wrap(a) + '/' + wrap(b))
  s = replaceCmd(s, 'binom', 2, ([n, k]) => 'C(' + n + ',' + k + ')')
  s = replaceCmd(s, 'sqrt', 1, ([a], n) =>
    U ? (n ? sup(n, mode) : '') + '√' + wrap(a) : (n ? 'root' + n + '(' : 'sqrt(') + a + ')', true)
  s = replaceCmd(s, 'vec|overrightarrow', 1, ([a]) => (U ? a + '\u20D7' : 'vec(' + a + ')'))
  s = replaceCmd(s, 'overline|bar', 1, ([a]) => (U ? [...a].map((c) => c + '\u0305').join('') : a))
  s = replaceCmd(s, 'hat', 1, ([a]) => (U ? a + '\u0302' : a))

  for (const [cmd, u, a] of SYM) {
    s = s.replace(new RegExp('\\\\' + cmd + '(?![a-zA-Z])', 'g'), U ? u : a)
  }
  s = s.replace(/\\([a-zA-Z]+)/g, (m, name) => (GREEK[name] ? (U ? GREEK[name] : name + ' ') : m))
  s = s.replace(/\\circ(?![a-zA-Z])/g, U ? '∘' : 'o')
  s = s.replace(/\\(sin|cos|tan|tg|cot|ctg|log|ln|lim|max|min|exp|det|arcsin|arccos|arctan|sinh|cosh|mod)(?![a-zA-Z])\s*/g, '$1' + FN)
  s = s.replace(/\\([a-zA-Z]+)/g, '$1') // nieznane komendy -> sama nazwa

  s = scripts(s, mode, isMath)
  s = s.replace(new RegExp(FN + '(?=[\\^_(⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻ⁿ₀₁₂₃₄₅₆₇₈₉ₐₑₒₓᵢₙₖₘₜ])', 'g'), '').replace(new RegExp(FN + '\\s*', 'g'), ' ')
  if (isMath) s = s.replace(/[{}]/g, '')
  s = s.split(L).join('{').split(R).join('}')
  return s.replace(/ {2,}/g, ' ').replace(/ ([)\]},.])/g, '$1').replace(/([([{]) /g, '$1')
}

function cleanMarkdown(s, mode) {
  const U = mode === 'unicode'
  return s
    .replace(/^```.*$/gm, '')
    .replace(/^[ \t]*>[ \t]?/gm, '')
    .replace(/^#{1,2}[ \t]+(.+)$/gm, (m, t) => (U ? '■ ' : '== ') + t.toUpperCase())
    .replace(/^#{3,6}[ \t]+(.+)$/gm, (m, t) => (U ? '▸ ' : '> ') + t)
    .replace(/^[ \t]*[-*_]{3,}[ \t]*$/gm, U ? '──────' : '------')
    .replace(/^[ \t]*\|?[ \t:|-]*-[ \t:|-]*\|[ \t:|-]*$\n?/gm, '') // separator tabeli
    .replace(/^[ \t]*\|(.*)\|[ \t]*$/gm, (m, row) => row.split('|').map((c) => c.trim()).join(' | '))
    .replace(/^([ \t]*)[-*+][ \t]+/gm, (m, ind) => ' '.repeat(Math.floor(ind.length / 2) * 2) + (U ? '• ' : '- '))
    .replace(/(\*\*|__)(.+?)\1/g, '$2')
    .replace(/(^|[^*\w])\*([^*\n]+?)\*(?!\w)/g, '$1$2')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\((?:[^)]+)\)/g, '$1')
    .replace(/\n{3,}/g, '\n\n')
}

// Wersja dla zegarka: lista bloków. {p: 'tekst'} albo {m: drzewo, lin: 'wersja liniowa'}.
// Wzory z ułamkami/limitami/macierzami idą jako osobne bloki 2D, proste zostają w tekście.
export function toBlocks(input, mode = 'unicode', use2D = true) {
  const { text, math } = run(input, mode, use2D ? '\u0005' : null)
  const out = []
  text.split(/\u0005(\d+)\u0005/).forEach((part, k) => {
    if (k % 2 === 1) {
      const body = math[+part].body
      const lin = convertMath(body, mode, true).trim()
      let tree = null
      try { tree = parseMath(body) } catch (e) {}
      out.push(tree ? { m: tree, lin } : { p: lin })
      return
    }
    let p = part.replace(/^[\n ]+|[\n ]+$/g, '')
    if (k > 0) p = p.replace(/^[.,;:][ \t]*(\n|$)/, '') // kropka zostawiona po wzorze
    if (!p.trim()) return
    if (/^[.,;:]$/.test(p.trim()) && out.length) return // sama kropka po wzorze
    out.push({ p })
  })
  return out
}

export function convert(input, mode = 'unicode') {
  return run(input, mode, null).text
}

// Gemini często daje LaTeX bez $...$ (np. przy kopiowaniu zaznaczonego tekstu).
// Szukamy w każdej linii ciągów "matematycznych" i traktujemy je jak wzory.
const LETTERS = /[A-Za-ząćęłńóśźżĄĆĘŁŃÓŚŹŻ]/g
const STRONG = /\\[a-zA-Z]+|[\^_{}]/
const isStrong = (t) => STRONG.test(t) && !t.includes('\u0003')
const isWeak = (t) => {
  if (t.includes('\u0003')) return false
  const letters = (t.match(LETTERS) || []).length
  if (letters === 0 || (letters === 1 && t.length <= 8)) return true
  return letters <= 3 && t.length <= 10 && /[^A-Za-ząćęłńóśźżĄĆĘŁŃÓŚŹŻ.,:;]/.test(t) // np. "3n)(n", "2n^2"
}
const label = (t) => /^[a-zA-Z]\)$/.test(t) // "a)" na początku linii

function wrapBareLatex(line, hold) {
  if (!/\\[a-zA-Z]|[\^_]/.test(line)) return line
  const toks = []
  const re = /\S+/g
  let m
  while ((m = re.exec(line))) toks.push({ t: m[0], s: m.index, e: m.index + m[0].length })
  let out = '', pos = 0, i = 0
  while (i < toks.length) {
    if (!isStrong(toks[i].t)) { i++; continue }
    let a = i, b = i
    while (a > 0 && (isStrong(toks[a - 1].t) || isWeak(toks[a - 1].t))) a--
    while (b < toks.length - 1 && (isStrong(toks[b + 1].t) || isWeak(toks[b + 1].t))) b++
    while (a < i && label(toks[a].t)) a++
    // domknij klamry
    const bal = (x, y) => { let d = 0; for (const c of line.slice(toks[x].s, toks[y].e)) d += c === '{' ? 1 : c === '}' ? -1 : 0; return d }
    while (bal(a, b) > 0 && b < toks.length - 1) b++
    let start = toks[a].s, end = toks[b].e
    let body = line.slice(start, end)
    const trail = /[.,;:]$/.exec(body) && !/\\[.,;:]$/.test(body) ? body.slice(-1) : ''
    if (trail) { body = body.slice(0, -1); end-- }
    const before = line.slice(0, start), after = line.slice(end)
    const display = /^\s*([-*+•]|\d+[.)]|[a-zA-Z]\))?\s*$/.test(before) && /^\s*[.,;:]?\s*$/.test(after)
    out += line.slice(pos, start) + hold(body, display)
    pos = end
    i = b + 1
  }
  return out + line.slice(pos)
}

function run(input, mode, blockMark) {
  if (!input) return { text: '', math: [] }
  let s = String(input).replace(/\r\n?/g, '\n')
  const math = []
  const hold = (body, display) => {
    math.push({ body, display })
    return '\u0003' + (math.length - 1) + '\u0003'
  }
  s = s
    .replace(/\$\$([\s\S]+?)\$\$/g, (m, b) => hold(b, true))
    .replace(/\\\[([\s\S]+?)\\\]/g, (m, b) => hold(b, true))
    .replace(/\\\(([\s\S]+?)\\\)/g, (m, b) => hold(b, false))
    .replace(/\$([^$\n]+?)\$/g, (m, b) => hold(b, false))
  s = s.split('\n').map((line) => wrapBareLatex(line, hold)).join('\n')

  s = cleanMarkdown(s, mode)
  s = convertMath(s, mode, false)
  s = s.replace(/\u0003(\d+)\u0003/g, (m, i) => {
    const { body, display } = math[+i]
    if (blockMark) {
      let two = display
      if (!two) { try { two = needs2D(parseMath(body)) } catch (e) {} }
      if (two) return '\n' + blockMark + i + blockMark + '\n'
    }
    const out = convertMath(body, mode, true).trim()
    return display ? '\n' + out + '\n' : out
  })
  const text = s
    .split('\n').map((l) => l.replace(/\s+$/, '')).join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
  return { text, math }
}
