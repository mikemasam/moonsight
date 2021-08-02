import jsonWriter from './json-writer.js';
export default (err) => {
  return jsonWriter({ status: 500, message: 'Unhandled Exception occured.' }, { err });
}
