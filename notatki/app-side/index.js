import { BaseSideService } from '@zeppos/zml/base-side'
import { convert, toBlocks } from '../shared/convert'

const store = () => settings.settingsStorage

function readNotes() {
  try {
    return JSON.parse(store().getItem('notes') || '[]') || []
  } catch (e) {
    return []
  }
}

AppSideService(
  BaseSideService({
    onInit() {},

    onRequest(req, res) {
      const mode = store().getItem('mode') || 'unicode'
      const notes = readNotes()

      if (req.method === 'GET_INDEX') {
        res(null, {
          list: notes.map((n) => ({ id: n.id, title: convert(n.title, mode) })),
          fontSize: Number(store().getItem('fontSize') || 26),
        })
        return
      }
      if (req.method === 'GET_NOTE') {
        const n = notes.find((x) => x.id === (req.params && req.params.id))
        const use2D = (store().getItem('layout2d') || '1') === '1'
        res(null, { blocks: n ? toBlocks(n.body, mode, use2D) : [] })
        return
      }
      res('unknown method: ' + req.method)
    },

    onRun() {},
    onDestroy() {},
  }),
)
