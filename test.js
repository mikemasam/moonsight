import kernel from './index.js';
import path from 'path';
kernel({
  port: 3003,
  apiPath: path.resolve('sample')
}).catch(console.log);
