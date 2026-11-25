import { useEffect } from "react";

/** Deselects on Esc while a node is selected. */
export function useDeselectOnEscape(
  hasSelection: boolean,
  onDeselectNode: () => void,
) {
  useEffect(() => {
    if (!hasSelection) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // A popover that closes on Esc prevents the default; let it have the key.
      if (event.key !== "Escape" || event.defaultPrevented) return;
      event.preventDefault();
      event.stopPropagation();
      onDeselectNode();
    };

    // On body rather than document, where DevTools takes Esc for its drawer.
    document.body.addEventListener("keydown", handleKeyDown);
    return () => document.body.removeEventListener("keydown", handleKeyDown);
  }, [hasSelection, onDeselectNode]);
}
