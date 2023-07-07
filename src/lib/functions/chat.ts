import { state } from "../store/main";
import type { ChatState, MessageType } from "../store/main.dt";

export const sendQuery = async (
  currentState: ChatState,
  type: MessageType = "query"
) => {
  if (!currentState.query) {
    return;
  }

  try {
    const userMessage = {
      role: "user" as const,
      content: currentState.query,
    };

    const updatedStateWithUserMesssage = {
      ...currentState,
      typing: true,
      messages: [...currentState.messages, userMessage],
    };
    state.update(() => updatedStateWithUserMesssage);

    const response = await fetch(import.meta.env.VITE_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: currentState.query,
        type: type,
      }),
    }).then((res) => res.json());

    if (response.answer) {
      const botMessage = {
        role: "bot" as const,
        content: response?.answer ?? "",
      };

      const updatedStateWithBotMessage = {
        ...updatedStateWithUserMesssage,
        messages: [...updatedStateWithUserMesssage.messages, botMessage],
      };
      state.update(() => updatedStateWithBotMessage);

      state.update((state) => {
        state.typing = false;
        return state;
      });
    } else {
      throw new Error(`OpenAI request failed: ${response.statusText}`);
    }
  } catch (error) {
    console.error("An error occurred during OpenAI request", error);
  }
};
