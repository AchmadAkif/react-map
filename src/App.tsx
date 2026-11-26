import { MainContainer, ErrorPage } from "@/containers";
import { Spinner } from "@/components/ui/spinner";
import { useBridgeConnection } from "@/hooks";

function App() {
  const {
    currentFiberTree,
    collapsedBranches,
    selection,
    status,
    statusMessage,
    handleToggleBranch,
    handleSelectNode,
    handleDeselectNode,
    handleRetry,
  } = useBridgeConnection();

  if (status === "success" && currentFiberTree) {
    return (
      <MainContainer
        data={currentFiberTree}
        collapsedBranches={collapsedBranches}
        onToggleBranch={handleToggleBranch}
        selection={selection}
        onSelectNode={handleSelectNode}
        onDeselectNode={handleDeselectNode}
      />
    );
  }

  if (status === "loading") {
    return (
      <div className="h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (status === "extension-reloaded") {
    return (
      <ErrorPage
        title="Extension reloaded"
        message={statusMessage}
        showSetupHints={false}
      />
    );
  }

  return (
    <ErrorPage
      title={
        status === "no-react" ? "No React tree captured" : "Connection failed"
      }
      message={statusMessage}
      actionLabel="Retry"
      onAction={handleRetry}
    />
  );
}

export default App;
