// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const renderValue = (value: any) => {
  if (typeof value === "string") {
    return `"${value}"`;
  }

  if (typeof value === "undefined") {
    return `undefined`;
  }

  return JSON.stringify(value);
};
