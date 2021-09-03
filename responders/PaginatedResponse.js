import jsonWriter from './json-writer.js';
export default (data, { message = 'success', status = 200 } = {}) => {
  return jsonWriter({ data: data?.results || [], status, message }, {}, data);
}
