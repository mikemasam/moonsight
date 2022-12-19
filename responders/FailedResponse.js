import jsonWriter from './json-writer.js';
//TODO: accept string | obj | statusCode | all
export default ({ data = {}, message = 'failed', status = 400 } = {}) => {
  return jsonWriter({ data, status, message });
}
