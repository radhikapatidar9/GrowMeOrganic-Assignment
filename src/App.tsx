import { useContext, useEffect } from 'react';
import { AppContext } from './context/AppContext';
import TableData from './components/TableData';

function App() {

  const {fetchPageData} = useContext(AppContext);
  
    useEffect(() => {
      fetchPageData();
    }, []);

  return (
    <div>
      <TableData/>
    </div>
  )
}

export default App;

