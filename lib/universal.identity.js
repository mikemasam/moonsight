import { v4 as uuidv4 } from 'uuid';

const TYPES = {
  'ORDER': '11',
  'PAYMENT': '99',
  'USER': '22',
};
export default function UID(){
  return {
    basic: (size = 1) => {
      return Array(size).fill(null).map(() => uuidv4().split('-').join('')).join('');
    },
    uuid: () => {
      return uuidv4();
    },
  }
}

UID.uuid = () => {
  return uuidv4();
}
UID.basic = (size = 1) => {
  return Array(size).fill(null).map(() => uuidv4().split('-').join('')).join('');
}

UID.entity = (_type, seq) => {
  if(!global.deba_kernel_ctx) return [false, "Context not initialized"];
  const E_TYPE = TYPES[_type];
  if(!E_TYPE) return [false, "ENTITY type not found"];
  if(seq === undefined) return [false, "Invalid sequence number"];
  const { opts } = global.deba_kernel_ctx;
  if(!opts.nodeIdentity || isNaN(opts.nodeIdentity)) return [false, "Node ID not defined"];
  const RAND = ("" + Math.random()).slice(2, 6);
  //  02 000 2001 1231 4
  const checksum = (Number(E_TYPE) + Number(RAND) + Number(opts.nodeIdentity) + Number(seq)) % 10;
  return [`${E_TYPE}${opts.nodeIdentity}${seq}${RAND}${checksum == 0 ? 0 : 10 - checksum}`];
}
//SOF 6832596
UID.latestVersion = (version, minVersion = false) => {
  const current_version = minVersion || global.deba_kernel_ctx.opts.version;
  if(!version || typeof version != 'string' || version.length > 20) return false;
  const current_parts = current_version.replace(/[^0-9.]+/g,'').split('.')
  const parts = version.replace(/[^0-9.]+/g,'').split('.')
  const len = Math.max(parts.length, current_parts.length);
  for (var i = 0; i < len; i++) {
    const a = ~~(parts[i] || 0) // parse int
    const b = ~~(current_parts[i] || 0) // parse int
    console.log(a, b);
    if (a > b) return true
    if (a < b) return false
  }
  return true; 
}
