import kernel from './index.js';
import path from 'path';
kernel({
  port: 3003,
  apiPath: path.resolve('sample'),
  middlewaresPath: path.resolve('middlewares'),
  mount: 'api',
  logging: {
    http: true,
    error: true
  }
}).catch(console.log);
