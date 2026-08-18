import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Users from "./pages/Users";


function App() {

  return (
    <BrowserRouter>

      <Navbar />

      <main className="container">

        <Routes>

          <Route
            path="/"
            element={<Home />}
          />

          <Route
            path="/users"
            element={<Users />}
          />

        </Routes>

      </main>

    </BrowserRouter>
  );
}

export default App;