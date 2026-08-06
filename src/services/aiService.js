import { oraclesApi } from './api/oraclesApi';

export async function getInterpretation(question, cards, spreadType) {
  return oraclesApi.createTarotReading({ question, cards, spreadType });
}

export async function getChatResponse(userMessage, chatContext) {
  return oraclesApi.chatTarot({ userMessage, chatContext });
}
