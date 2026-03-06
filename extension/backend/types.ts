export type SerializableFiberNode = {
  name: string;
  children: SerializableFiberNode[];
};

export type Message = {
  payload: object | string;
  source: string;
};
