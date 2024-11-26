const Airtable = require('airtable');
require('dotenv').config();

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);

const getMoviesFromDatabase = async () => {
  try {
    // Fetch records from Airtable
    const records = await base('Movies').select({ view: 'Grid view' }).all();
    console.log('Fetched records:', records); // Log all records fetched from Airtable

    // Process each record and return the movie data
    return records.map(record => {
      // Handle the Cover Image field, ensuring we get the URL if available
      const coverImage = record.get('Cover Image');
      const coverImageUrl = Array.isArray(coverImage) && coverImage[0] ? coverImage[0].url : null;

      if (!coverImageUrl) {
        console.warn(`No valid cover image found for record ID: ${record.id}`);
      }

      // Return the formatted movie object
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
    // Log the error details
    console.error('Error fetching movies from Airtable:', error.message);
    console.error('Stack trace:', error.stack); // Log stack trace for better debugging
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

    // Handle the Cover Image field
    const coverImage = record.get('Cover Image');
    const coverImageUrl = Array.isArray(coverImage) && coverImage[0] ? coverImage[0].url : null;

    if (!coverImageUrl) {
      console.warn(`No valid cover image found for record ID: ${record.id}`);
    }

    // Return the formatted movie object
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
  } catch (error) {
    console.error(`Error fetching movie with ID ${id} from Airtable:`, error);
    return null; // Return null in case of an error
  }
};

module.exports = { getMoviesFromDatabase, getMovieById };
