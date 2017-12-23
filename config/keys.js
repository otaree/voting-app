module.exports = {
    github: {
        clientID: process.env.GITHUB_KEY,
        clientSecret: process.env.GITHUB_SECRET,
        callback:  process.env.APP_URL + 'auth/github/callback'
    },
    mongodb: {
        dbURI: process.env.MONGO_URI
    },
    session: {
        cookieKey: process.env.COOKIE_KEY
    }
}