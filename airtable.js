const Airtable = require('airtable');
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);

async function getMoviesFromDatabase() {
  const movies = [];
  try {
    await base(process.env.AIRTABLE_TABLE_NAME)
      .select({ view: process.env.AIRTABLE_VIEW_NAME })
      .eachPage((records, fetchNextPage) => {
        records.forEach((record) => {
          let coverImageUrl = null;
          const coverImage = record.get('Cover Image');

          if (Array.isArray(coverImage) && coverImage.length > 0) {
            coverImageUrl = coverImage[0].url; // Use the first image URL
          }

          // Fallback to a placeholder image if no cover image exists
          coverImageUrl = coverImageUrl || 'https://via.placeholder.com/300x400.png?text=No+Image';

          console.log(`Extracted cover image URL: ${coverImageUrl}`);

          movies.push({
            id: record.id,
            title: record.get('Title'),
            description: record.get('Description'),
            price: record.get('Price'),
            coverImage: coverImageUrl,
            link: record.get('Link'),
          });
        });
        fetchNextPage();
      });
  } catch (error) {
    console.error('Error fetching movies from Airtable:', error);
  }
  return movies;
}

async function getMovieById(movieId) {
  try {
    const record = await base(process.env.AIRTABLE_TABLE_NAME).find(movieId);
    let coverImageUrl = null;
    const coverImage = record.get('Cover Image');

    if (Array.isArray(coverImage) && coverImage.length > 0) {
      coverImageUrl = coverImage[0].url;
    }

    coverImageUrl = coverImageUrl || 'https://via.placeholder.com/300x400.png?text=No+Image';

    console.log(`Extracted cover image URL for movie ID ${movieId}: ${coverImageUrl}`);

    return {
      id: record.id,
      title: record.get('Title'),
      description: record.get('Description'),
      price: record.get('Price'),
      coverImage: coverImageUrl,
      link: record.get('Link'),
    };
  } catch (error) {
    console.error(`Error fetching movie with ID ${movieId}:`, error);
    return null;
  }
}

module.exports = { getMoviesFromDatabase, getMovieById };
