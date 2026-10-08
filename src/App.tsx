import { NavLink, Route, Routes } from 'react-router'
import EntriesPage from './pages/EntriesPage.tsx'
import NewEntryPage from './pages/NewEntryPage.tsx'

const linkClassName = ({ isActive }: { isActive: boolean }) =>
  isActive
    ? 'text-white underline underline-offset-4'
    : 'text-zinc-300 hover:text-white'

export default function App() {
  return (
    <div className="min-h-svh bg-zinc-700 px-6 py-10 text-zinc-100">
      <div className="mx-auto grid w-full grid-cols-12">
        <div className="col-span-8 col-start-3 flex flex-col items-center">
          <header className="mb-8 flex w-full flex-col items-center gap-4 text-center">
            <p className="text-2xl font-semibold">Final Girl</p>
            <nav className="flex justify-center gap-6">
              <NavLink to="/" end className={linkClassName}>
                Entries
              </NavLink>
              <NavLink to="/entries/new" className={linkClassName}>
                New entry
              </NavLink>
            </nav>
          </header>
          <main className="w-full">
            <Routes>
              <Route path="/" element={<EntriesPage />} />
              <Route path="/entries/new" element={<NewEntryPage />} />
              <Route path="*" element={<p className="text-center">Page not found.</p>} />
            </Routes>
          </main>
        </div>
      </div>
    </div>
  )
}
