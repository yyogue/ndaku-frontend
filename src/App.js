import { BrowserRouter, Routes, Route } from "react-router-dom";
import Footer from "./components/Footer/Footer";
import NavBar from "./components/Navbar/NavBar";
import Home from "./components/Home/Home";
import ViewCard from "./components/ViewCard/ViewCard";
import "./App.css";


function App() {
  return (
    <div>
      <BrowserRouter>
        <NavBar />
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/home' element={<Home />} />
          <Route path='/view/:listingId' element={<ViewCard />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </div>
  );
};

export default App;
