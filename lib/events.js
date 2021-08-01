import EventEmitter from 'events';


export default async function SystemEvents(context){
  const events = new EventEmitter();
  return {
    ...context,
    events
  }
}
