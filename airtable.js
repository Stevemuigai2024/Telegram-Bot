const getMoviesFromDatabase = async () => {
  try {
    const records = await base('Movies').select({ view: 'Grid view' }).all();
    console.log("Raw Airtable records:", records);

    return records.map(record => {
      const coverImageField = record.get('Cover Image');
      const coverImage = Array.isArray(coverImageField) && coverImageField.length > 0
        ? coverImageField[0].url
        : 'https://via.placeholder.com/300x450.png?text=No+Image';

      return {
        id: record.id,
        title: record.get('Title') || 'Untitled',
        price: record.get('Price') || '0',
        coverImage,
      };
    });
  } catch (error) {
    console.error('Error fetching movies from Airtable:', error.message);
    return [];
  }
};
