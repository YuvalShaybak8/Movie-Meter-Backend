module.exports = {
  apps: [
    {
      name: "movie-meter-server",
      script: "./dist/server.js",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env_file: ".env",
      env_development: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
        HTTP_PORT: "5500",
        HTTPS_PORT: "5443",
        ACCESS_TOKEN_EXPIRATION: "1h",
      },
      node_args: "--experimental-specifier-resolution=node",
    },
  ],
};
