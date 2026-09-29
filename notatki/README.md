# Notatki – Gemini → Amazfit (Zepp OS)

Wklejasz odpowiedź z Gemini (Markdown + LaTeX) w telefonie, zegarek pokazuje czysty tekst:
`\frac{-b \pm \sqrt{\Delta}}{2a}` → `(-b ± √Δ)/2a`, `x^2` → `x²`, `\int_0^\infty` → `∫₀^∞`, nagłówki/listy/tabele wyczyszczone.

## Struktura
- `page/` – aplikacja na zegarku (lista notatek, czytnik, synchronizacja, cache offline)
- `setting/` – część na telefon (strona ustawień w apce Zepp: wklejanie, podgląd, edycja, kolejność)
- `app-side/` – side service w Zepp, konwertuje i wysyła na zegarek
- `shared/convert.js` – konwerter Markdown/LaTeX → tekst + podział na bloki
- `shared/mathparse.js` – parser LaTeX → drzewo wzoru (telefon)
- `page/mathlayout.js` – skład 2D na zegarku: ułamki piętrowo, lim/∑ z granicami, pierwiastki, nawiasy skalowane, macierze, układy równań

## Instalacja
1. `npm i -g @zeppos/zeus-cli`
2. `cd notatki && npm i`
3. Tryb dewelopera w apce Zepp: Profil → Ustawienia → O aplikacji → tapnij logo Zepp 7×.
4. `zeus login`, potem `zeus preview` → wybierz swój zegarek → zeskanuj QR w Zepp (Profil → Tryb dewelopera → Skanuj).
   Jeśli preview odrzuci `appId`, załóż aplikację na console.zepp.com i wpisz jej ID w `app.json`.
5. Telefon: Zepp → Profil → zegarek → Aplikacje → Notatki → ustawienia → wklej treść → „Dodaj notatkę”.
6. Zegarek: Notatki → Synchronizuj (Zepp musi działać w tle, BT włączony). Potem działa offline.

## Uwagi
- Jeśli na zegarku widzisz kwadraciki zamiast ² √ ∫ ≤ – włącz „Tryb ASCII” w ustawieniach i zsynchronizuj ponownie.
- Rozmiar czcionki ustawiasz w telefonie.
- Najlepszy prompt do Gemini: „odpowiadaj zwięźle, wzory w LaTeX, bez długich tabel”.
- Symulator: `zeus dev`.
- Czytnik używa dołączonego fontu `assets/*/fonts/math.ttf` (DejaVu Sans, wycięty do potrzebnych znaków, licencja Bitstream Vera/DejaVu – darmowa), więc symbole matematyczne nie zależą od fontu systemowego zegarka.
- Wzory 2D: kreski rysuje CANVAS, tekst to TEXT z fontem. Za szeroki wzór: lekko zmniejsza czcionkę, potem łamie przy „=”, a w ostateczności pokazuje wersję w jednej linii. Wyłącznik „Wzory 2D” w ustawieniach.
