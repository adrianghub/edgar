export interface ChatState {
    apikey: string,
    model: Model,
    max_tokens: number,
    temperature: number,
    stream: boolean,
    messages: Message[],
    shortcuts: Shortcut[],
    query: string,
    answer: string,
    typing: boolean
}

export interface Shortcut {
    id: number,
    name: string,
    system: string,
    keystroke: string
}

export interface Message {
    role: 'assistant' | 'user' | 'system';
    content: string;
}

export type Model = 'gpt-4' | 'gpt-3.5-turbo'
