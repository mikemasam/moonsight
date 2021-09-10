class RequestState{
  constructor(req){
    this.req = req;
  }

  get(name){
    if(this.req.__type == 'ihttp'){
      return this.req.locals[name];
    }else if(this.req.__type == 'isocket'){
      return this.req.socket.locals[name];
    }else if(this.req.__type == 'icore'){
      return this.req.socket.locals[name];
    }
    return null;
  }

  put(name, data){
    if(this.req.__type == 'ihttp'){
      this.req.locals[name] = data;
    }else if(this.req.__type == 'isocket'){
      this.req.socket.locals[name] = data;
    }else if(this.req.__type == 'icore'){
      this.req.socket.locals[name] = data;
    }
  }
}


export default function CreateRequestState(req){
  return new RequestState(req);
}
