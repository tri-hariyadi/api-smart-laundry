type environtment = {
  DATABASE: string | undefined;
  APIKEY: string | undefined;
  API_BASE_URl: string | undefined;
  ACCESS_TOKEN_SECRET: string | undefined;
  REFRESH_TOKEN_SECRET: string | undefined;
}

interface IConfig {
  production: environtment;
  default: environtment;
}

const config = (env: keyof IConfig): environtment => {
  const configEnv: IConfig = {
    production: {
      DATABASE: process.env.MONGODB_URI,
      APIKEY: process.env.API_KEY,
      API_BASE_URl: process.env.API_BASE_URl,
      ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
      REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET
    },
    default: {
      DATABASE: 'mongodb://localhost:27017/laundry_app',
      APIKEY: '9515328e-d485-4d3e-b0e3-7bf20be04926',
      API_BASE_URl: 'http://localhost:8081',
      ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
      REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET
    }
  };

  return configEnv[env] || configEnv.default;
};

export { IConfig };

export default config;
