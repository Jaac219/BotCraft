import { useGoogleLogin, googleLogout } from '@react-oauth/google';

import './App.css';

function App() {

  const onSuccess = (response)=>{
    console.log(response);
    fetch('http://127.0.0.1:5006/api/v1/mail/login', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(response)
    })  
  }

  // const scopes = [
  //   'profile',
  //   'email',
  //   'https://www.googleapis.com/auth/gmail.addons.current.action.compose',
  //   'https://www.googleapis.com/auth/gmail.addons.current.message.action',
  //   'https://www.googleapis.com/auth/gmail.labels',
  //   'https://www.googleapis.com/auth/iam.test',
  //   'https://www.googleapis.com/auth/gmail.modify',
  //   'https://www.googleapis.com/auth/gmail.compose',
  //   'https://www.googleapis.com/auth/gmail.readonly',
  //   'https://www.googleapis.com/auth/gmail.metadata',
  //   'https://www.googleapis.com/auth/gmail.insert',
  //   'https://www.googleapis.com/auth/gmail.settings.basic',
  //   'https://www.googleapis.com/auth/gmail.settings.sharing',
  // ];

  const login = useGoogleLogin({
    onSuccess,
    // clientId: '15508255064-25c233f3fr2pu7jr3sju3afgo8v7pqgb.apps.googleusercontent.com',
    flow: 'auth-code',
    // scope: ['https://www.googleapis.com/auth/gmail.readonly'],
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
