import logo from './logo.svg';
import './App.css';
import TransitMap from "./components/TransitMap/TransitMap";

/**
 * Root component for application
 *
 * @return {JSX.Element}
 */
const App = () => {
    return (
        <TransitMap/>
    );
}

export default App;