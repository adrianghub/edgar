import type { ChatState } from "../store/main.dt";
import { defaultSystemPrompt, state } from "../store/main";
import { writeText } from "@tauri-apps/api/clipboard";
import { models } from "../../constants/index";

const API_URL = "https://api.openai.com/v1/chat/completions";
const max_tokens = 1500;
const temperature = 0.8;

export async function openAICompletion(query: Partial<ChatState>) {
  try {
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Authorization: `Bearer ${query.apikey}`,
      },
      body: JSON.stringify({
        model: query.model ?? models[0],
        max_tokens: query.max_tokens ?? max_tokens,
        temperature: query.temperature ?? temperature,
        messages: query.messages ?? [],
        stream: query.stream ?? false,
        stop: ["---"],
      }),
    };

    const response = await fetch(API_URL, options);

    if (response.ok) {
      return response;
    } else {
      throw new Error(`OpenAI request failed: ${response.statusText}`);
    }
  } catch (err) {
    throw new Error(`An error occurred during OpenAI request: ${err.message}`);
  }
}

function updateLatestMessage(state, content) {
  const latestMessage = state.messages[state.messages.length - 1];
  if (latestMessage.role === "assistant") {
    state.messages[state.messages.length - 1] = {
      role: "assistant",
      content: latestMessage.content + content,
    };
  } else {
    state.messages = [
      ...state.messages,
      {
        role: "assistant",
        content,
      },
    ];
  }
  return state;
}

export async function displayAnswer(
  query: Partial<ChatState>,
  response: Response
) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  let answer = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }

    const lines = decoder
      .decode(value)
      .split("\n")
      .filter((line) => line.trim() !== "");
    for (const line of lines) {
      const message = line.replace(/^data: /, "");
      if (message === "[DONE]") {
        await writeText(answer);
        state.update((state) => {
          state.messages = state.messages.map((message) => {
            message.content =
              message.role === "system" ? defaultSystemPrompt : message.content;
            return message;
          });
          state.query = "";
          return state;
        });
        return; // Stream finished
      }
      try {
        const parsed = JSON.parse(message);
        const content =
          (query.stream
            ? parsed.choices[0].delta.content
            : parsed.choices[0].message.content) ?? "";
        answer += content;
        state.update((state) => {
          return updateLatestMessage(state, content);
        });
      } catch (error) {
        console.error("An error occurred while displaying the answer", error);
        // TODO: Handle the error, such as displaying an error message to the user
      }
    }
  }
}