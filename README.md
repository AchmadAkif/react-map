# React Map

**A browser extension for visualizing your React application's component hierarchy in real-time.**

This project is being developed to fulfill the requirements for my bachelor's degree. It's an extension that visualizes React components by patching the React Devtools global hook.

---

## How It Works

`react-map` works by tapping into the React Devtools global hook (`__REACT_DEVTOOLS_GLOBAL_HOOK__`). By patching this hook, it can intercept information about your React application's component structure, including the fiber tree, and use it to render a visual map. This allows you to "see" your app's architecture at a glance.

---

## Installation

### Prerequisites

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

## Academic Context

This project is a key component of my thesis for my bachelor's degree. The primary goal is to explore how developers can gain better insights into their applications through advanced tooling and visualization techniques.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

*Authored by AchmadAkif*
