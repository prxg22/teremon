import { Outlet } from '@remix-run/react'

export default function Main() {
  return (
    <>
      <main className="flex flex-col bg-gradient-to-br bg-pink-200">
        <Outlet />
      </main>
    </>
  )
}
