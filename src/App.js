import React from 'react';
import axios from 'axios';
import Instascan from 'instascan-last';
import './App.css';

const BEEP_URL = "/servicetappsrpifair/webresources/api/beep"
const OPEN_TAP_URL = "/servicetappsrpifair/webresources/api/opentap"
const GET_QUANTITY_URL = "/servicetappsrpifair/webresources/api/mlservido"

const OPTS = {
	"tap_number": 1,
	"volume": 300
}

const STATUSES = {
  'CLOSED': 'closed',
  'OPEN': ' open'
};


function App() {
  const [customerId, setCustomerId] = React.useState('');
  const [quantity, setQuantity] = React.useState(0);
  const [history, setHistory] = React.useState({});
  const [status, setStatus] = React.useState(STATUSES.CLOSED);
  const videoRef  = React.useRef(null);

  React.useEffect(() => {
    console.log('persist', history);
    localStorage.setItem('history', JSON.stringify(history));
  }, [history]);

  React.useEffect(() => {
    const stored = localStorage.getItem('history');
    setHistory(JSON.parse(stored));
    const interval = setInterval(() => {
      axios.post(GET_QUANTITY_URL, OPTS).then(res => {
        if (res.data === quantity) {
          setStatus(STATUSES.CLOSED);
        } else {
          setStatus(STATUSES.OPEN);
          setQuantity(res.data);
        }
      })
    }, 500);
    return () => { clearInterval(interval); }
  }, []);

  const openCamera=(e) => {
    e.preventDefault()

    const scanner = new Instascan.Scanner({
      video: videoRef.current,
      backgroundScan: false,
      scanPeriod: 2,
    });

    scanner.addListener('scan', (token) => {
      const lastToken = localStorage.getItem('lastToken');
      const lastHistory = JSON.parse(localStorage.getItem('history'));
      if (lastToken) {
        const customerValue = lastHistory[lastToken] || 0;
        setHistory({
          ...lastHistory,
          [lastToken]: customerValue + quantity
        });
      }
      setCustomerId(token);
      localStorage.setItem('lastToken', token);
      setQuantity(0);
      axios.post(OPEN_TAP_URL, OPTS).then(res => {
        setStatus(STATUSES.OPEN);
      })
    });

    Instascan.Camera.getCameras().then(function (cameras) {
        if (cameras.length > 0) {
          scanner.start(cameras[0]);
        } else {
          console.error('No cameras found.');
        }
      }).catch(function (e) {
        console.error(e);
      });
  };

  const handleInputChange = (e) => {
    setCustomerId(e.target.value);
  }

  return (
    <div className="App">
      <header className="App-header">
        <video ref={videoRef}></video>
        <h1 className={status === STATUSES.CLOSED ? "closed" : " open"}>{customerId}: {quantity} ml</h1>
        <button type="submit" onClick={openCamera}>Abrir Camera</button>
        <table>
          <tbody>
            <tr><th>Cliente</th><th>ML</th></tr>
            {Object.keys(history).map(cid => (
              <tr><td>{cid}</td><td>{history[cid]}</td></tr>
            ))}
          </tbody>
        </table>
      </header>
    </div>
  );
}

export default App;
