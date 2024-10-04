module.exports = {
  apps: [
    {
      name: "my-app",
      script: "./app.js",
      env: {
        NODE_ENV: "development",
        APIKEY: process.env.APIKEY,
      },
      env_production: {
        NODE_ENV: "production",
        OPENAI_API_KEY: process.env.OPENAI_API_KEY,
      },
    },
  ],
};
