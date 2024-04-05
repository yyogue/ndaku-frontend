import './App.css';
import BackGround from './components/BackGround/BackGround';
import Cards from './components/Cards/Cards';
import NavBar from './components/Navbar/NavBar';

function App() {
  return (
    <div>
      <div>
        <NavBar />
      </div>
      <div>
        <BackGround />
      </div>
      <div>
        <Cards />
      </div>
    </div>
  );
}

export default App;
