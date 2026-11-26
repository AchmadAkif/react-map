import * as React from "react";
import { ChevronsUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { OrientationPreference } from "../OrientationPreference";
import { FilterPreference } from "../FilterPreference";
import { SpacingPreference } from "../SpacingPreference";

import type { OrientationPreferenceProps } from "../OrientationPreference/OrientationPreference.types";
import type { FilterPreferenceProps } from "../FilterPreference/FilterPreference.types";
import type { SpacingPreferenceProps } from "../SpacingPreference/SpacingPreference.types";

export type PreferencesCollapsibleProps = OrientationPreferenceProps &
  FilterPreferenceProps &
  SpacingPreferenceProps;

export function PreferencesCollapsible({
  handleFilterChange,
  handleNodeSpacingChange,
  handleSetOrientation,
  nodeSpacing,
  treeFilters,
  treeOrientation,
}: PreferencesCollapsibleProps) {
  const [isOpen, setIsOpen] = React.useState(true);

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="flex flex-col gap-2 px-4"
    >
      <div className="flex items-center justify-between gap-4">
        <h4 className="text-sm font-semibold">Display Preferences</h4>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="icon" className="size-8">
            <ChevronsUpDown />
            <span className="sr-only">Toggle details</span>
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="flex flex-col gap-2">
        <div className="flex gap-3">
          <OrientationPreference
            handleSetOrientation={handleSetOrientation}
            treeOrientation={treeOrientation}
          />
          <FilterPreference
            treeFilters={treeFilters}
            handleFilterChange={handleFilterChange}
          />
        </div>
        <SpacingPreference
          nodeSpacing={nodeSpacing}
          handleNodeSpacingChange={handleNodeSpacingChange}
        />
      </CollapsibleContent>
    </Collapsible>
  );
}
