class RequestState{
  constructor(req){
    this.req = req;
  }

  get(name){
    if(req.__type == 'ihttp'){
      return this.req.locals[name];
    }else if(req.__type == 'isocket'){
      return this.req.socket.locals[name];
    }else if(req.__type == 'icore'){
      return this.req.socket.locals[name];
    }
    return null;
  }

  put(name, data){
    if(req.__type == 'ihttp'){
      this.req.locals[name] = data;
    }else if(req.__type == 'isocket'){
      this.req.socket.locals[name] = data;
    }else if(req.__type == 'icore'){
      this.req.socket.locals[name] = data;
    }
  }
}


export default CreateRequestState(req){
  return new RequestState(req);
}
