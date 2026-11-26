import { XIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { Skeleton } from "../ui/skeleton";
import { StatePanel } from "../StatePanel";
import { PropsPanel } from "../PropsPanel";
import { TextPanel } from "../TextPanel";
import type {
  ComponentDetailsProps,
  NodeDetailsProps,
} from "./ComponentDetails.types";

const NodeDetails = ({ details }: NodeDetailsProps) => {
  const { state, classState, text } = details;
  const hasStateSection = state !== undefined || classState !== undefined;

  return (
    <>
      <Separator className="mb-2" />
      {text !== undefined ? (
        <TextPanel text={text} />
      ) : (
        <>
          {hasStateSection && (
            <>
              <StatePanel selectedNode={details} />
              <Separator className="my-2" />
            </>
          )}
          <PropsPanel selectedNode={details} />
        </>
      )}
    </>
  );
};

export const ComponentDetails = ({
  selection,
  isHidden,
  onDeselectNode,
}: ComponentDetailsProps) => {
  if (selection.status === "none") {
    return (
      <p className="px-4 text-slate-500 dark:text-slate-400">
        Select a node to see its state and props
      </p>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between gap-3 px-4 pb-2">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <p className="font-bold text-blue-500">{selection.name}</p>
          <div role="status" className="flex">
            {selection.status === "unmounted" && (
              <Badge variant="destructive">Unmounted</Badge>
            )}
            {isHidden && <Badge variant="secondary">Hidden in tree</Badge>}
          </div>
        </div>
        <Button
          aria-label="Deselect node"
          size="icon-sm"
          variant="ghost"
          onClick={onDeselectNode}
        >
          <XIcon />
        </Button>
      </div>

      {selection.status === "loading" && (
        <div
          role="status"
          aria-label="Loading details"
          className="flex flex-col gap-2 px-4"
        >
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      )}

      {selection.status !== "loading" && selection.details && (
        <div className={cn(selection.status === "unmounted" && "opacity-50")}>
          <NodeDetails details={selection.details} />
        </div>
      )}
    </div>
  );
};
