import jsonWriter from './json-writer.js';
export default ({ data = {}, message = 'failed', status = 400 } = {}) => {
  return jsonWriter({ data, status, message });
}
