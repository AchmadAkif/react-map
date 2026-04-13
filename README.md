# React Map

**A browser extension for visualizing your React application's component hierarchy in real-time.**

This project is being developed to fulfill the requirements for my bachelor's degree. It's an extension that visualizes React components by patching the React Devtools global hook.

---

## Features

*   **Live Visualization**: Get a real-time, interactive tree or graph of your React component structure.
*   **Component Details**: Inspect individual components to see their props and state. (Coming soon!)
*   **Easy to Use**: Simply open the developer tools and navigate to the "React Map" tab.

## How It Works

`react-map` works by tapping into the React Devtools global hook (`__REACT_DEVTOOLS_GLOBAL_HOOK__`). By patching this hook, it can intercept information about your React application's component structure, including the fiber tree, and use it to render a visual map. This allows you to "see" your app's architecture at a glance.

## Installation

As the extension is in development, it is not yet available on the Chrome Web Store or Firefox Add-ons Marketplace. To use it, you'll need to install it manually.

### For Chrome/Edge (and other Chromium browsers)

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/AchmadAkif/react-map.git
    ```
2.  **Build the extension:**
    ```bash
    cd react-map
    npm install
    npm run build
    ```
    This will create a `dist` or `build` directory.
3.  **Load the extension in your browser:**
    *   Navigate to `chrome://extensions` (or `edge://extensions`).
    *   Enable "Developer mode" (usually a toggle in the top-right).
    *   Click on "Load unpacked".
    *   Select the `dist` or `build` directory from the cloned repository.

### For Firefox

*(Not yet available. Will be added in the future)*

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
