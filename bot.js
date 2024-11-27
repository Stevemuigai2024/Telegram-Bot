bot.command('movie', async (ctx) => {
  const movieId = ctx.message.text.split(' ')[1];
  try {
    const movie = await getMovieById(movieId);
    if (movie) {
      console.log(`Sending image URL to Telegram: ${movie.coverImage}`);
      await ctx.replyWithPhoto(movie.coverImage, {
        caption: `${movie.title}\n${movie.description}\nPrice: $${movie.price}\nLink: ${movie.link}\nTo buy, use /buy ${movieId}`
      });
    } else {
      ctx.reply('Movie not found.');
    }
  } catch (error) {
    console.error('Error fetching movie details:', error);
    ctx.reply('An error occurred while fetching movie details. Please try again later.');
  }
});
