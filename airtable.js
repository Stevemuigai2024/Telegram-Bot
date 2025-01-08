// Updated airtable.js
const Airtable = require('airtable');
require('dotenv').config();

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);

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
    console.error('Full error details:', error);
    return [];
  }
};

const getMovieById = async (id) => {
  try {
    const record = await base('Movies').find(id);

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
  } catch (error) {
    console.error(`Error fetching movie with ID ${id}:`, error);
    return null;
  }
};

module.exports = { getMoviesFromDatabase, getMovieById };
