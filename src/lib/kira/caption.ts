export function toHashtag(str: string | null | undefined): string {
  if (!str) return "";
  const cleaned = str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9\s]/g, "");

  const camelCase = cleaned
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("");
  return camelCase ? "#" + camelCase : "";
}

export type CaptionInput = {
  query: string;
  titleRomaji?: string | null;
  titleEnglish?: string | null;
  titleNative?: string | null;
  year?: number | null;
  episodes?: number | null;
  genres?: string[] | null;
  studioName?: string | null;
  inviteLink: string;
  whatsappChannelLink: string;
  newsChannelLink: string;
  mainChannelLink: string;
};

export function buildTelegramCaption(input: CaptionInput): string {
  const titleRomaji = input.titleRomaji || input.query;
  const titleEng = input.titleEnglish
    ? input.titleEnglish
    : `${titleRomaji} (Tradução aprox.)`;
  const titleNative = input.titleNative || titleRomaji;
  const ano = input.year ? String(input.year) : "Em breve / N/A";
  const episodios = input.episodes
    ? `${input.episodes} episódios`
    : "Em exibição / A anunciar";
  const generos =
    input.genres && input.genres.length > 0 ? input.genres.join(", ") : "N/A";

  const tagsSet = new Set<string>();
  if (titleRomaji) tagsSet.add(toHashtag(titleRomaji));
  if (input.titleEnglish) tagsSet.add(toHashtag(input.titleEnglish));
  if (input.studioName) tagsSet.add(toHashtag(input.studioName));
  if (input.genres) {
    for (const g of input.genres) tagsSet.add(toHashtag(g + "Anime"));
  }
  if (input.year) tagsSet.add("#Anime" + input.year);

  const tagsArray = Array.from(tagsSet).filter((t) => t && t !== "#");

  let whatsappBlock = "";
  if (input.whatsappChannelLink) {
    whatsappBlock = `📲 Siga também nosso canal no WhatsApp:\n${input.whatsappChannelLink}\n\n`;
  }

  return `🇯🇵 ${titleRomaji}
🇺🇸/🇧🇷 ${titleEng}
⛩️ ${titleNative}

📺 Ano: ${ano}
🎬 Episódios: ${episodios}
🆭 Gêneros: ${generos}

╔═════- 💫💫 -═════╗
    🔹 LINK DO CANAL 🔹
${input.inviteLink}
╚═════- 💫💫 -═════╝

${whatsappBlock}Tags:
${tagsArray.join(" ")}

📰 Fique por dentro de tudo sobre a Cultura Nerd, Otaku, Geek e Gamer! Siga nosso canal de notícias:
${input.newsChannelLink}`;
}

export function buildThreadsText(input: CaptionInput): string {
  const title = input.titleRomaji || input.titleEnglish || input.query;
  const ano = input.year ? String(input.year) : "N/A";
  const episodios = input.episodes ? `${input.episodes} eps` : "Em exibição";
  const generos = input.genres ? input.genres.slice(0, 3).join(", ") : "N/A";
  const mainTag = toHashtag(title);
  const genreTag =
    input.genres && input.genres[0]
      ? toHashtag(input.genres[0] + "Anime")
      : "#Anime";

  return `✨ ${title}

▪️ Ano: ${ano}
▪️ Episódios: ${episodios}
▪️ Gêneros: ${generos}

📌 Entre no canal principal:
${input.mainChannelLink}

Tags:
${mainTag} ${genreTag} #Animes #YggdrasilAnimes

📰 Fique por dentro de tudo sobre a Cultura Nerd, Otaku, Geek e Gamer! Siga nosso canal de notícias:
${input.newsChannelLink}`;
}

export function captionForWhatsapp(
  caption: string,
  inviteLink: string,
  mainChannelLink: string,
): string {
  if (!inviteLink) return caption;
  return caption.split(inviteLink).join(mainChannelLink);
}
