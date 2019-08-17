import React from 'react';
import axios from 'axios';
import Instascan from 'instascan-last';
import './App.css';

const BEEP_URL = "/servicetappsrpifair/webresources/api/beep"
const OPEN_TAP_URL = "/servicetappsrpifair/webresources/api/opentap"
const GET_QUANTITY_URL = "/servicetappsrpifair/webresources/api/mlservido"

const OPTS = {
	"tap_number": 1,
	"volume": 400
}

const Instascan = require('instascan');

function App() {
  const [customerId, setCustomerId] = React.useState('');
  const [quantity, setQuantity] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      axios.post(GET_QUANTITY_URL, OPTS).then(res => {
        setQuantity(res.data);
      })
    }, 500);
    return () => { clearInterval(interval); }
  }, [quantity]);

  const handleSubmit=(e) => {
    e.preventDefault()
    axios.post(OPEN_TAP_URL, OPTS)
    .then(res => console.log(res))
    .catch(err => {
      console.log(err);
    });
  };

    // fetch("https://dog.ceo/api/breeds/image/random")
    // .then(res => res.json())
    // .then(data => {
    //   record.done = true;
    //   record.data = data.message;
    // })
    // .catch(err => {
    //   throw err;
    // });
  // }

  const handleInputChange = (e) => {
    setCustomerId(e.target.value);
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>{customerId}: {quantity} ml</h1>
        <form onSubmit={handleSubmit}>
          <label htmlFor="customer_id">
            Seu código:
            <input type="text" name="customer_id" value={customerId} onChange={handleInputChange} />
          </label>
          <button type="submit">Abrir chopeira</button>
        </form>
      </header>
    </div>
  );
}

export default App;
