import { BasePage } from '@zeppos/zml/base-page'
import { createWidget, widget, align, prop } from '@zos/ui'
import { push, replace } from '@zos/router'
import { localStorage } from '@zos/storage'
import { W, H, PAD, TOP, loadNotes, resetCache } from './layout'

Page(
  BasePage({
    state: { status: null, busy: false },

    build() {
      const notes = loadNotes()
      const w = W - PAD * 2
      let y = TOP

      createWidget(widget.TEXT, {
        x: PAD, y, w, h: 44,
        text: 'Notatki', text_size: 32, color: 0xffffff, align_h: align.CENTER_H,
      })
      y += 48

      this.state.status = createWidget(widget.TEXT, {
        x: PAD, y, w, h: 30,
        text: notes.length ? `Notatek: ${notes.length}` : 'Pusto – kliknij Synchronizuj',
        text_size: 20, color: 0x8a8a8a, align_h: align.CENTER_H,
      })
      y += 40

      createWidget(widget.BUTTON, {
        x: PAD, y, w, h: 64, radius: 32,
        normal_color: 0x1f4fbf, press_color: 0x163a8c,
        text: 'Synchronizuj', text_size: 26, color: 0xffffff,
        click_func: () => this.sync(),
      })
      y += 80

      notes.forEach((n, i) => {
        createWidget(widget.BUTTON, {
          x: PAD, y, w, h: 72, radius: 16,
          normal_color: 0x222222, press_color: 0x444444,
          text: n.title || `Notatka ${i + 1}`, text_size: 24, color: 0xffffff,
          click_func: () => push({ url: 'page/detail', params: JSON.stringify({ i }) }),
        })
        y += 84
      })

      // zapas na dole, żeby ostatni przycisk dało się wyscrollować
      createWidget(widget.FILL_RECT, { x: 0, y, w: W, h: Math.round(H * 0.15), color: 0x000000 })
    },

    setStatus(text) {
      if (this.state.status) this.state.status.setProperty(prop.MORE, { text })
    },

    async sync() {
      if (this.state.busy) return
      this.state.busy = true
      this.setStatus('Łączę z telefonem…')
      try {
        const idx = await this.request({ method: 'GET_INDEX', params: {} })
        const notes = []
        for (let k = 0; k < idx.list.length; k++) {
          this.setStatus(`Pobieram ${k + 1}/${idx.list.length}…`)
          const r = await this.request({ method: 'GET_NOTE', params: { id: idx.list[k].id } })
          notes.push({ title: idx.list[k].title, blocks: r.blocks })
        }
        localStorage.setItem('notes', JSON.stringify(notes))
        localStorage.setItem('fontSize', String(idx.fontSize || 26))
        resetCache() // wyrzuca stare notatki i policzone układy z pamięci apki
        replace({ url: 'page/index' })
      } catch (e) {
        this.setStatus('Błąd – otwórz apkę Zepp na telefonie')
      } finally {
        this.state.busy = false
      }
    },
  }),
)