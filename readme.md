# Go Next Games Landing Utils

This is a collection of utilities for the Go Next Games Landing Page.

## Development

In your package.json, add the following:
```json
"@gonextgames/utils-client": "file:/Users/oliverbarnum/Documents/git/utils/client",
"@gonextgames/utils-server": "file:/Users/oliverbarnum/Documents/git/utils/server",
```

Then run `npm install`

Create an .env file:

```json
AWS_ACCESS_KEY=""
AWS_SECRET=""
ENVIRONMENT=""
JWT_SECRET_KEY=""
STRIPE_API=""
STRIPE_PUBLIC_KEY=""
OPENAI_API_KEY=""
```
Then
```
cd ./client
npm run dev
```
New Terminal:
```
cd ./server
npm run dev
```

## Auth

### Client Side Consumption

- Wrap the layout in `<AuthProvider></AuthProvider>`
- In components that need to know whether you are auth'd:

```js
import { useAuth, trackEvent } from '@gonextgames/utils-client'
const { isAuthenticated, logout, user } = useAuth()
```
- To change auth
```js
import { useAuth } from '@gonextgames/utils-client'
// Call these functions to call the backend
const { login/register/logout } = useAuth()
```
When implementing auth, you can use the `redirect` function with the `from` parameter to redirect after logging in. After registering, you can redirect to the getting started page or whatever is appropriate for your application.

### Server Side Consumption

- Implement /api/auth/verify for tokens

```js
import { getUserFromToken } from '@gonextgames/utils-server'

export async function GET(req) {
  try {
    const user = await getUserFromToken("NAME_OF_USERS_TABLE", "TOKEN_NAME")
    if (user === null) {
      return Response.json({authenticated: false}, { status: 200 })
    }
    return Response.json({authenticated: true, user: user})
  } catch (error) {
    console.error('Verify token error:', error)
    return Response.json({ authenticated: false, error: 'Token verification failed' }, { status: 401 })
  }
} 
```

- Consume it with

```js
import { getUserFromToken } from '@gonextgames/utils-server'
const user = await getUserFromToken("NAME_OF_USERS_TABLE", "TOKEN_NAME")
  if (!user) {
    redirect(`/login?from=${encodeURIComponent('/FROM-ENDPOINT')}`)
  }
```

- Create /api/auth/login /logout and /register

```js
// Register
const user = await registerUser(userData.name, userData.email, userData.password, { link: userData.link }, 'bgp_users')

// Login
const user = await loginWithEmailAndPassword(email, password, 'bgp_users', "token")

//Logout 
const cookieStore = await cookies()

cookieStore.set('token', '', {
httpOnly: true,
secure: process.env.ENVIRONMENT === 'production',
sameSite: 'lax',
path: '/',
expires: new Date(0)
})
```

### Users Table

The user table is standardized. Calling CRUD for users is handled by the package, where you pass the `TABLE_NAME` to the function every time you want to call it. 

```js
await updateUser(user.user_id, {
    contact_email: email,
}, 'bgp_users')
```

Nothing is stopping you from creating new ways to get the information, such as by the users /link, like in Board Game Prototypes.

The users table must have:

- user_id
- email
- name
- password

And a `email-user_id-index` secondary index.

## Error Intercepting and Logging

Logging errors is relatively plug and play. Within the main layout:

```js
import { AuthProvider, ErrorBoundary } from '@gonextgames/utils-client';

import { interceptErrors } from '@gonextgames/utils-server';
interceptErrors('bgp_server');

return <ErrorBoundary applicationLayer="bgp_react" isFallbackEnabled={false}>
    {children}    
</ErrorBoundary>
```

## Event Tracking
