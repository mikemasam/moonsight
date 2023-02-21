const TestRegex = {};
TestRegex.testemail = (email) => {
  if(!email) return false;
  return /(^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])$)?/.test(email);
}

TestRegex.testphone = (phone) => {
  if(!phone) return false;
  return /^([0-9\s]{12})$/.test(phone);
}

TestRegex.testname = (text) => {
  if(!text) return false;
  return /(^(\w|\d|\s|\_|\.|\*|\\|\/|\[|\]|\>|\<|\=|\"|\)|\(|\{|\}|\,|\-){1,100}$)/.test(text);
}

TestRegex.testdesc = (text) => {
  if(!text) return false;
  return /(^(\w|\d|\s|\_|\.|\*|\\|\/|\[|\]|\>|\<|\=|\"|\)|\(|\{|\}|\,|\-){1,1000}$)/.test(text);
}
export default TestRegex
