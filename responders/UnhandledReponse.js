import jsonWriter from './json-writer.js';
export default (err) => {
  return jsonWriter({ status: 500, message: 'Exception occured.' }, { err });
}
