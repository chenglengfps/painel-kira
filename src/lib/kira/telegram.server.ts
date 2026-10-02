const PHOTO_CAPTION_LIMIT = 1024;

type TelegramResponse = {
  ok: boolean;
  description?: string;
};

async function telegramCall(
  botToken: string,
  method: string,
  body: Record<string, unknown>,
): Promise<TelegramResponse> {
  const res = await fetch(`https://api.telegram.org/bot${botToken}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  try {
    return (await res.json()) as TelegramResponse;
  } catch {
    return { ok: false, description: `HTTP ${res.status}` };
  }
}

export async function sendTelegramPhoto(opts: {
  botToken: string;
  chatId: string;
  photo: string;
  caption: string;
}): Promise<{ ok: true } | { ok: false; description: string }> {
  const { botToken, chatId, photo, caption } = opts;
  if (!botToken.trim()) {
    return { ok: false, description: "Token do bot não configurado." };
  }
  if (!chatId.trim()) {
    return { ok: false, description: "Chat ID do canal não configurado." };
  }

  if (caption.length <= PHOTO_CAPTION_LIMIT) {
    const result = await telegramCall(botToken, "sendPhoto", {
      chat_id: chatId,
      photo,
      caption,
    });
    if (result.ok) return { ok: true };
    return {
      ok: false,
      description: result.description ?? "Telegram recusou o envio.",
    };
  }

  const photoResult = await telegramCall(botToken, "sendPhoto", {
    chat_id: chatId,
    photo,
  });
  if (!photoResult.ok) {
    return {
      ok: false,
      description: photoResult.description ?? "Falha ao enviar a imagem.",
    };
  }

  const msgResult = await telegramCall(botToken, "sendMessage", {
    chat_id: chatId,
    text: caption,
  });
  if (msgResult.ok) return { ok: true };
  return {
    ok: false,
    description: msgResult.description ?? "Imagem enviada, mas a legenda falhou.",
  };
}
