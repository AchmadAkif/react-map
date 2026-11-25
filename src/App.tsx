import { MainContainer, ErrorPage } from "@/containers";
import { Spinner } from "@/components/ui/spinner";
import { useBridgeConnection } from "@/hooks";

function App() {
  const {
    currentFiberTree,
    selectedNodeData,
    selectedNodePath,
    status,
    statusMessage,
    handleSelectedNodeChange,
    handleRetry,
  } = useBridgeConnection();

  if (status === "success" && currentFiberTree) {
    return (
      <MainContainer
        data={currentFiberTree}
        selectedNodeData={selectedNodeData}
        selectedNodePath={selectedNodePath}
        onSelectedNodeChange={handleSelectedNodeChange}
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
