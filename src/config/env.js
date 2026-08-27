const apiUrl =
  import.meta.env.VITE_API_URL ||
  'http://localhost:3000/api/v1';

const publicAppUrl =
  import.meta.env.VITE_PUBLIC_APP_URL || '';

export const ENV = {
  API_URL: apiUrl.replace(/\/+$/, ''),
  PUBLIC_APP_URL: publicAppUrl.replace(/\/+$/, ''),

  APP_NAME:
    import.meta.env.VITE_APP_NAME ||
    'Encuestas 5S',

  MODE: import.meta.env.MODE,
  IS_DEV: import.meta.env.DEV,
  IS_PROD: import.meta.env.PROD,
};

export default ENV;