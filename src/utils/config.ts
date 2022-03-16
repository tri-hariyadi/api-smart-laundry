type environtment = {
  SECRET: string | undefined;
  DATABASE: string | undefined;
  APIKEY: string | undefined;
  API_BASE_URl: string | undefined;
}

interface IConfig {
  production: environtment;
  default: environtment;
}

const config = (env: keyof IConfig): environtment => {
  const configEnv: IConfig = {
    production: {
      SECRET: process.env.SECRET,
      DATABASE: process.env.MONGODB_URI,
      APIKEY: process.env.API_KEY,
      API_BASE_URl: process.env.API_BASE_URl
    },
    default: {
      SECRET: 'mysecret',
      DATABASE: 'mongodb://192.168.43.229:27017/laundry_app',
      APIKEY: '9515328e-d485-4d3e-b0e3-7bf20be04926',
      API_BASE_URl: '192.168.43.229:8081'
    }
  };

  return configEnv[env] || configEnv.default;
};

export { IConfig };

export default config;
