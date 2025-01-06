import Router from 'express'
import Output from "../Output.js";
const  tokenRouter = new Router();
import { v4 as uuidv4 } from 'uuid';
import {createClient} from "redis";

let client = createClient();
client.on('error', err => Output('Redis Client Error', err));
client.on('connect', () => Output('Redis start'));
await client.connect();



tokenRouter.get('/get_access_token',  async (req, res)=>{
    try{
        var {session_token} = req.query;
        if(!session_token){
           session_token = req.headers.session_token;

        }

        let tokens;
        if(session_token){
            tokens = await client.get(session_token);
        }else {
            res.status(400).json({"error":"no parameters"});
            return;
        }
        if(!tokens ){
            res.json(
                {access_token: null,
                refresh_token: null}
            )
        }else if(tokens==="none") {
            res.json(
                {access_token: "none",
                    refresh_token: "none"}
            )
        }else {
            res.json({...JSON.parse(tokens)})
        }
    }
    catch (e) {
        res.status(500).json({"error":"server"});    }});

tokenRouter.post('/create_token',  async (req, res)=>{
    try{
        var {access_token, refresh_token} = req.body;
        let session_token = uuidv4();
        if(access_token){
            await client.set(session_token, JSON.stringify(
                {access_token:access_token,
                    refresh_token:refresh_token}
                ));
        }else {
            await client.set(session_token,"none");
        }

        res.json({session_token: session_token})
    }
    catch (e) {
        res.status(500).json({"error":"server"});    }});

tokenRouter.post('/delete_token',  async (req, res)=>{
    try{
        let {session_token} = req.body;
        if(!session_token){
            session_token = req.headers.session_token;
        }
        let result;
        if(session_token){
            result = await client.del(session_token);
        }else {
            res.status(400).json({"error":"no parameters"});
            return;
        }
        if(result) {
            res.json({ok: true})
        }else{
            res.status(200).json({"error":"not found token or can't delete"})
        }
    }
    catch (e) {
        res.status(500).json({"error":"server"});
    }});

tokenRouter.put('/link_token',  async (req, res)=>{
    try{
        var {access_token,session_token, refresh_token} = req.body;
        if(!session_token){
            session_token = req.headers.session_token;
        }
        let result;
        if(access_token && session_token && refresh_token){
            console.log("oki")
            let get_session_token = true;
            console.log(get_session_token)
            console.log("hhh")
            if(get_session_token) {
                console.log("ooo")
                result = await client.set(session_token, JSON.stringify(
                    {access_token:access_token,
                        refresh_token:refresh_token}
                ));
            }else{
                console.log("noo")
                res.status(404).json({"error":"not found token"});
                return;
            }
        }else {
            console.log("lo")
            res.status(400).json({"error":"no parameters"});
            return;
        }

        if(result) {
            res.json({ok: true})
        }else{
            console.log("wha")
            res.status(404).json({"error":"something going wrong"})
        }
    }
    catch (e) {
        res.status(500).json({"error":"server"});    }});


tokenRouter.put('/set_users_token',  async (req, res)=>{
    try{
        var {session_token, userId} = req.body;
        if(!session_token){
            session_token = req.headers.session_token;
        }

        let result;
        if(userId){
            console.log("aaa")
            let get_sessions_token = await client.get(userId);

            if(get_sessions_token) {
                console.log("aaa")
                result = await client.set(userId, JSON.stringify(
                    [...JSON.parse(get_sessions_token),session_token]
                ));
            }else{
                result = await client.set(userId, JSON.stringify(
                    [session_token]
                ));

            }
        }else {
            console.log("lo")
            res.status(400).json({"error":"no parameters"});
            return;
        }

        if(result) {
            res.json({ok: true})
        }else{
            console.log("wha")
            res.status(500).json({"error":"something going wrong"})
        }
    }
    catch (e) {
        console.log(e)
        res.status(500).json({"error":"server"});    }});

tokenRouter.get('/get_users_token',  async (req, res)=>{
    try{
        var {userid} = req.query;

        let result;
        if(userid){
            console.log("aaaGet")
            let get_sessions_token = await client.get(userid);
            console.log(get_sessions_token)
            if(get_sessions_token) {
                res.json(JSON.parse(get_sessions_token))
                return;
            }else{
                console.log("aaa")
                res.status(404).json({"error":"not found tokens"});
                return;
            }

        }else {
            console.log("lo")
            res.status(400).json({"error":"no parameters"});
            return;
        }


    }
    catch (e) {
        console.log(e);
        res.status(500).json({"error":"server"});
    }});


export default tokenRouter;