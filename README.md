# React + Vite + CRXJS

This template helps you quickly start developing Chrome extensions with React, TypeScript and Vite. It includes the CRXJS Vite plugin for seamless Chrome extension development.

## Features

- React with TypeScript
- TypeScript support
- Vite build tool
- CRXJS Vite plugin integration
- Chrome extension manifest configuration

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Start development server:

```bash
npm run dev
```

3. Open Chrome and navigate to `chrome://extensions/`, enable "Developer mode", and load the unpacked extension from the `dist` directory.

4. Build for production:

```bash
npm run build
```

## Project Structure

- `src/popup/` - Extension popup UI
- `src/content/` - Content scripts
- `manifest.config.ts` - Chrome extension manifest configuration

## Documentation

- [React Documentation](https://reactjs.org/)
- [Vite Documentation](https://vitejs.dev/)
- [CRXJS Documentation](https://crxjs.dev/vite-plugin)

## Chrome Extension Development Notes

- Use `manifest.config.ts` to configure your extension
- The CRXJS plugin automatically handles manifest generation
- Content scripts should be placed in `src/content/`
- Popup UI should be placed in `src/popup/`

## Authentication (Clerk)

This project integrates Clerk for authentication in the popup, sidepanel, and options pages using `@clerk/chrome-extension`.

Setup:

1. Install deps (already added):
   - `@clerk/chrome-extension`
2. Create a Clerk application and copy your Publishable Key.
3. Expose the key to Vite via an env var named `VITE_CLERK_PUBLISHABLE_KEY`.

On Windows PowerShell:

```bash
$env:VITE_CLERK_PUBLISHABLE_KEY="pk_test_xxx"
npm run dev
```

On Unix shells:

```bash
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxx npm run dev
```

The UI will show a "Log in" button in the sidepanel and Glossary settings when signed out, and a `UserButton` when signed in. Sign-in is opened in a popup.
