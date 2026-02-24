# Steel Sheet Weight and Price Calculator

A mobile app for calculating per-sheet weight and cost from steel coil parameters.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [Expo CLI](https://docs.expo.dev/) — installed automatically via npx
- [Expo Go](https://expo.dev/go) app on your phone (iOS or Android)

## Setup

```bash
npm install
```

## Run the app

```bash
npx expo start
```

Scan the QR code with Expo Go (Android) or the Camera app (iOS) to open on your device.

## Example workflow

1. Open the app and select a **thickness** (e.g. 0.1 mm) and **coil width** (e.g. 1000 mm) the running length auto-fills to 1270 m/ton.
2. Enter the **material cost** (e.g. 250,000 Rs).
3. Select one or more **sheet sizes** (e.g. 8 ft, 10 ft).
4. Tap **Calculate** to see the number of sheets, weight per sheet, and cost per sheet.
5. Tap **Save to History** to store the result, or use **Copy / Share / Image** to send it to others.
6. Visit the **History** tab to review past calculations or tap **Edit** to re-run with different values.

## Run tests

```bash
npm test
```
