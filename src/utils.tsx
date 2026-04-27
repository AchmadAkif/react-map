import JsonView from "@uiw/react-json-view";
import { lightTheme } from "@uiw/react-json-view/light";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const renderValue = (value: any) => {
  switch (typeof value) {
    case "string":
      return `"${value}"`;
    case "number":
    case "boolean":
    case "bigint":
      return value.toString();
    case "undefined":
      return "undefined";
    case "symbol":
      return value.toString();
    case "function":
      return "ƒ()"; // Using ƒ to denote a function
    case "object":
      if (value === null) {
        return "null";
      }
      // For arrays and objects, use JsonView
      return (
        <JsonView
          value={value}
          style={lightTheme}
          collapsed={true}
          displayDataTypes={false}
          enableClipboard={true}
          displayObjectSize={false}
        />
      );
    default:
      // Fallback for any other types
      return String(value);
  }
};
