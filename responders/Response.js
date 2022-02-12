import jsonWriter from './json-writer.js';
export default (data, opts = undefined) => {
  let status = isNaN(Number(opts)) ? 200 : opts;
  let message = "";
  if(typeof opts == "object"){
    message = opts?.message ? opts?.message : "";
    status = isNaN(Number(opts?.status)) ? status : opts?.status;
  }
  return jsonWriter({ data, status, message }, {}, data);
}
