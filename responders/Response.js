import jsonWriter from './json-writer.js';
export default (data, opts) => {
  let status = Number(opts) !== NaN ? opts : 200;
  let message = "";
  if(typeof opts == "object"){
    message = opts?.message ? opts?.message : "";
    status = Number(opts?.status) !== NaN ? opts?.status : status;
  }
  return jsonWriter({ data, status, message }, {}, data);
}
