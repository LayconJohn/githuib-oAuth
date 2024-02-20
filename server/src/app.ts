import express, { Request, Response } from "express";
import querystring from "querystring";
import jwt from "jsonwebtoken";
import { get } from "lodash";
import cookieParser from "cookie-parser";
import axios from "axios";
import cors from "cors";

const app = express();

app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}))
app.use(express.json())

export interface IGithubUser {
  login:               string;
    id:                  number;
    node_id:             string;
    avatar_url:          string;
    gravatar_id:         string;
    url:                 string;
    html_url:            string;
    followers_url:       string;
    following_url:       string;
    gists_url:           string;
    starred_url:         string;
    subscriptions_url:   string;
    organizations_url:   string;
    repos_url:           string;
    events_url:          string;
    received_events_url: string;
    type:                string;
    site_admin:          boolean;
    name:                string;
    company:             null;
    blog:                string;
    location:            string;
    email:               string;
    hireable:            null;
    bio:                 string;
    twitter_username:    null;
    public_repos:        number;
    public_gists:        number;
    followers:           number;
    following:           number;
    created_at:          Date;
    updated_at:          Date;
}

const GITHUB_CLIENT_ID = "b3b407396a60d9eda39d";
const GITHUB_CLIENT_SECRET = "6a970e459465b11c9b27a2163503e494f01b658f";
const JWT_SECRET = "JubileuEstaEsquisitoHoje";
const COOKIE_NAME = 'github-jwt';

async function getGithubUser({ code }: {code: string}): Promise<IGithubUser> {
   const githubToken = await axios.post(`https://github.com/login/oauth/access_token?client_id=${GITHUB_CLIENT_ID}&client_secret=${GITHUB_CLIENT_SECRET}&code=${code}`)
    .then((res) => res.data)
    .catch((error) => {
      console.log(error);
      throw new Error('Error to get github user')
    });

    const decoded = querystring.parse(githubToken);
    const acessToken = decoded.access_token;
    
    return axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${acessToken}`
      }
    })
      .then((res) => res.data)
      .catch((err) => {
        console.error("Error to get User from Github")
      })
}

app.get('/api/auth/github', async (req: Request, res: Response) => {
  const code = get(req, "query.code");
  const path = get(req, "query.path");

  if (!code) {
    throw new Error("No code!");
  }

  const githubUser = await getGithubUser({ code });

  const token = jwt.sign(githubUser, JWT_SECRET);

  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    domain: 'localhost'
  })

  res.redirect(`http://localhost:3000${path}`);
});

app.get("/api/me", (req: Request, res: Response) => {
 
  const cookie = get(req, `cookies[${COOKIE_NAME}]`);

  try {
    const decode = jwt.verify(cookie, JWT_SECRET);

    return res.status(200).send(decode);
  } catch (e) {
    return res.send(null);
  }
});

app.listen(4000, () => console.log("Running on 4000..."))