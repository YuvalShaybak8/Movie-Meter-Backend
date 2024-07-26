module.exports = {
  apps: [
    {
      name: "movie-meter-server",
      script: "./dist/server.js",
      env_production: {
        NODE_ENV: "production",
        DATABASE_URL: "mongodb://server:123123123@localhost:21771/web_class",
        TOKEN_SECRET: "76787fda10b163806e5c51ff0c0e3911f4a6e2ef158327db15ee",
        ACCESS_TOKEN_EXPIRATION: "1h",
        REFRESH_TOKEN_EXPIRATION: "14d",
        HTTPS_PORT: 443,
        HTTP_PORT: 80,
        GOOGLE_CLIENT_ID:
          "403571040301-2ka5e09b8upflfk8qmpfebo4sg08gde0.apps.googleusercontent.com",
      },
    },
  ],
};
