module.exports = {
  apps: [
    {
      name: "my-app",
      script: "./app.js",
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
      },
    },
  ],
};
