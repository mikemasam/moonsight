import { v4 as uuidv4 } from 'uuid';

export default function(){
  return {
    basic: (size = 1) => {
      return Array(size).fill(null).map(() => uuidv4().split('-').join('')).join('');
    },
    uuid: () => {
      return uuidv4();
    }
  }
}


