import { XIcon } from "lucide-react";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { Skeleton } from "../ui/skeleton";
import { StatePanel } from "../StatePanel";
import { PropsPanel } from "../PropsPanel";
import { TextPanel } from "../TextPanel";
import type {
  ComponentDetailsProps,
  LiveDetailsProps,
} from "./ComponentDetails.types";

const LiveDetails = ({ details }: LiveDetailsProps) => {
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
        <p className="font-bold text-blue-500">{selection.name}</p>
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

      {selection.status === "unmounted" && (
        <p className="mx-2 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-600 dark:text-amber-400">
          This node is no longer present in the React tree.
        </p>
      )}

      {selection.status === "live" && (
        <LiveDetails details={selection.details} />
      )}
    </div>
  );
};
