import Messages from "../models/messages.js";

export const createMessage = async ({ sender_id, text, time, chat_id }) => {
  return await Messages.create({
    sender_id,
    text,
    time,
    ID_Chat: chat_id,
  });
};
