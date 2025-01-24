import AppContext from './AppContext';
import GrandContainer from './GrandWindow';
// import MainWindow from './MainWindow';

AppContext.backend_url = 'https://rise.theweb.place/back'
AppContext.backend_point_select ='/f5.php?func=cp3.js_select_b'
AppContext.backend_point_query ='/f5.php?func=cp3.js_query_b'
AppContext.backend_point_insert ='/f5.php?func=cp3.js_insert_b'
AppContext.backend_point_update ='/f5.php?func=cp3.js_update_b'

function App() {

  return (
    <div className="App" style={{position: 'absolute', top: 0, margin:10}}>
      <GrandContainer/>
    </div>
  )
  
  return (
        <div>
            <h1>My React App</h1>
            <GrandContainer />
        </div>  
  )
}

export default App
