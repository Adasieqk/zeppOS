# Zepp OS Apps

## Apps:

### Text Viewer

-   [0.0.1](https://github.com/Adasieqk/zeppOS/blob/main/textViewer/0.0.1)

### Image Viewer

-   [0.0.1](https://github.com/Adasieqk/zeppOS/blob/main/imageViewer/0.0.1)

### Text + Image Viewer

-   [0.0.1](https://github.com/Adasieqk/zeppOS/blob/main/textImageViewer/0.0.1)

## Setup

-   Open command line and enter `npm i @zeppos/zeus-cli -g`
-   Paste the app folder into `C:\Users\username`
-   Type `cd 0.0.1` (app folder name)
-   Type in `zeus preview`, wait a moment and a QR code should be generated
-   Pick your watch model and click Enter
-   Enable developer mode: Zepp App => Profile (top right corner) => Settings => About => Click Zepp logo 7 times => Go back to Home Page
-   Go into Device => General => Developer Mode => Mini Program => "+" icon (top right corner) => scan the QR code from the cmd
    The app will install itself and appear in the app menu on your watch.

If you don't have an Amazfit watch, you can download Zepp Simulator from this [link](https://docs.zepp.com/docs/guides/tools/simulator/download/).
Install the program and open it, the app should be shown in the "Apps" section. To open turn on the emulator, click "Emulator" in the top left of the program.

## Important:

At the moment you can add your text and photos only by modifying the code. To do that, navigate to the app folder, open folders page => gt => home => index.page.js

-   For text, you have to modify the `note` const. For the app to display new lines ('enters'), add \n after each line.
-   For photos, you have to add photos (.png) to the assets => gt.r _and/or_ gtr.s folders (depending on your type of watch - round or square)
