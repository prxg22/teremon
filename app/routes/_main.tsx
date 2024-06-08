import { Outlet } from '@remix-run/react'

export default function Main() {
  return (
    <>
      <main className="flex flex-col flex-grow flex-shrink-0 basis-[100vh]">
        <Outlet />
      </main>
    </>
  )
}
