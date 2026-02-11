/* eslint-disable @typescript-eslint/no-explicit-any */
const hasReactDevtoolsInstalled =
  (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__ && true;
const __REACT_DEVTOOLS_GLOBAL_HOOK__ = (window as any)
  .__REACT_DEVTOOLS_GLOBAL_HOOK__;

if (hasReactDevtoolsInstalled) {
  console.log("**installHook** has React Devtools");
  console.log(__REACT_DEVTOOLS_GLOBAL_HOOK__);
} else {
  console.log("Please install React Devtool");
}
