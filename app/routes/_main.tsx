import { Outlet } from '@remix-run/react'

export default function Main() {
  return (
    <>
      <main className="flex flex-col bg-gradient-to-br from-poke-pink-300 to-poke-pink-100">
        <Outlet />
      </main>
    </>
  )
}
