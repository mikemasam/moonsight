import jsonWriter from './json-writer.js';
export default ({ status = 404, message = 'Resouce not found.' } = {}) => {
  return jsonWriter({ status, message });
}
