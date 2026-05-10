import * as React from "react";
import { ChevronsUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { DisplayPreferences } from "../DisplayPreferences";

import type { OrientationPreferenceProps } from "../OrientationPreference/OrientationPreference.types";
import type { FilterPreferenceProps } from "../FilterPreference/FilterPreference.types";
import type { SpacingPreferenceProps } from "../SpacingPreference/SpacingPreference.types";

type PreferencesCollapsibleProps = OrientationPreferenceProps &
  FilterPreferenceProps &
  SpacingPreferenceProps;

export default function CollapsibleDemo({
  handleFilterChange,
  handleNodeSpacingChange,
  handleSetOrientation,
  nodeSpacing,
  treeFilters,
  treeOrientation,
}: PreferencesCollapsibleProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="flex flex-col gap-2"
    >
      <div className="flex items-center justify-between gap-4">
        <h4 className="text-sm font-semibold">Preferences</h4>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="icon" className="size-8">
            <ChevronsUpDown />
            <span className="sr-only">Toggle details</span>
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="flex flex-col gap-2">
        <DisplayPreferences
          treeOrientation={treeOrientation}
          nodeSpacing={nodeSpacing}
          handleSetOrientation={handleSetOrientation}
          handleNodeSpacingChange={handleNodeSpacingChange}
          treeFilters={treeFilters}
          handleFilterChange={handleFilterChange}
        />
      </CollapsibleContent>
    </Collapsible>
  );
}
