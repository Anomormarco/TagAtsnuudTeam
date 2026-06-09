import { NavLink, Route, Routes } from "react-router-dom";
import HallListPage from "./pages/HallListPage.jsx";
import HallDetailPage from "./pages/HallDetailPage.jsx";
import HallFormPage from "./pages/HallFormPage.jsx";

const App = () => {
  return (
    <div className="app-shell">
      <header className="topbar">
        <NavLink to="/" className="brand">
          Hall Booking
        </NavLink>
        <nav>
          <NavLink to="/" end>
            Halls
          </NavLink>
          <NavLink to="/halls/new">Add</NavLink>
        </nav>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<HallListPage />} />
          <Route path="/halls/new" element={<HallFormPage />} />
          <Route path="/halls/:id" element={<HallDetailPage />} />
          <Route path="/halls/:id/edit" element={<HallFormPage />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
