import kernel from './index.js';
import path from 'path';
kernel({
  port: 3003,
  apiPath: path.resolve('sample'),
  mount: 'api',
  logging: {
    http: true,
    error: true
  }
}).catch(console.log);
