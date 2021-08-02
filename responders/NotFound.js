import jsonWriter from './json-writer.js';
export default ({ message = 'Resouce not found.' } = {}) => {
  return jsonWriter({ status: 404, message });
}
