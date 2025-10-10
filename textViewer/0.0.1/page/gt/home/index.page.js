import * as hmUI from "@zos/ui";

const note = "1. Selektory\n\nUniwersalny: * \nWybiera wszystkie elementy w dokumencie. \n\nElementu: element (np. p) \nWybiera wszystkie elementy podanego typu. \n\nID: #id \nWybiera element o danym unikalnym ID. \n\nKlasy: .klasa \nWybiera elementy z określoną klasą CSS. \n\nWielu elementów: element1, element2 \nWybiera elementy różnych typów. \n\nWielu klas: .klasa1, .klasa2 \nWybiera elementy z różnych klas. \n\nPierwszy element w typie: element:first \nWybiera pierwszy element danego typu. \n\nOstatni element w typie: element:last \nWybiera ostatni element danego typu. \n\nAtrybutu: [nazwa-atrybutu] \nWybiera elementy posiadające dany atrybut. \n\n\n\n2. Eventy i ich obsługa\n\nbind(eventType, handler) \nPrzypisuje zdarzenie do elementu. \n\nblur(handler) \nGdy element traci fokus. \n\nchange(handler) \nGdy zmienia się wartość elementu (np. w formularzu). \n\nclick(handler) \nPo kliknięciu na element. \n\ndblclick(handler) \nPo podwójnym kliknięciu. \n\nmouseenter(handler) \nKursor wchodzi na element. \n\nmouseleave(handler) \nKursor wychodzi z elementu. \n\nhover(handlerIn, handlerOut) \nEfekt najechania i opuszczenia myszką. \n\nsubmit(handler) \nPrzesłanie formularza. \n\nscroll(handler) \nPrzewijanie elementu. \n\nfocus(handler) \nElement zyskuje fokus. \n\nkeyup(handler) \nZwolnienie klawisza. \n\nkeydown(handler) \nWciśnięcie klawisza. \n\nresize(handler) \nZmiana rozmiaru okna przeglądarki. \n\non(eventType, handler) \nNowoczesny sposób przypisywania zdarzeń. \n\noff(eventType) \nUsuwanie zdarzeń. \n\ntrigger(eventType) \nRęczne wywołanie zdarzenia. \n\n\n\n3. Efekty i animacje\n\nanimate(properties, duration) \nAnimuje CSS elementu. \n\nfadeIn(duration) \nPłynne pojawienie elementu. \n\nfadeOut(duration) \nPłynne zniknięcie elementu. \n\nhide(duration) \nUkrywa element. \n\nshow(duration) \nPokazuje element. \n\nslideUp(duration) \nZwijanie elementu w pionie (ukrywanie). \n\ntoggle(duration) \nPrzełączanie widoczności elementu. \n\nfadeToggle(duration) \nPrzełączanie przez zanikanie i pojawianie. \n\ndelay(duration) \nOpóźnia wykonanie animacji. \n\nstop() \nZatrzymuje bieżącą animację. \n\nfinish() \nKończy wszystkie animacje i czyści kolejkę. \n\n\n\n4. Manipulacja stylem i zawartością\n\ncss(property) lub css(property, value) \nPobiera lub ustawia styl CSS. \n\nwidth() / height() \nPobiera lub ustawia szerokość/wysokość elementu. \n\ninnerWidth() / innerHeight() \nUwzględnia padding. \n\nouterWidth() / outerHeight() \nUwzględnia padding i border (opcjonalnie margin). \n\ntext() / text(value) \nPobiera lub ustawia tekst bez HTML. \n\nhtml() / html(value) \nPobiera lub ustawia kod HTML wewnątrz elementu. \n\nval() / val(value) \nPobiera lub ustawia wartość pola formularza. \n\n\n\n5. Zarządzanie klasami CSS\n\naddClass(className) \nDodaje klasę do elementu. \n\nremoveClass(className) \nUsuwa klasę z elementu. \n\ntoggleClass(className) \nDodaje lub usuwa klasę (przełącznik). \n\nhasClass(className) \nSprawdza, czy element ma daną klasę. \n\n\n\n6. Atrybuty HTML\n\nattr(attribute) lub attr(attribute, value) \nPobiera lub ustawia atrybut. \n\nremoveAttr(attribute) \nUsuwa atrybut. \n\n\n\n7. Traversing DOM (przemieszczanie się po drzewie DOM)\n\nparent() \nBezpośredni rodzic elementu. \n\nparents() \nWszyscy przodkowie elementu. \n\nchildren() \nWszystkie dzieci elementu. \n\nfind(selector) \nElementy zagnieżdżone w elemencie, pasujące do selektora. \n\nsiblings() \nRodzeństwo tego samego rodzica. \n\nnext() \nNastępny element na tym samym poziomie. \n\nnextAll() \nWszystkie następne elementy. \n\nnextUntil(selector) \nWszystkie następne aż do określonego selektora (nie wliczając go). \n\nprev() \nPoprzedni element. \n\nprevAll() \nWszystkie poprzednie elementy. \n\nprevUntil(selector) \nWszystkie poprzednie aż do określonego selektora (nie wliczając go). \n\nfirst() \nPierwszy element kolekcji. \n\nlast() \nOstatni element kolekcji. \n\neq(index) \nElement o wskazanym indeksie (0-based). \n\nfilter(selector) \nFiltruje elementy kolekcji wg selektora. \n\nnot(selector) \nZwraca elementy kolekcji, które nie pasują do selektora. \n";

const version = "Versja 0.0.1";

const copyright = "(c) adasieqk 2025";

let textWidget;

Page({
  build() {

    textWidget = hmUI.createWidget(hmUI.widget.TEXT, {
      x: 20,
      y: 60,
      w: 280,
      h: 50,
      color: 0xC0C0C0,
      text_size: 15,
      align_h: hmUI.align.LEFT,
      align_v: hmUI.align.TOP,
      text_style: hmUI.text_style.WRAP,
      text: version
    });

    textWidget = hmUI.createWidget(hmUI.widget.TEXT, {
      x: 20,
      y: 85,
      w: 280,
      h: 50,
      color: 0xC0C0C0,
      text_size: 15,
      align_h: hmUI.align.LEFT,
      align_v: hmUI.align.TOP,
      text_style: hmUI.text_style.WRAP,
      text: copyright
    });

    textWidget = hmUI.createWidget(hmUI.widget.TEXT, {
      x: 20,
      y: 130,
      w: 280,
      h: 8000,
      color: 0xffffff,
      text_size: 20,
      align_h: hmUI.align.LEFT,
      align_v: hmUI.align.TOP,
      text_style: hmUI.text_style.WRAP,
      text: note
    });
  }
});
