const TestRegex = {
  testemail: (email: string): boolean => {
    if (!email) return false;
    return /^[\w.-0-9]+@[\w.-]+\.\w{2,10}$/.test(email);
  },

  testphone: (phone: string): boolean => {
    if (!phone) return false;
    return /^([0-9\s]{12,13})$/.test(phone);
  },
  testname: (text: string): boolean => {
    if (!text) return false;
    return /(^[\s\S]{1,150}$)/.test(text);
  },
  testdesc: (text: string): boolean => {
    if (!text) return false;
    return /(^[\s\S]{1,5000}$)/.test(text);
  },
  cleanphone: (bare_phone: string) => {
    return `${(bare_phone.indexOf("0") == 0
      ? bare_phone.substring(1)
      : bare_phone
    ).replace(/[\s+-]/g, "")}`;
  },
  uniqueStr: (...strs: String[]): String => {
    return strs.join("").split('').sort().join('');
  }
};

export default TestRegex;
