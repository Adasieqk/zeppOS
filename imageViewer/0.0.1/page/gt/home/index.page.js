import * as hmUI from "@zos/ui";

const version = "Version 0.0.1";

const copyright = "(c) adasieqk 2025";

let textWidget;

Page({
  build() {

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

    const img1 = hmUI.createWidget(hmUI.widget.IMG, {
      x: 0,
      y: 140,
      auto_scale: 1,
      w: 390,
      h: 285,
      src: 'methods.png'
    });

    const img2 = hmUI.createWidget(hmUI.widget.IMG, {
      x: 0,
      y: 450,
      auto_scale: 1,
      w: 390,
      h: 285,
      src: 'methods.png'
    });

    const img3 = hmUI.createWidget(hmUI.widget.IMG, {
      x: 0,
      y: 760,
      auto_scale: 1,
      w: 390,
      h: 285,
      src: 'methods.png'
    });

    const img4 = hmUI.createWidget(hmUI.widget.IMG, {
      x: 0,
      y: 1070,
      auto_scale: 1,
      w: 390,
      h: 285,
      src: 'methods.png'
    });

    hmUI.createWidget(hmUI.widget.FILL_RECT, {
      x: 0,
      y: 1355,
      w: 360,
      h: 100,
      color: 0x000000,
      alpha: 0
    });

    // img.addEventListener(hmUI.event.CLICK_DOWN, (info) => {
    //   img.setProperty(hmUI.prop.MORE, {
    //     src: 'image.png',
    //     auto_scale: 1,
    //     y: 8030,
    //     h: 200,
    //     w: 200
    //   });
    // });

  }
});
