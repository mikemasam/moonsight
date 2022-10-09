import { v4 as uuidv4 } from 'uuid';

const TYPES = {
  'ORDER': '11',
  'PAYMENT': '99',
  'USER': '22',
};
export default function(){
  return {
    basic: (size = 1) => {
      return Array(size).fill(null).map(() => uuidv4().split('-').join('')).join('');
    },
    uuid: () => {
      return uuidv4();
    },
    entity: (_type, seq) => {
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
  }
}


