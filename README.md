## Moonsight
a back end web application framework for building RESTful APIs with Bun/Deno & Node.js with Queue/Locking/Jobs/WebSocket built-in and more

# API

##demo > copy startup.js to your project
### Kernel opts
```
{
  apiPath: '',
  port: PORT,
  logging: {
    error: true,
    http: true
  }
}
```

### Kernel init
```
const cxt = await Kernel(opts);
```

### Handlers
- #### Http
  - ``` export const ihttp = IHttp(handler, middlewares) ```
- #### Socket 
  - ``` export const isocket = ISocket(handler, middlewares) ```
- #### Kernel core
  - ``` export const ikernel = IKernel(handler, middlewares) ```
### Responses
- #### Basic Response
  - ``` Response(data, { message = '', status = 200 }); ```
- #### Not Found Response
  - ``` NotFound({ message = '' }); ```
- #### Paginated Response
  - ``` PaginatedResponse(data, { message = 'success', status = 200 }) ```
- #### Unhandled Response
  - ``` UnhandledReponse(err) ```
- #### Empty Response
  - ``` EmptyResponse(); ```

