import jsonWriter from './json-writer.js';
export default (data) => {
  return jsonWriter({ data, status: 0 }, {}, data);
}
