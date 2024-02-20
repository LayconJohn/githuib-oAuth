import { useState, useEffect } from "react";
import axios from "axios";
import { CgHello } from "react-icons/cg";
import "./reset.css"
import "./App.css";


const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const gitHubRedirectURL = process.env.GITHUB_REDIRECT_URL;
const path = '/';

function App() {

  const [user, setUser] = useState();

  useEffect(() => {

    (async function() {
      axios.get(`http://localhost:4000/api/me`, {
        withCredentials: true
      })
        .then((res) => {
          console.log(res)
          setUser(res.data)
        })
    })();
    
  }, [])

  return (
    <div className="App">
      <div className="Logout">
        LOGOUT
      </div>
      {!user ?
      <a href={`https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${gitHubRedirectURL}?path=${path}&scope=user:email`}>
       LOGIN WITH GITHUB
      </a> 
       : 
       <div className="Welcome">
          <img src={user.avatar_url}/>
          <h1>Bem vindo(a)<span> {user.name} </span>  <CgHello /></h1>
          <p>Repositório: 
            <span className="Link">
             <a href={`https://github.com/${user.login}`} target="blank"> /{user.login} </a> 
             </span>
          </p>
          <p>
            Bio: <span> {user.bio} </span>
          </p>
          <p>
            Repositórios: <span> {user.public_repos} </span>
          </p>
          <p>
            Localização: <span> {user.location} </span>
          </p>
       </div>
       
      }
    </div>
  );
}

export default App;
