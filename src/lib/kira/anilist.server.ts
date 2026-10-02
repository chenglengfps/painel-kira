const ANILIST_QUERY = `
query ($search: String) {
  Media (search: $search, type: ANIME) {
    title { romaji english native }
    startDate { year }
    episodes
    genres
    bannerImage
    studios(isMain: true) {
      nodes { name }
    }
    coverImage { extraLarge large }
  }
}`;

export type AnilistMedia = {
  title: { romaji?: string | null; english?: string | null; native?: string | null };
  startDate?: { year?: number | null } | null;
  episodes?: number | null;
  genres?: string[] | null;
  bannerImage?: string | null;
  studios?: { nodes?: { name: string }[] | null } | null;
  coverImage?: { extraLarge?: string | null; large?: string | null } | null;
};

export async function searchAnilist(search: string): Promise<AnilistMedia | null> {
  const response = await fetch("https://graphql.anilist.co", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ query: ANILIST_QUERY, variables: { search } }),
  });
  if (!response.ok) {
    throw new Error("AniList indisponível no momento.");
  }
  const data = (await response.json()) as {
    data?: { Media?: AnilistMedia | null };
  };
  return data.data?.Media ?? null;
}

export function collectImages(media: AnilistMedia): string[] {
  const list: string[] = [];
  if (media.coverImage?.extraLarge) list.push(media.coverImage.extraLarge);
  if (media.bannerImage && !list.includes(media.bannerImage)) {
    list.push(media.bannerImage);
  }
  if (media.coverImage?.large && !list.includes(media.coverImage.large)) {
    list.push(media.coverImage.large);
  }
  return list;
}
