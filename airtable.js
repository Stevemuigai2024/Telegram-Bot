const getMoviesFromDatabase = async () => {
  try {
    const records = await base('Movies').select({ view: 'Grid view' }).all();

    return records.map(record => {
      const coverImage = record.get('Cover Image'); // Get the "Cover Image" field
      const coverImageUrl = Array.isArray(coverImage) && coverImage[0] ? coverImage[0].url : null;

      if (!coverImageUrl) {
        console.warn(`No valid cover image found for record ID: ${record.id}`);
      }

      return {
        id: record.id,
        code: record.get('Movie Code'),
        title: record.get('Title'),
        genre: record.get('Genre'),
        director: record.get('Director'),
        year: record.get('Year'),
        price: record.get('Price'),
        link: record.get('Link'),
        coverImageUrl: coverImageUrl || 'https://example.com/default-image.png' // Fallback if no image
      };
    });
  } catch (error) {
    console.error('Error fetching movies from Airtable:', error);
    return [];
  }
};
