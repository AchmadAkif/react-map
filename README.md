# React Map

**A browser extension for visualizing your React application's component hierarchy in real-time.**

<img width="1918" height="909" alt="Screenshot 2026-05-17 130342" src="https://github.com/user-attachments/assets/1a1aca36-2b1c-46e1-8d35-959c3bfc99fa" />

This project is being developed to fulfill the requirements for my bachelor's degree. It's an extension that visualizes React components by patching the React Devtools global hook.

---

## How It Works

`react-map` works by tapping into the React Devtools global hook (`__REACT_DEVTOOLS_GLOBAL_HOOK__`). By patching this hook, it can intercept information about your React application's component structure, including the fiber tree, and use it to render a visual map. This allows you to "see" your app's architecture at a glance.

---

## Installation

### Prerequisites

**React Version:** React v16.8 or higher (requires React Fiber architecture and Hooks support).

**IMPORTANT:** `react-map` relies on the official **React Developer Tools** extension to intercept the fiber tree. Please ensure it is installed and enabled in your browser before proceeding:
* [React DevTools for Chrome](https://chromewebstore.google.com/detail/react-developer-tools/fmkadmapgofadopljbhfbcabpbmnoobm)

### 💻 Standard Installation (Recommended)

The easiest way to use `react-map` is to install it directly from the official store:

1. Visit the [React-Map page on the Chrome Web Store](https://chromewebstore.google.com/detail/react-map/oeainfdgfdepkmpelemllinkpfiohglo).
2. Click **"Add to Chrome"**.
3. Once the installation is complete, the tool will automatically integrate into your browser's Developer Tools.

### 🛠️ For Contributors & Local Development (Manual Installation)

If you want to run the latest cutting-edge code from source, modify the extension, or contribute to development:

### Chrome

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/AchmadAkif/react-map.git](https://github.com/AchmadAkif/react-map.git)
    ```
2.  **Build the extension locally:**
    ```bash
    cd react-map
    npm install
    npm run build
    ```
    This will compile the project into a production-ready `dist` or `build` directory.
3.  **Load the unpacked extension:**
    * Navigate to `chrome://extensions` in your browser.
    * Enable **"Developer mode"** using the toggle switch in the top-right corner.
    * Click the **"Load unpacked"** button in the top-left.
    * Select the compiled `dist` or `build` directory from your cloned repository.

### Firefox

*(Not yet available. Will be added in the future)*

---

## Usage

1.  Once installed, open the Developer Tools in your browser (usually by pressing `F12` or `Ctrl+Shift+I`).
2.  Look for the "**React Map**" tab and click on it.
3.  The panel will display the component map of the React application running on the current page.

## Development & Contributing

Contributions are welcome! If you'd like to contribute to the development of `react-map`, please follow these steps:

1.  **Fork the repository.**
2.  **Create a new branch:** `git checkout -b feature/your-feature-name`
3.  **Make your changes.**
4.  **Commit your changes:** `git commit -m "Add some feature"`
5.  **Push to the branch:** `git push origin feature/your-feature-name`
6.  **Open a Pull Request.**

### Development Scripts

*   `npm install`: Installs all dependencies.
*   `npm run dev`: Starts the development server with hot-reloading.
*   `npm run build`: Bundles the extension for production.
*   `npm run lint`: Lints the codebase.
*   `npm test`: Runs the Vitest unit test suite.

---

## Changelog

### `v1.0.0` (2026-11-26) — Node-Inspection Flow Redesign
*(Chrome Web Store manifest `version: 1.0.2`, `version_name: 1.0.0`)*
* **Click-to-select inspection:** Replaced the previous lock/pin workflow with direct click-to-select component inspection (#51, #53, #63).
* **Dedicated `+/-` branch collapsing:** Added explicit `+/-` collapse/expand controls on tree nodes and preserved collapsed branch state across live React re-renders (#52, #60).
* **Cleaner tree by default:** Hidden DOM/host nodes by default so the React component hierarchy is immediately readable (#55).
* **Instance-following selection & clear states:** Selection tracks the component instance across updates (#57), shows details tailored to each node type (#56), clearly indicates unmounted or hidden nodes (#58), and automatically clears on page reload or panel close (#59).
* **Search selects the node:** Jumping to a search result now selects and inspects that component directly (#54).
* **Resilient reconnection:** Automatically reconnects the DevTools panel when the background service worker stops and keeps the selected node in sync (#61, #62).
* **Architecture & testing:** Optimized the backend fiber crawler, broke circular dependencies, refactored frontend state management, and added a unit test suite (120 tests) along with a domain glossary and ADR.

### `v1.0.0-beta.3` (2026-10-03)
* Removed unnecessary `tabs` and `activeTab` permissions from `manifest.json` (#46, #49).
* Added a project screenshot and explicit React v16.8+ prerequisites to the README (#47, #48).

### `v1.0.0-beta.2` (2026-05-22)
* Opened the **Display Preferences** collapsible panel by default and clarified its header label (#44, #45).
* Updated installation and usage documentation.

### `v1.0.0-beta.1` (2026-05-16)
* Added live state-panel inspection with node path tracking, minimal tree serialization, and live-updating locked/pinned node inspection (#42, #43).
* Integrated resizable split panels (`react-resizable-panels`) for the tree and inspector layout.
* Added type-based syntax coloring for values in `ComponentDetails`, `PropsPanel`, and `StatePanel` (#38).
* Fixed serialization crashes on `Symbol()` values (#35) and improved error state messaging.
* Simplified theming by removing manual theme-selection overhead (#40).

### `v0.1.0` (2026-02-05 – 2026-05-10) — Initial Development
* **Extension & Fiber Hook Foundation:** Built the Chrome Manifest V3 DevTools extension with Vite, React, and TypeScript; patched `__REACT_DEVTOOLS_GLOBAL_HOOK__.onCommitFiberRoot`; implemented a debounced React Fiber crawler (`traverseFiber`) and `localhost`-scoped messaging bridge between the injected hook, content script, background service worker, and DevTools panel.
* **Tree Visualization & Controls:** Integrated `react-d3-tree`, Tailwind CSS, and shadcn/Radix UI; added tree filtering, orientation and node spacing preferences, center-on-click, and `cmdk`-powered component search (`SearchBar`).
* **Props & State Inspection:** Added `ComponentDetails`, `PropsPanel`, `StatePanel`, `StateBadge`, and `@uiw/react-json-view` with support for React elements, `ForwardRef`, raw text nodes, circular references, depth limits, initial mounted fiber root hydration, and loading/error states.

---

## Academic Context

This project is a key component of my thesis for my bachelor's degree. The primary goal is to explore how developers can gain better insights into their applications through advanced tooling and visualization techniques.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

*Authored by AchmadAkif*
