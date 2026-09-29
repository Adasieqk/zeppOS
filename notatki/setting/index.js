import { convert } from '../shared/convert'

const S = {
  page: { padding: '16px 12px 40px', fontFamily: 'sans-serif' },
  h1: { fontSize: '22px', marginBottom: '6px' },
  hint: { fontSize: '13px', color: '#777', marginBottom: '12px' },
  row: { display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '8px', marginTop: '8px' },
  card: { border: '1px solid #ddd', borderRadius: '10px', padding: '10px', margin: '8px 0' },
  small: { fontSize: '12px', color: '#888' },
  preview: {
    whiteSpace: 'pre-wrap', fontSize: '14px', background: '#111', color: '#fff',
    borderRadius: '10px', padding: '10px', marginTop: '8px', maxHeight: '420px', overflow: 'auto',
  },
}

AppSettingsPage({
  build(props) {
    const st = props.settingsStorage
    const get = (k, d = '') => {
      const v = st.getItem(k)
      return v === undefined || v === null ? d : v
    }
    let notes = []
    try { notes = JSON.parse(get('notes', '[]')) || [] } catch (e) {}
    const save = (arr) => st.setItem('notes', JSON.stringify(arr))

    const mode = get('mode', 'unicode')
    const title = get('draftTitle')
    const body = get('draftBody')
    const editId = get('editId')
    const previewId = get('previewId')

    const clearDraft = () => {
      st.setItem('draftTitle', '')
      st.setItem('draftBody', '')
      st.setItem('editId', '')
    }
    const submit = () => {
      if (!body.trim()) return
      const t = title.trim() || body.trim().split('\n')[0].replace(/[#*$\\`]/g, '').trim().slice(0, 30)
      if (editId) notes = notes.map((n) => (n.id === editId ? { ...n, title: t, body } : n))
      else notes.push({ id: String(Date.now()), title: t, body })
      save(notes)
      clearDraft()
    }
    const move = (i, d) => {
      const j = i + d
      if (j < 0 || j >= notes.length) return
      const tmp = notes[i]; notes[i] = notes[j]; notes[j] = tmp
      save(notes)
    }

    const editor = [
      TextInput({ label: 'Tytuł (opcjonalnie)', placeholder: 'np. Równania kwadratowe', value: title, onChange: (v) => st.setItem('draftTitle', v) }),
      TextInput({ label: 'Treść z Gemini', placeholder: 'Wklej tutaj…', multiline: true, rows: 10, value: body, onChange: (v) => st.setItem('draftBody', v) }),
      Text({ style: S.small }, `${body.length} znaków`),
      View({ style: S.row }, [
        Button({ label: editId ? 'Zapisz zmiany' : 'Dodaj notatkę', color: 'primary', onClick: submit }),
        Button({ label: editId ? 'Anuluj' : 'Wyczyść', onClick: clearDraft }),
      ]),
    ]
    if (body.trim()) editor.push(Text({ paragraph: true, style: S.preview }, convert(body, mode)))

    const list = notes.map((n, i) => {
      const kids = [
        Text({ bold: true }, n.title),
        Text({ style: S.small }, `${n.body.length} znaków`),
      ]
      if (previewId === n.id) kids.push(Text({ paragraph: true, style: S.preview }, convert(n.body, mode)))
      kids.push(
        View({ style: S.row }, [
          Button({ label: previewId === n.id ? 'Ukryj' : 'Podgląd', onClick: () => st.setItem('previewId', previewId === n.id ? '' : n.id) }),
          Button({ label: 'Edytuj', onClick: () => { st.setItem('editId', n.id); st.setItem('draftTitle', n.title); st.setItem('draftBody', n.body) } }),
          Button({ label: '↑', onClick: () => move(i, -1) }),
          Button({ label: '↓', onClick: () => move(i, 1) }),
          Button({ label: 'Usuń', color: 'secondary', onClick: () => save(notes.filter((x) => x.id !== n.id)) }),
        ]),
      )
      return View({ style: S.card }, kids)
    })

    return View({ style: S.page }, [
      Text({ bold: true, style: S.h1 }, 'Notatki → zegarek'),
      Text({ paragraph: true, style: S.hint }, 'Wklej odpowiedź z Gemini (Markdown + LaTeX). Czarne pole to podgląd treści (wzory z ułamkami zegarek rysuje piętrowo, tu są w jednej linii). Potem na zegarku: Notatki → Synchronizuj.'),
      Section({ title: editId ? 'Edycja notatki' : 'Nowa notatka' }, editor),
      Section({ title: `Notatki (${notes.length})` }, list.length ? list : [Text({ style: S.small }, 'Brak notatek.')]),
      Section({ title: 'Wyświetlanie na zegarku' }, [
        Toggle({ label: 'Wzory 2D – ułamki piętrowo, limity/sumy z granicami pod spodem, pierwiastki, macierze, układy równań', value: get('layout2d', '1') === '1', onChange: (v) => st.setItem('layout2d', v ? '1' : '0') }),
        Toggle({ label: 'Tryb ASCII (włącz, jeśli zegarek pokazuje kwadraciki zamiast ² √ ∫ ≤)', value: mode === 'ascii', onChange: (v) => st.setItem('mode', v ? 'ascii' : 'unicode') }),
        Select({
          title: 'Rozmiar czcionki',
          value: get('fontSize', '26'),
          options: ['20', '22', '24', '26', '30', '34'].map((v) => ({ name: v + ' px', value: v })),
          onChange: (v) => st.setItem('fontSize', String(v)),
        }),
      ]),
    ])
  },
})
