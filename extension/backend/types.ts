export type SerializableFiberNode = {
  name: string;
  children: SerializableFiberNode[];
};

export type Message = {
  payload: MessagePayload | string;
  source: string;
};

export type MessagePayload = {
  name: string;
  children: object[];
};
