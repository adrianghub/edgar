import {openAICompletion, displayAnswer} from "./openai";
import {state} from "../stores/main";

export const generateAnswer = async (currentState) => {
    const response = await openAICompletion({
        apikey: currentState.apikey,
        stream: currentState.stream,
        messages: currentState.messages,
    });
    if (response.ok) {
        await displayAnswer({ stream: currentState.stream }, response);
    } else {
        console.error('An error occurred during OpenAI request', response.statusText);
    }
}

export const ask = async (currentState) => {
    if (!currentState.query) {
        return;
    }
    const updatedState = {
        ...currentState,
        messages: [
            ...currentState.messages,
            {
                role: 'user',
                content: currentState.query
            }
        ]
    }
    state.update(() => updatedState);
    await generateAnswer(updatedState);
}
