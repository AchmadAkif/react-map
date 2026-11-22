import { MainContainer, ErrorPage } from "@/containers";
import { Spinner } from "@/components/ui/spinner";
import { useBridgeConnection } from "@/hooks";

function App() {
  const {
    currentFiberTree,
    lockedNodeData,
    lockedNodePath,
    status,
    statusMessage,
    handleLockNodeChange,
    handleRetry,
  } = useBridgeConnection();

  if (status === "success" && currentFiberTree) {
    return (
      <MainContainer
        data={currentFiberTree}
        lockedNodeData={lockedNodeData}
        lockedNodePath={lockedNodePath}
        onLockNodeChange={handleLockNodeChange}
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
