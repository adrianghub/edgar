import { openAICompletion, displayAnswer } from "./openai";
import { state } from "../store/main";

export const generateAnswer = async (currentState) => {
  try {
    const response = await openAICompletion({
      apikey: currentState.apikey,
      stream: currentState.stream,
      messages: currentState.messages,
    });

    if (response.ok) {
      await displayAnswer({ stream: currentState.stream }, response);
    } else {
      throw new Error(`OpenAI request failed: ${response.statusText}`);
    }
  } catch (error) {
    console.error("An error occurred during OpenAI request", error);
    // TODO: Handle the error, such as displaying an error message to the user
  }
};

export const ask = async (currentState) => {
  if (!currentState.query) {
    return;
  }

  try {
    const updatedState = {
      ...currentState,
      typing: true,
      messages: [
        ...currentState.messages,
        {
          role: "user",
          content: currentState.query,
        },
      ],
    };
    state.update(() => updatedState);
    await generateAnswer(updatedState);

    state.update((state) => {
      state.typing = false;
      return state;
    });
  } catch (error) {
    console.error("An error occurred while asking the question", error);
    // TODO: Handle the error, such as displaying an error message to the user
  }
};
