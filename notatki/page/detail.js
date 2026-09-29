import { BasePage } from '@zeppos/zml/base-page'
import { createWidget, widget, text_style, getTextLayout } from '@zos/ui'
import { push } from '@zos/router'
import { setPageBrightTime, resetPageBrightTime } from '@zos/display'
import { W, H, PAD, TOP, loadNotes, fontSize, store } from './layout'
import { createLayout } from './mathlayout'

const HEAD = /^(■|▸|== |> )/
const FONT = 'fonts/math.ttf'
const WHITE = 0xffffff
// tekst tylko z tych znaków idzie fontem systemowym (szybszy)
const SAFE = /^[\x20-\x7E\nąćęłńóśźżĄĆĘŁŃÓŚŹŻ•–—…„”“’]*$/

// rozmiar jednej części – mniej widgetów = płynniejszy scroll
const MAX_WIDGETS = 60
const MAX_HEIGHT = 2000

function cache(name) {
  const g = store()
  return g[name] || (g[name] = {})
}

function measure(v, s) {
  const c = cache('measure')
  const k = s + '|' + v
  if (!c[k]) {
    const r = getTextLayout(v, { text_size: s, text_width: 4000, wrapped: 0, font_name: FONT })
    c[k] = { w: Math.ceil(r.width), h: Math.ceil(r.height) }
  }
  return c[k]
}
const math = createLayout(measure)

function textHeight(text, ts, w, custom) {
  const c = cache('textH')
  const k = ts + '|' + w + '|' + (custom ? 1 : 0) + '|' + text
  if (c[k] === undefined) {
    const opt = { text_size: ts, text_width: w, wrapped: 1 }
    if (custom) opt.font_name = FONT
    c[k] = getTextLayout(text, opt).height + Math.round(ts * 0.3)
  }
  return c[k]
}

function paragraphs(body) {
  const out = []
  let buf = []
  const flush = () => {
    if (buf.length) out.push({ text: buf.join('\n') })
    buf = []
  }
  for (const line of body.split('\n')) {
    if (!line.trim()) { flush(); out.push({ gap: true }); continue }
    if (HEAD.test(line)) { flush(); out.push({ text: line, head: true }); continue }
    buf.push(line)
    if (buf.join('\n').length > 600) flush()
  }
  flush()
  return out
}

function textItem(body, size, w) {
  const paras = paragraphs(body).map((b) => {
    if (b.gap) return { gap: Math.round(size * 0.5) }
    const ts = b.head ? size + 2 : size
    const custom = b.head || !SAFE.test(b.text)
    return { text: b.text, ts, custom, color: b.head ? 0x66ccff : WHITE, h: textHeight(b.text, ts, w, custom) }
  })
  return { paras, cost: paras.filter((p) => p.text).length, h: paras.reduce((a, p) => a + (p.gap || p.h), 0) }
}

function mathCost(box) {
  let n = 0, diag = false
  for (const o of box.ops) {
    if (o.t === 'txt' || o.x1 === o.x2 || o.y1 === o.y2) n++
    else diag = true
  }
  return n + (diag ? 1 : 0)
}

// liczone RAZ na notatkę: układ wzorów, wysokości tekstu, podział na części
function plan(note, idx, size, w) {
  const plans = cache('plans')
  const key = idx + '|' + size + '|' + w
  if (plans[key]) return plans[key]
  const blocks = note.blocks || [{ p: note.body || '' }]
  const items = blocks.map((b) => {
    try {
      if (b.m) {
        let box = null
        try { box = math.fit(b.m, size, w) } catch (e) { }
        if (box) return { box, cost: mathCost(box), h: Math.ceil(box.a + box.b) + Math.round(size * 0.6) }
        return textItem(b.lin || '', size, w)
      }
      return textItem(b.p || '', size, w)
    } catch (e) {
      return { paras: [], cost: 0, h: 0 }
    }
  })
  const starts = [0]
  let count = 0, h = 0
  items.forEach((it, k) => {
    if (k > starts[starts.length - 1] && (count + it.cost > MAX_WIDGETS || h + it.h > MAX_HEIGHT)) {
      starts.push(k)
      count = 0
      h = 0
    }
    count += it.cost
    h += it.h
  })
  return (plans[key] = { items, starts })
}

// poziome/pionowe kreski = FILL_RECT (tanie), CANVAS tylko dla skosów
function drawMath(box, x0, top) {
  const axis = top + box.a
  const diag = []
  for (const o of box.ops) {
    if (o.t === 'txt') {
      createWidget(widget.TEXT, {
        x: Math.round(x0 + o.x), y: Math.round(axis + o.y), w: o.w + 6, h: o.h + 2,
        text: o.v, text_size: o.s, color: WHITE, font: FONT, text_style: text_style.NONE,
      })
    } else if (o.y1 === o.y2) {
      createWidget(widget.FILL_RECT, {
        x: Math.round(x0 + Math.min(o.x1, o.x2)), y: Math.round(axis + o.y1 - o.lw / 2),
        w: Math.max(1, Math.round(Math.abs(o.x2 - o.x1))), h: o.lw, color: WHITE,
      })
    } else if (o.x1 === o.x2) {
      createWidget(widget.FILL_RECT, {
        x: Math.round(x0 + o.x1 - o.lw / 2), y: Math.round(axis + Math.min(o.y1, o.y2)),
        w: o.lw, h: Math.max(1, Math.round(Math.abs(o.y2 - o.y1))), color: WHITE,
      })
    } else diag.push(o)
  }
  if (!diag.length) return
  const P = 4
  const minX = Math.min(...diag.map((o) => Math.min(o.x1, o.x2))) - P
  const maxX = Math.max(...diag.map((o) => Math.max(o.x1, o.x2))) + P
  const minY = Math.min(...diag.map((o) => Math.min(o.y1, o.y2))) - P
  const maxY = Math.max(...diag.map((o) => Math.max(o.y1, o.y2))) + P
  const cx = Math.floor(x0 + minX), cy = Math.floor(axis + minY)
  const cv = createWidget(widget.CANVAS, { x: cx, y: cy, w: Math.ceil(maxX - minX), h: Math.ceil(maxY - minY) })
  for (const o of diag) {
    cv.setPaint({ color: WHITE, line_width: o.lw })
    cv.drawLine({
      x1: Math.round(x0 + o.x1 - cx), y1: Math.round(axis + o.y1 - cy),
      x2: Math.round(x0 + o.x2 - cx), y2: Math.round(axis + o.y2 - cy),
      color: WHITE, line_width: o.lw,
    })
  }
}

Page(
  BasePage({
    onInit(params) {
      let p = {}
      try { p = JSON.parse(params || '{}') } catch (e) { }
      this.idx = p.i || 0
      this.part = p.part || 1
      this.note = loadNotes()[this.idx] || { title: '?', blocks: [] }
      try { setPageBrightTime({ brightTime: 300000 }) } catch (e) { }
    },

    build() {
      const size = fontSize()
      const w = W - PAD * 2
      const { items, starts } = plan(this.note, this.idx, size, w)
      const total = starts.length
      const part = Math.min(this.part, total)
      const from = starts[part - 1]
      const to = part < total ? starts[part] : items.length
      let y = TOP

      const title = total > 1 ? `${this.note.title} (${part}/${total})` : this.note.title
      const tts = part === 1 ? size + 4 : size - 4
      const th = textHeight(title, tts, w, true)
      createWidget(widget.TEXT, {
        x: PAD, y, w, h: th, text: title, text_size: tts,
        color: part === 1 ? 0xffcc00 : 0x8a8a8a, font: FONT, text_style: text_style.WRAP,
      })
      y += th + 8

      for (let k = from; k < to; k++) {
        const it = items[k]
        try {
          if (it.box) {
            drawMath(it.box, PAD + (w - it.box.w) / 2, y + Math.round(size * 0.25))
            y += it.h
            continue
          }
          for (const p of it.paras) {
            if (p.gap) { y += p.gap; continue }
            const opt = { x: PAD, y, w, h: p.h, text: p.text, text_size: p.ts, color: p.color, text_style: text_style.WRAP }
            if (p.custom) opt.font = FONT
            createWidget(widget.TEXT, opt)
            y += p.h
          }
        } catch (e) { }
      }

      if (part < total) {
        y += 16
        createWidget(widget.BUTTON, {
          x: PAD, y, w, h: 64, radius: 32,
          normal_color: 0x1f4fbf, press_color: 0x163a8c,
          text: `Dalej › (${part}/${total})`, text_size: 26, color: WHITE,
          click_func: () => push({ url: 'page/detail', params: JSON.stringify({ i: this.idx, part: part + 1 }) }),
        })
        y += 64
      }
      createWidget(widget.FILL_RECT, { x: 0, y, w: W, h: Math.round(H * 0.2), color: 0x000000 })
    },

    onDestroy() {
      try { resetPageBrightTime() } catch (e) { }
    },
  }),
)