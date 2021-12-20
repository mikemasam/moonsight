import jsonWriter from './json-writer.js';
//TODO: handle no response
export default (data) => {
  return jsonWriter({ data, status: 0 }, {}, data);
}
