import { NavLink, Route, Routes } from 'react-router'
import EntriesPage from './pages/EntriesPage.tsx'
import NewEntryPage from './pages/NewEntryPage.tsx'

export default function App() {
  return (
    <div className="app">
      <header className="header">
        <p className="brand">Final Girl</p>
        <nav>
          <NavLink to="/" end>
            Записи
          </NavLink>
          <NavLink to="/entries/new">Новая запись</NavLink>
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<EntriesPage />} />
          <Route path="/entries/new" element={<NewEntryPage />} />
          <Route path="*" element={<p>Страница не найдена.</p>} />
        </Routes>
      </main>
    </div>
  )
}
