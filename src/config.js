module.exports = {
    PORT: process.env.PORT || 8000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    DATABASE_URL: process.env.DATABASE_URL || 'postgresql://jsmglorenzo@localhost/saf-db',
    CLIENT_ORIGIN: 'https://saf-textapp-client.jml0123.vercel.app/',
}
// Add to env file and hide credentials