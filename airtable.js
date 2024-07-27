const Airtable = require('airtable');
require('dotenv').config();

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base('appmm2U1nQ3dXDEzr');

// Example functions to fetch data from Airtable
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
    link: record.get('Link')
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
    link: record.get('Link')
  };
};

module.exports = { getMoviesFromDatabase, getMovieById };
