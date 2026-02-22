export type SerializableFiberNode = {
  name: string;
  children: SerializableFiberNode[];
};

export type Message = {
  payload: object;
  source: string;
};
