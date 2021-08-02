# API

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

