import { getValueTypeClass, renderValue } from "@/utils";
import type { ValueListProps } from "./ValueList.types";

export const ValueList = ({ values }: ValueListProps) => {
  const entries = Object.entries(values ?? {});

  if (entries.length === 0) return <p>None</p>;

  return (
    <dl className="w-full flex flex-col gap-1">
      {entries.map(([key, value]) => (
        <div key={key} className="flex gap-2">
          <dt className="min-w-20">{key}</dt>
          <dd className={getValueTypeClass(value)}>{renderValue(value)}</dd>
        </div>
      ))}
    </dl>
  );
};
