// fetchYuriManga.js
const fetch = require('node-fetch');
const fs = require('fs');

const query = `
query ($page: Int, $year: String) {
  Page(page: $page, perPage: 16) {
    media(
      type: MANGA,
      tag: "Yuri",
      sort: [POPULARITY_DESC],
      startDate_like: $year,
      isAdult: false
      minimumTagRank: 60
    ) {
      id
      coverImage { large }
      title {
        romaji
        native
      }
      siteUrl
    }
  }
}`;

async function fetchYear(year) {
  const variables = { page: 1, year: year };
  const response = await fetch('https://graphql.anilist.co', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });
  const json = await response.json();
  if (!json.data) {
    console.error(`Error fetching year ${year}:`, json);
    return [];
  }
  return json.data.Page.media.map(m => ({
    id: m.id,
    coverImage: m.coverImage.large,
    romajiTitle: m.title.romaji,
    nativeTitle: m.title.native,
    siteUrl: m.siteUrl,
  }));
}

async function main() {
  const startYear = 2004;
  const endYear = 2025;
  let allData = {};

  for (let year = startYear; year <= endYear; year++) {
    console.log(`Fetching yuri manga for year ${year}...`);
    const yearStr = `${year}%`; // AniList expects string with % for like queries
    const data = await fetchYear(yearStr);
    allData[year] = data;
    // Slight delay to avoid hitting API rate limits
    await new Promise(res => setTimeout(res, 1000));
  }

  fs.writeFileSync('yuriMangaByYear.json', JSON.stringify(allData, null, 2));
  console.log('Saved yuriMangaByYear.json');
}

main();

