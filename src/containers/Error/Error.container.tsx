const Error = () => {
  return (
    <div className="h-screen flex flex-col item items-center justify-center">
      <p>
        Cannot render react component tree. Triggering a setState() usually
        fixes this and make sure React Devtools extension is installed.
      </p>
      <p>Note: React-Map works best on local projects with React v16+</p>
    </div>
  );
};

export default Error;
