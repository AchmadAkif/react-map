import { getValueTypeClass } from "@/utils";
import type { TextPanelProps } from "./TextPanel.types";

export const TextPanel = ({ text }: TextPanelProps) => {
  return (
    <div className="flex flex-col px-4">
      <p className="font-bold">Text</p>
      {/* Page content, so it is shown as is: it never holds the backend's
          placeholders that renderValue looks for. */}
      <p className={getValueTypeClass("")}>{`"${text}"`}</p>
    </div>
  );
};
