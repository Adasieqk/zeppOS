# Amazfit Watch Apps

A collection of simple viewer applications for Amazfit smartwatches built using ZeppOS.

## Apps

### Text Viewer
Version: 0.0.1
Display and view text content on your Amazfit watch.

### Image Viewer
Version: 0.0.1
View images directly on your Amazfit watch.

### Text + Image Viewer
Version: 0.0.1
Combined viewer for both text and images.

---

## Setup Instructions

### Prerequisites
- Amazfit smartwatch OR [Zepp Simulator](https://docs.zepp.com/docs/guides/tools/simulator/)
- Node.js installed on your system
- ZeppOS CLI tools

### Installation Steps

1. **Install ZeppOS CLI**
   ```bash
   npm i @zeppos/zeus-cli -g
   ```

2. **Navigate to the app directory**
   ```bash
   cd C:\users\username
   ```

3. **Create app folder**
   ```bash
   cd 0.0.1
   ```
   *(Use your app folder name)*

4. **Initialize preview mode**
   ```bash
   zeus preview
   ```
   Wait for the QR code to be generated.

5. **Select your watch model**
   
   Pick your Amazfit watch model and press Enter.

6. **Enable Developer Mode on Watch**
   - Open Zepp App
   - Go to Profile (top right corner)
   - Navigate to Settings
   - Go to About
   - Tap the Zepp logo **7 times**
   - Return to Home Page

7. **Install the App**
   - On your watch: Device → General → Developer Mode → Mini Program
   - Tap the **+** icon (top right corner)
   - Scan the QR code from the command line
   - The app will install and appear in the app menu

### For Simulator Users

If you dont have an Amazfit watch, download the [Zepp Simulator](https://docs.zepp.com/docs/guides/tools/simulator/). After installation, the app will appear in the "Apps" section. Click "Emulator" in the top left of the program to launch it.

---

## Important Notes

### Adding Content

Currently, you can add text and photos by modifying the code directly.

**File Location:** `app folder → page → gt → home → index.page.js`

#### Adding Text
- Modify the `note` constant
- Add `\n` after each line to create new lines

#### Adding Photos
- Add photos (`.png` format) to the `assets → gt` and/or `gtr3` folders
  - `gt` folder: for round watches
  - `gtr3` folder: for square watches

