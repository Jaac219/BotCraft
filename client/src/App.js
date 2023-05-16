
import { GoogleLogin, useGoogleLogin, googleLogout } from '@react-oauth/google';

import './App.css';

function App() {

  const onSuccess = (response)=>{
    console.log(response);
    fetch('http://127.0.0.1:5006/api/v1/gmail/mail/login', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(response)
    })  
  }

  const login = useGoogleLogin({
    onSuccess,
    flow: 'auth-code',
    accessType: "offline"
  });

  return (
    <div>
        {/* <GoogleLogin
          clientId="15508255064-345qde77ldsd4u8pqekd9q8j85tl5o7n.apps.googleusercontent.com"
          prompt='consent'
          onSuccess={login()}
          onError={() => {
            console.log('Login Failed')
          }}
        /> */}
        <button type='button' onClick={() => login()}> Login </button>
        <button type='button' onClick={() => googleLogout()}> LogOut </button>
    </div>
  )
}

export default App;
