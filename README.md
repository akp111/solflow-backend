# solflow-backend

The backend side is the main brain that that stores the details and also generates payment links based on the time defined by user.

## Steps to run the backend:
1. Clone the repo
2. To install dependencies, run `npm install`
3. Start the server in dev mode using  `npm run dev`
4. Start the server in prod mode using `npm start`
5. The server will start at post 4000

## Important APIS

### `localhost:4000/hello/`

body 
```js
{
    "user":"DCDSTN6LBD8NXbzapaLbUSKgtv8puVU11LqQ7Eun3fTQ",
    "recipient":"GcVR9YFkM66kETSAQ4fuDnaq95RpSuBKN1rUniMaT7PQ",
    "amount":1,
    "time":1
}
```
It takes care of user registration.

### `localhost:4000/hello/pending`

body 
```js
{
    "user":"DCDSTN6LBD8NXbzapaLbUSKgtv8puVU11LqQ7Eun3fTQ"
}
```
It returns the pending payment links

