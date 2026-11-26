import JsonView from "@uiw/react-json-view";
import { lightTheme } from "@uiw/react-json-view/light";
import type { ReactNode } from "react";

const isJsxLikeComponentName = (value: string) => value.includes("/>");

export const getValueTypeClass = (value: unknown): string | undefined => {
  if (value === null || value === "__react_map_undefined__") {
    return "text-amber-500 dark:text-amber-400";
  }

  switch (typeof value) {
    case "string":
      if (isJsxLikeComponentName(value)) {
        return "text-slate-700 dark:text-slate-400";
      }
      if (value === "f()" || value === "ƒ()") {
        return "text-fuchsia-500 dark:text-fuchsia-400";
      }
      return "text-violet-500 dark:text-violet-400";
    case "number":
      return "text-sky-500 dark:text-sky-400";
    case "boolean":
      return "text-emerald-500 dark:text-emerald-400";
    case "bigint":
      return "text-cyan-500 dark:text-cyan-400";
    case "undefined":
      return "text-amber-500 dark:text-amber-400";
    case "symbol":
      return "text-rose-500 dark:text-rose-400";
    case "function":
      return "text-fuchsia-500 dark:text-fuchsia-400";
    case "object":
      return undefined;
    default:
      return undefined;
  }
};

export const renderValue = (value: unknown): ReactNode => {
  switch (typeof value) {
    case "string":
      if (value === "__react_map_undefined__") {
        return "undefined";
      }
      if (value === "f()" || value === "ƒ()") {
        return "ƒ()";
      }
      if (isJsxLikeComponentName(value)) {
        return value;
      }
      return `"${value}"`;
    case "number":
    case "boolean":
    case "bigint":
      return (value as number | boolean | bigint).toString();
    case "undefined":
      return "undefined";
    case "symbol":
      return value.toString();
    case "function":
      return "ƒ()";
    case "object":
      if (value === null) {
        return "null";
      }
      return (
        <JsonView
          value={value as object}
          style={lightTheme}
          collapsed={true}
          displayDataTypes={false}
          enableClipboard={true}
          displayObjectSize={false}
        />
      );
    default:
      return String(value);
  }
};
