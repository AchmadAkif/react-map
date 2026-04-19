// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const renderValue = (value: any) => {
  if (typeof value === "string") {
    return `"${value}"`;
  }
  return JSON.stringify(value);
};
