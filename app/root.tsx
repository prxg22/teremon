import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from '@remix-run/react'

import './fonts.css'
import './styles.css'

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration
          getKey={(location, matches) => {
            if (location.pathname.match(/^\/pokemon\/?$/i)) {
              return location.pathname
            }
            return location.key
          }}
        />
        <Scripts />
      </body>
    </html>
  )
}
