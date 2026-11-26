import { Button } from "@/components/ui/button";

export type ErrorPageProps = {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  showSetupHints?: boolean;
};

export const ErrorPage = ({
  title,
  message,
  actionLabel = "Retry",
  onAction,
  showSetupHints = true,
}: ErrorPageProps) => {
  return (
    <div className="h-screen flex flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="max-w-sm space-y-2">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p>{message}</p>
        {showSetupHints ? (
          <>
            <p>
              React-Map captures the tree after React commits. If the page is
              idle, trigger a render or state change, then retry.
            </p>
            <p>
              <span className="font-bold">Note</span>: React-Map works best on
              <span className="font-bold"> local projects</span> with React v16+
              and Make sure you have the official{" "}
              <span className="font-bold"> React Devtools installed</span>
            </p>
          </>
        ) : null}
      </div>
      {onAction ? (
        <Button onClick={onAction} variant="outline">
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
};
