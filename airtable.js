const Airtable = require('airtable');
require('dotenv').config();

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);

const getMoviesFromDatabase = async () => {
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
    coverImageUrl: record.get('Cover Image') && record.get('Cover Image')[0] && record.get('Cover Image')[0].url
  }));
};

const getMovieById = async (id) => {
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
    coverImageUrl: record.get('Cover Image') && record.get('Cover Image')[0] && record.get('Cover Image')[0].url
  };
};

module.exports = { getMoviesFromDatabase, getMovieById };
