import type {IState} from "../stores/main.dt";
import {defaultSystemPrompt, state} from "../stores/main";
import {writeText} from "@tauri-apps/api/clipboard";

const API_URL = "https://api.openai.com/v1/chat/completions";
const max_tokens = 1500;
const temperature = 0.8;
const model = "gpt-3.5-turbo";

export async function openAICompletion(query: Partial<IState>) {
    try {
        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json; charset=utf-8",
                Authorization: `Bearer ${query.apikey}`,
            },
            body: JSON.stringify({
                model: query.model ?? model,
                max_tokens: query.max_tokens ?? max_tokens,
                temperature: query.temperature ?? temperature,
                messages: query.messages ?? [],
                stream: query.stream ?? false,
                stop: ["---"]
            }),
        };

        return fetch(API_URL, options);
    } catch (err: any) {
        throw new Error(err.message);
    }
}

function updateLatestMessage(state, content) {
    const latestMessage = state.messages[state.messages.length - 1];
    if (latestMessage.role === 'assistant') {
        state.messages[state.messages.length - 1] = {
            role: 'assistant',
            content: latestMessage.content + content
        }
    } else {
        state.messages = [
            ...state.messages,
            {
                role: 'assistant',
                content,
            },
        ];
    }
    return state;
}

export async function displayAnswer(query: Partial<IState>, response: Response) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let answer = '';
    while (true) {
        const { done, value } = await reader.read();
        if (done) {
            break;
        }

        const lines = decoder.decode(value).split('\n').filter(line => line.trim() !== '');
        for (const line of lines) {
            const message = line.replace(/^data: /, '');
            if (message === '[DONE]') {
                await writeText(answer);
                state.update(state => {
                    state.messages = state.messages.map(message => {
                        message.content = message.role === 'system' ? defaultSystemPrompt : message.content;
                        return message;
                    })
                    state.query = '';
                    return state;
                })
                return; // Stream finished
            }
            try {
                const parsed = JSON.parse(message);
                const content = (query.stream ? parsed.choices[0].delta.content : parsed.choices[0].message.content) ?? '';
                answer += content;
                state.update((state) => {
                    return updateLatestMessage(state, content);
                });
            } catch (error) {
                console.error('Could not JSON parse stream message', message, error);
            }
        }
    }
}

// export async function handleStream(response: Response) {
//     const reader = response.body.getReader();
//     const decoder = new TextDecoder();
//
//     state.update((state) => {
//         const latestMessage = state.messages[state.messages.length - 1];
//         if (latestMessage.role === 'assistant') {
//             state.messages = [...state.messages, {
//                 ...latestMessage,
//                 content: latestMessage.content + ' '
//             }]
//         } else {
//             state.messages = [...state.messages, {
//                 role: 'assistant',
//                 content: ''
//             }]
//         }
//         return state;
//     })
//
//     while (true) {
//         const { done, value } = await reader.read();
//         if (done) {
//             break;
//         }
//
//         const lines = decoder.decode(value).split('\n').filter(line => line.trim() !== '');
//         for (const line of lines) {
//             const message = line.replace(/^data: /, '');
//             if (message === '[DONE]') {
//                 return; // Stream finished
//             }
//             try {
//                 const parsed = JSON.parse(message);
//                 state.update((state) => {
//                     const latestMessage = state.messages[state.messages.length - 1];
//                     state.messages = [...state.messages, {
//                         ...latestMessage,
//                         content: latestMessage.content + parsed.choices[0].delta.content ?? ''
//                     }]
//                     return state;
//                 });
//             } catch (error) {
//                 console.error('Could not JSON parse stream message', message, error);
//             }
//         }
//     }
// }
