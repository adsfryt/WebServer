import Router from 'express'
import Output from "../Output.js";
const  userRouter = new Router();
import { v4 as uuidv4 } from 'uuid';
import axios from "axios";
import Request from "../Request.js";
import TokenManager from './tokenManager.js';
import Data from "./data.js";



userRouter.get('/get_data',  async (req, res)=>{
    try{
        var {session_token} = req.query;

        if(!session_token){
            session_token = req.headers.session_token;
        }

        let {access_token,refresh_token} = await TokenManager.Check(session_token);
        if(!access_token && !refresh_token){
            res.status(400).json({"error":"no found token"});
            return;
        }

        let response_user = await axios.get(Data.Auth_address + '/user/get_data?access_token='+access_token);
        console.log(response_user.data)
        if(response_user?.status){
            if(response_user.data.error === 0){
                res.status(403).json({error: "invalid token"});
            }else {
                res.status(200).json(response_user.data);
            }
        }else{
            res.status(500).json(response_user.data);
        }
    }
    catch (e) {
        res.status(500).json({"error":"server"});
    }});

userRouter.get('/get_public_data',  async (req, res)=>{
    try{
        var {userId, session_token} = req.query;

        if(!session_token){
            session_token = req.headers.session_token;
        }

        let {access_token,refresh_token} = await TokenManager.Check(session_token);
        if(!access_token && !refresh_token){
            res.status(400).json({"error":"no found token"});
            return;
        }

        let response_user = await axios.get(Data.Auth_address + '/user/get_public_data?access_token='+access_token + "&userId=" + userId);
        if(response_user?.status){
            if(response_user.data.error === 0){
                res.status(403).json({error: "invalid token"});
            }else {
                res.status(200).json(response_user.data);
            }
        }else{
            res.status(500).json(response_user.data);
        }
    }
    catch (e) {
        res.status(500).json({"error":"server"});
    }});

userRouter.post('/update_data',  async (req, res)=>{
    try{
        var {session_token,patronymic,firstName,lastName,login} = req.body;
        if(!session_token){
            session_token = req.headers.session_token;
        }

        let {access_token,refresh_token} = await TokenManager.Check(session_token);
        if(!access_token && !refresh_token){
            res.status(400).json({"error":"no found token"});
            return;
        }


        let response = await axios.post(Data.Auth_address + '/user/update_data',{
            "access_token": access_token,
            patronymic,firstName,lastName,login
        }).catch(async function (error) {
            try {

                if (error.response && error.response.status === 401) {
                    console.log("403")
                    let response_refresh = await axios.post(Data.Auth_address + '/user/refresh', {
                        refresh_token: refresh_token
                    });

                    if (response_refresh) {
                        let response = await axios.put(Data.WebServer_address + "/token/link_token",
                            {
                                "access_token": response_refresh.data.access_token,
                                "refresh_token": response_refresh.data.refresh_token,
                                "session_token": session_token
                            }
                        );
                    return await axios.post(Data.Auth_address + '/user/update_data', {
                        "access_token": response_refresh.data.access_token,
                        patronymic, firstName, lastName, login
                    });
                    }else{
                        throw new Error("Can't refresh token");
                    }

                }
            }
            catch (e) {
            }
        });


        if(response?.status){
            if(response.data.ok){
                res.status(200).json({ok:true});
            }else {
                res.status(403).json({error: "invalid token"});
            }
        }else{
            res.status(500).json(response_user.data);
        }
    }
    catch (e) {
        res.status(500).json({"error":"server"});
    }});

userRouter.post('/submit_role',  async (req, res)=>{
    try{
        var {session_token,role} = req.body;
        if(!session_token){
            session_token = req.headers.session_token;
        }
        let {access_token} = await TokenManager.Check(session_token);
        if(!access_token){
            res.status(400).json({"error":"no found token"});
            return;
        }
        let response_user = await axios.post(Data.Auth_address + '/user/submit_role',{access_token:access_token,role:role});
        console.log("user.activate")
        if(response_user){
            res.status(200).json(response_user.data);
        }else{
            res.status(500).json({"error":"can't do this"});
        }
    }
    catch (e) {
        res.status(500).json({"error":"server"});
    }});

userRouter.post('/submit_code',  async (req, res)=>{
    try{
        var {session_token,code} = req.body;
        if(!session_token){
            session_token = req.headers.session_token;
        }

        let reg_user = await axios.post(Data.Auth_address + '/user/submit_code',{code});

        if(reg_user){
            console.log("...c")
            let set_access_token = await axios.put(Data.WebServer_address+'/token/link_token', {
                access_token:reg_user.data.access_token,
                session_token:session_token,
                refresh_token:reg_user.data.refresh_token
            })
            console.log("...c")

            if(!set_access_token){
                res.status(400).json({"error":"can't register"});
                return;
            }
            console.log("...c")

            if(reg_user.data.activate){
                console.log("...1c")

                res.json({session_token:session_token,activate:true});
            }else{
                console.log("...2c")

                res.json({session_token:session_token});
            }
        }else {
            res.status(400).json({"error": "can't login"});
        }
    }
    catch (e) {
        res.status(500).json({"error":"server"});
    }});

userRouter.get('/get_code',  async (req, res)=>{
    try{
        var {session_token} = req.query;
        if(!session_token){
            session_token = req.headers.session_token;
        }
        let {access_token} = await TokenManager.Check(session_token);
        if(!access_token){
            res.status(400).json({"error":"not found token"});
            return;
        }

        let response = await axios.get(Data.Auth_address + '/user/get_code?access_token='+access_token);
        if(!response){
            res.status(400).json({"error":"can't get code"});
            return;
        }
        res.json({code:response.data.code});
    }
    catch (e) {
        res.status(500).json({"error":"server"});
    }});

userRouter.get('/link_registration',  async (req, res)=>{
    try{
        var {session_token,type} = req.query;
        if(!session_token){
            session_token = req.headers.session_token;
        }
        if (!session_token) {
            res.status(400).json({"error":"no found token"});
            return;
        }

        let reg_user;
        switch (type){
            case "yandex":{
                reg_user = await axios.get(Data.Auth_address + '/user/link_reg_yandex');
                break;
            }
            case "github":{
                reg_user = await axios.get(Data.Auth_address + '/user/link_reg_github');
                break;
            }
            default: {
                res.status(400).json({"error":"undefined type"});
                return;
            }
        }
        if(reg_user?.status){
            res.json(reg_user.data);
        }else{
            res.status(400).json({"error":"can't create link"});
        }
    }
    catch (e) {
        res.status(500).json({"error":"server"});
    }
});

userRouter.get('/link_registration_tg',  async (req, res)=>{
    try{
        var {session_token,type} = req.query;
        if(!session_token){
            session_token = req.headers.session_token;
        }
        if (!session_token) {
            res.status(400).json({"error":"no found token"});
            return;
        }

        let reg_user;
        switch (type){
            case "yandex":{
                reg_user = await axios.get(Data.Auth_address + '/user/link_reg_yandex_tg?session_token='+ session_token);
                break;
            }
            case "github":{
                reg_user = await axios.get(Data.Auth_address + '/user/link_reg_github_tg?session_token='+session_token);
                break;
            }
            default: {
                res.status(400).json({"error":"undefined type"});
                return;
            }
        }
        if(reg_user?.status){
            res.json(reg_user.data);
        }else{
            res.status(400).json({"error":"can't create link"});
        }
    }
    catch (e) {
        res.status(500).json({"error":"server"});
    }
});

userRouter.get('/registration_tg',  async (req, res)=>{
    try{
        let {state,type,code} = req.query;

        if(!state || !code){
            res.status(400).json({"error":"no found state or code"});
            return;
        }
        let session_token = state;
        if(!session_token){
            session_token = req.headers.session_token;
        }

        if (!session_token) {
            res.status(400).json({"error":"no found token"});
            return;
        }
        console.log("user_tg")

        let reg_user;
        switch (type){
            case "yandex":{
                reg_user = await axios.get(Data.Auth_address + '/user/reg_yandex?type=tg&code=' + code);
                break;
            }
            case "github":{
                reg_user = await axios.get(Data.Auth_address + '/user/reg_github?type=tg&code=' + code);
                break;
            }
            default: {
                res.status(400).json({"error":"undefined type"});
                return;
            }
        }

        if(reg_user){
            console.log("...")
            let set_access_token = await axios.put(Data.WebServer_address+'/token/link_token', {
                access_token:reg_user.data.access_token,
                session_token:session_token,
                refresh_token:reg_user.data.refresh_token
            })
            console.log("...")

            if(!set_access_token){
                res.status(400).json({"error":"can't register"});
                return;
            }
            console.log("...")

            console.log("...")

            let set_Change_Token = await axios.put(Data.WebServer_address+'/token/link_token', {
                access_token:reg_user.data.access_token,
                session_token:session_token,
                refresh_token:reg_user.data.refresh_token
            });


            let add_token = await axios.put(Data.WebServer_address+'/token/set_users_token',{session_token, userId:reg_user.data.userId});
            if(!(add_token)){
                res.status(400).json({"error":"can't add token"});
                return;
            }

            res.status(200).json({ok:true,"message":"вы вошли в систему. Можете закрыть сайт и продолжить работу в телеграм боте"});
        }else{
            res.status(400).json({"error":"can't register"});
        }
    }
    catch (e) {

        res.status(500).json({"error":"server"});
    }
});

userRouter.post('/registration',  async (req, res)=>{
    try{
        let {session_token,type,code} = req.body;
        if(!session_token){
            session_token = req.headers.session_token;
        }
        if (!session_token) {
            res.status(400).json({"error":"no found token"});
            return;
        }
        console.log("user")
        // let {access_token} = (await Request.send('token/get_access_token?session_token=' + session_token, {method: 'get'})).data;
        // if ((access_token === "none")) {
        //     console.log("none")
        // }else{
        //     if(access_token === null){
        //         console.log("null")
        //         res.status(400).json({"error":"no found token"});
        //         return;
        //     }
        //     console.log("other")
        //     let response_user = await axios.get('http://localhost:6000/user/get_data?access_token='+access_token);
        //     if(response_user.status){
        //         console.log("err")
        //         res.status(400).json({"error":"you already register"});
        //         return;
        //     }
        // }
        // console.log("user")


        let reg_user;
        switch (type){
            case "yandex":{
                reg_user = await axios.get(Data.Auth_address + '/user/reg_yandex?code=' + code);
                break;
            }
            case "github":{
                reg_user = await axios.get(Data.Auth_address + '/user/reg_github?code=' + code);
                break;
            }
            default: {
                res.status(400).json({"error":"undefined type"});
                return;
            }
        }

        if(reg_user){
            console.log("...")
            let set_access_token = await axios.put(Data.WebServer_address+'/token/link_token', {
                        access_token:reg_user.data.access_token,
                        session_token:session_token,
                refresh_token:reg_user.data.refresh_token
                })
            console.log("...")

            if(!set_access_token){
                res.status(400).json({"error":"can't register"});
                return;
            }
            console.log("...")

            console.log("...")

            let set_Change_Token = await axios.put(Data.WebServer_address+'/token/link_token', {
                access_token:reg_user.data.access_token,
                session_token:session_token,
                refresh_token:reg_user.data.refresh_token
            });


            let add_token = await axios.put(Data.WebServer_address+'/token/set_users_token',{session_token, userId:reg_user.data.userId});
            if(!(add_token)){
                res.status(400).json({"error":"can't add token"});
                return;
            }

            if(reg_user.data.activate){
                console.log("...1")

                res.json({session_token:session_token,activate:true});
            }else{
                console.log("...2")

                res.json({session_token:session_token});
            }
        }else{
            res.status(400).json({"error":"can't register"});
        }
    }
    catch (e) {

        res.status(500).json({"error":"server"});
    }
});

userRouter.post('/logout',  async (req, res)=>{
    try{
        var {session_token} = req.body;
        if(!session_token){
            session_token = req.headers.session_token;
        }
        let {access_token,refresh_token} = await TokenManager.Check(session_token);
        if(!access_token){
            res.status(400).json({"error":"no found token"});
            return;
        }

        let response_user = await axios.post(Data.Auth_address +'/user/logout',{access_token,refresh_token});

        if(!(response_user)){
            res.status(400).json({"error":"can't delete"});
            return;
        }

        let delete_session_token = await axios.post(Data.WebServer_address+'/token/delete_token',{session_token});
        if(!(delete_session_token.data.ok)){
            res.status(400).json({"error":"can't delete token"});
            return;
        }

        res.json({ok: true});
    }
    catch (e) {
        res.status(500).json({"error":"server"});
    }});

userRouter.post('/full_logout',  async (req, res)=>{
    try{
        var {session_token} = req.body;
        if(!session_token){
            session_token = req.headers.session_token;
        }
        let {access_token,refresh_token} = await TokenManager.Check(session_token);
        if(!access_token){
            res.status(400).json({"error":"no found token"});
            return;
        }

        let response_user = await axios.post(Data.Auth_address +'/user/full_logout',{access_token});

        if(!(response_user)){
            res.status(400).json({"error":"can't delete"});
            return;
        }
        console.log(response_user.data)
        let sessions_token = await axios.get(Data.WebServer_address+'/token/get_users_token?userid='+response_user.data.userId);
        if(!(sessions_token)){
            res.status(400).json({"error":"can't get token"});
            return;
        }

        for (let i = 0; i <  sessions_token.data.length; i++) {

            let delete_session_token = await axios.post(Data.WebServer_address+'/token/delete_token',{session_token:sessions_token.data[i]});
            if(!(delete_session_token)){
                res.status(400).json({"error":"can't delete token"});
                return;
            }
        }

        let delete_user_session_token = await axios.post(Data.WebServer_address+'/token/delete_token',{ session_token:response_user.data.userId });
        if(!(delete_user_session_token)){
            res.status(400).json({"error":"can't delete user token"});
            return;
        }

        res.json({ok: true});
    }
    catch (e) {
        console.log(e)
        res.status(500).json({"error":"server"});
    }});

export default userRouter;