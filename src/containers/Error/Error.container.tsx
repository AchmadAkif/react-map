import { Text } from "@radix-ui/themes";

const Error = () => {
  return (
    <div className="h-screen flex flex-col item items-center justify-center">
      <Text>
        Cannot render react component tree. Triggering a setState() usually
        fixes this.
      </Text>
      <Text>Note: React-Map works best on local projects with React v16+</Text>
    </div>
  );
};

export default Error;
