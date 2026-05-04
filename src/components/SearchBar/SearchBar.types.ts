import type { renderedNode } from "@/types";

export type SearchBarProps = {
  selectedValue: renderedNode;
  onSelectedValueChange: (value: renderedNode) => void;
  searchValue: string;
  onSearchValueChange: (value: string) => void;
  items: renderedNode[];
  isLoading?: boolean;
  emptyMessage?: string;
  placeholder?: string;
};
