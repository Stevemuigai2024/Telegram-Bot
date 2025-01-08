const Airtable = require('airtable');
require('dotenv').config();

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);

const getMoviesFromDatabase = async () => {
  try {
    const records = await base('Movies').select({ view: 'Grid view' }).all();

    return records.map(record => {
      const coverImageField = record.get('Cover Image');
      const coverImage = Array.isArray(coverImageField) && coverImageField.length > 0
        ? coverImageField[0].url
        : 'https://example.com/default-image.png';

      return {
        id: record.id,
        title: record.get('Title') || 'Untitled',
        price: record.get('Price') || '0',
        coverImage,
      };
    });
  } catch (error) {
    console.error('Error fetching movies:', error);
    return [];
  }
};

const getMovieById = async (id) => {
  try {
    const record = await base('Movies').find(id);

    const coverImageField = record.get('Cover Image');
    const coverImage = Array.isArray(coverImageField) && coverImageField.length > 0
      ? coverImageField[0].url
      : 'https://example.com/default-image.png';

    return {
      id: record.id,
      title: record.get('Title') || 'Untitled',
      price: record.get('Price') || '0',
      coverImage,
    };
  } catch (error) {
    console.error(`Error fetching movie with ID ${id}:`, error);
    return null;
  }
};

module.exports = { getMoviesFromDatabase, getMovieById };
