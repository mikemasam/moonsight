import jsonWriter from './json-writer.js';
export default () => {
  return jsonWriter({ status: 204, message: 'Empty response.' });
}
