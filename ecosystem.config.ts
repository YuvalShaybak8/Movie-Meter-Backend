// ecosystem.config.js

module.exports = {
    apps: [
        {
            name: 'server', // Name of your application
            script: './server.ts', // Entry point of your application
            env_production: {
                NODE_ENV: 'production',
                DATABASE_URL: "mongodb + srv://yuvalsaybak:PuYdqyX5aqnCsTT1@moviemeter.t1emhrz.mongodb.net/MovieMeter",
                HTTP_PORT: "5500",
                TOKEN_SECRET: "76787fda10b163806e5c51ff0c0e3911f4a6e2ef158327db15ee",
                ACCESS_TOKEN_EXPIRATION: "1h",
                GOOGLE_CLIENT_ID: "403571040301 - 2ka5e09b8upflfk8qmpfebo4sg08gde0.apps.googleusercontent.com",
            },
        },
    ],
};
