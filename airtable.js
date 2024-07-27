const Airtable = require('airtable');
require('dotenv').config();

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base('appmm2U1nQ3dXDEzr');

// Example functions to fetch data from Airtable
const getMoviesFromDatabase = async () => {
  try {
    const records = await base('Movies').select({ view: 'Grid view' }).all();
    return records.map(record => ({
      id: record.id,
      code: record.get('Movie Code'),
      title: record.get('Title'),
      genre: record.get('Genre'),
      director: record.get('Director'),
      year: record.get('Year'),
      price: record.get('Price'),
      link: record.get('Link'),
      coverImage: record.get('CoverImage') ? record.get('CoverImage')[0].url : null // Fetch the cover image URL
    }));
  } catch (error) {
    console.error('Error fetching movies from Airtable:', error);
    return [];
  }
};

const getMovieById = async (id) => {
  try {
    const record = await base('Movies').find(id);
    return {
      id: record.id,
      code: record.get('Movie Code'),
      title: record.get('Title'),
      genre: record.get('Genre'),
      director: record.get('Director'),
      year: record.get('Year'),
      price: record.get('Price'),
      link: record.get('Link'),
      coverImage: record.get('CoverImage') ? record.get('CoverImage')[0].url : null // Fetch the cover image URL
    };
  } catch (error) {
    console.error('Error fetching movie from Airtable:', error);
    return null;
  }
};

module.exports = { getMoviesFromDatabase, getMovieById };
