import React from "react";
import { cn } from "@/lib/utils";
import { Command as CommandPrimitive } from "cmdk";
import { Check } from "lucide-react";
import { useMemo, useState } from "react";
import type { NodeRef } from "@/types";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "../ui/command";
import { Input } from "../ui/input";
import { Popover, PopoverAnchor, PopoverContent } from "../ui/popover";
import { Skeleton } from "../ui/skeleton";

export type SearchBarProps = {
  nodes: NodeRef[];
  selectedNodePath: string | null;
  onChooseNode: (node: NodeRef) => void;
  isLoading?: boolean;
  emptyMessage?: string;
  placeholder?: string;
};

// cmdk cannot highlight an item with an empty value, such as the root's path.
const toItemValue = (nodePath: string) => `node:${nodePath}`;

export function SearchBar({
  nodes,
  selectedNodePath,
  onChooseNode,
  isLoading,
  emptyMessage = "Cannot find node with that name.",
  placeholder = "Search node...",
}: SearchBarProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const nodesByItemValue = useMemo(
    () => new Map(nodes.map((node) => [toItemValue(node.nodePath), node])),
    [nodes],
  );

  const onInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (!e.relatedTarget?.hasAttribute("cmdk-list")) {
      setSearchValue("");
    }
  };

  const handleChoose = (node: NodeRef) => {
    onChooseNode(node);
    setSearchValue("");
    setOpen(false);
  };

  return (
    <div className="flex items-center">
      <Popover open={open} onOpenChange={setOpen}>
        <Command
          filter={(value, search) => {
            const name = nodesByItemValue.get(value)?.name ?? "";
            return name.toLowerCase().includes(search.toLowerCase()) ? 1 : 0;
          }}
        >
          <PopoverAnchor asChild>
            <CommandPrimitive.Input
              asChild
              value={searchValue}
              onValueChange={setSearchValue}
              onKeyDown={(e) => setOpen(e.key !== "Escape")}
              onMouseDown={() => setOpen((open) => !!searchValue || !open)}
              onFocus={() => setOpen(true)}
              onBlur={onInputBlur}
            >
              <Input placeholder={placeholder} />
            </CommandPrimitive.Input>
          </PopoverAnchor>
          {!open && <CommandList aria-hidden="true" className="hidden" />}
          <PopoverContent
            asChild
            onOpenAutoFocus={(e) => e.preventDefault()}
            onInteractOutside={(e) => {
              if (
                e.target instanceof Element &&
                e.target.hasAttribute("cmdk-input")
              ) {
                e.preventDefault();
              }
            }}
            className="w-[--radix-popover-trigger-width] p-0"
          >
            <CommandList>
              {isLoading && (
                <CommandPrimitive.Loading>
                  <div className="px-4 py-1">
                    <Skeleton className="h-6 w-full" />
                  </div>
                </CommandPrimitive.Loading>
              )}
              {nodes.length > 0 && !isLoading ? (
                <CommandGroup>
                  {nodes.map((node) => (
                    <CommandItem
                      key={node.nodePath}
                      value={toItemValue(node.nodePath)}
                      onMouseDown={(e) => e.preventDefault()}
                      onSelect={() => handleChoose(node)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedNodePath === node.nodePath
                            ? "opacity-100"
                            : "opacity-0",
                        )}
                      />
                      {node.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              ) : null}
              {!isLoading ? (
                <CommandEmpty>{emptyMessage ?? "No items."}</CommandEmpty>
              ) : null}
            </CommandList>
          </PopoverContent>
        </Command>
      </Popover>
    </div>
  );
}
