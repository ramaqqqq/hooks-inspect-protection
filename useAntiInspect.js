import { useEffect } from "react";

/**
 * A React hook that detects when a user opens the developer tools and deletes all local and session storage,
 * clears all cookies, and disables console logging.
 *
 * It detects when the developer tools are opened by listening for window resizes, right clicks, and certain keyboard shortcuts.
 * It also disables the console logging functions.
 *
 * The hook returns a cleanup function that should be called when the component is unmounted.
 *
 * @returns {Function} A cleanup function that should be called when the component is unmounted.
 */
const useAntiInspect = () => {
  useEffect(() => {
    /**
     * Checks if the developer tools are open by comparing the window's outer width to its inner width
     * and checking if the F12 key was pressed.
     *
     * @param {KeyboardEvent} e - The keyboard event, if applicable.
     */
    const detectDevTools = (e) => {
      const widthThreshold = window.outerWidth - window.innerWidth > 160;
      const heightThreshold = window.outerHeight - window.innerHeight > 160;

      const isF12 = e?.keyCode === 123;

      if (widthThreshold || heightThreshold || isF12) {
        handleDevToolsOpen();
      }
    };

    /**
     * Disables the right-click menu by preventing the default event and calling the `handleDevToolsOpen` function.
     * This function is used as an event listener for the contextmenu event.
     *
     * @param {MouseEvent} e - The mouse event.
     */
    const disableRightClick = (e) => {
      e.preventDefault();
      handleDevToolsOpen();
    };

    /**
     * Disables keyboard shortcuts that could open the developer tools.
     *
     * It checks for the following keyboard shortcuts:
     * - Ctrl+Shift+I (Elements)
     * - Ctrl+Shift+J (Console)
     * - Ctrl+Shift+C (Elements)
     * - Ctrl+U (View Source)
     * - F12 (Toggle Developer Tools)
     *
     * If any of these shortcuts are pressed, it calls the `handleDevToolsOpen` function.
     *
     * @param {KeyboardEvent} e - The keyboard event.
     */
    const disableKeyboardShortcuts = (e) => {
      // Ctrl+Shift+I or Ctrl+Shift+J or Ctrl+Shift+C
      if (
        (e.ctrlKey &&
          e.shiftKey &&
          (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) ||
        // Ctrl+U (View Source)
        (e.ctrlKey && e.keyCode === 85) ||
        // F12
        e.keyCode === 123
      ) {
        e.preventDefault();
        handleDevToolsOpen();
      }
    };

    /**
     * Clears local and session storage, and deletes all cookies.
     *
     * This function is called when developer tools are detected to be open.
     * It removes all data from localStorage and sessionStorage, and iterates
     * through the document's cookies to delete each one by setting its expiry
     * date to a past date.
     */
    const handleDevToolsOpen = () => {
      localStorage.clear();
      sessionStorage.clear();

      document.cookie.split(";").forEach((cookie) => {
        document.cookie = cookie
          .replace(/^ +/, "")
          .replace(/=.*/, `=;expires=${new Date(0).toUTCString()};path=/`);
      });
    };

    window.addEventListener("resize", detectDevTools);
    document.addEventListener("contextmenu", disableRightClick);
    document.addEventListener("keydown", disableKeyboardShortcuts);

    const consoleOutput = console.log;
    console.log = function () {};
    console.warn = function () {};
    console.error = function () {};
    console.debug = function () {};
    console.info = function () {};

    // Cleanup function
    return () => {
      window.removeEventListener("resize", detectDevTools);
      document.removeEventListener("contextmenu", disableRightClick);
      document.removeEventListener("keydown", disableKeyboardShortcuts);
      console.log = consoleOutput;
    };
  }, []);
};

export default useAntiInspect;
