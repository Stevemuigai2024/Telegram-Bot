const Airtable = require('airtable');
require('dotenv').config();

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);

const getMoviesFromDatabase = async () => {
  try {
    const records = await base('Movies').select({ view: 'Grid view' }).all();

    return records.map(record => {
      const coverImage = record.get('Cover Image');
      console.log(`Record ID: ${record.id}`);
      console.log('Cover Image Field:', coverImage);

      const coverImageUrl = coverImage && coverImage[0] ? coverImage[0].url : null;

      return {
        id: record.id,
        code: record.get('Movie Code'),
        title: record.get('Title'),
        genre: record.get('Genre'),
        director: record.get('Director'),
        year: record.get('Year'),
        price: record.get('Price'),
        link: record.get('Link'),
        coverImageUrl: coverImageUrl || 'https://example.com/default-image.png'
      };
    });
  } catch (error) {
    console.error('Error fetching movies from Airtable:', error);
    return []; // Return an empty array in case of an error
  }
};

const getMovieById = async (id) => {
  try {
    console.log(`Fetching movie with ID: ${id}`);
    const record = await base('Movies').find(id);
    if (!record) {
      console.error(`No record found with ID: ${id}`);
      return null;
    }

    const coverImage = record.get('Cover Image');
    console.log('Cover Image Field:', coverImage);

    const coverImageUrl = coverImage && coverImage[0] ? coverImage[0].url : null;

    return {
      id: record.id,
      code: record.get('Movie Code'),
      title: record.get('Title'),
      genre: record.get('Genre'),
      director: record.get('Director'),
      year: record.get('Year'),
      price: record.get('Price'),
      link: record.get('Link'),
      coverImageUrl: coverImageUrl || 'https://example.com/default-image.png'
    };
  } catch (error) {
    console.error(`Error fetching movie with ID ${id} from Airtable:`, error);
    return null;
  }
};

module.exports = { getMoviesFromDatabase, getMovieById };
