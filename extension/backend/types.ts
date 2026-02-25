/* eslint-disable @typescript-eslint/no-explicit-any */
export type SerializableFiberNode = {
  name: string;
  children: SerializableFiberNode[];
};

export type Message = {
  payload: object;
  source: string;
};

export type Port = {
  postMessage: (message: any) => void;
  disconnect: () => void;
  sender?: chrome.runtime.MessageSender | undefined;
  onDisconnect: chrome.events.Event<(port: chrome.runtime.Port) => void>;
  onMessage: chrome.events.Event<
    (message: any, port: chrome.runtime.Port) => void
  >;
  name: string;
};
