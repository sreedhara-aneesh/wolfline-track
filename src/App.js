import './App.css';
import TransitMap from "./components/TransitMap/TransitMap";

/**
 * Root component for application
 *
 * @return {JSX.Element}
 */
const App = () => {
    return (
        <div>
            <TransitMap/>
        </div>
    );
}

export default App;