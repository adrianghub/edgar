export interface ChatState {
  shortcuts: Shortcut[];
  query: string;
  answer: string;
  typing: boolean;
  messages: Message[];
}

export interface Message {
  content: string;
  role: "user" | "bot";
}

export interface Shortcut {
  id: number;
  name: string;
  type: MessageType;
  group?: MessageGroup;
  keystroke: string;
}

export type MessageType = "query" | "save" | "remember" | "forget";
type MessageGroup = "memories" | "notes" | "links" | "actions";
