import Router from 'express'
import Output from "../Output.js";
const  subjectRouter = new Router();
import { v4 as uuidv4 } from 'uuid';
import TokenManager from "./tokenManager.js";
import axios from "axios";
import Data from "./data.js";



subjectRouter.post('/get_data',  async (req, res)=>{
    try{
        var {session_token, subjectId} = req.body;
        if(!session_token){
            session_token = req.headers.session_token;
        }

        let {access_token} = await TokenManager.Check(session_token);
        if(!access_token){
            res.status(400).json({"error":"not found token"});
            return;
        }
        let response_user = await axios.get(Data.Auth_address + '/user/get_data?access_token='+access_token);
        if(!response_user){
            res.status(400).json({"error":"not found user"});
            return;
        }


        let findSubject = false;
        if(subjectId) {
            for (let i = 0; i < response_user.data.subjectsId.length; i++) {
                if (response_user.data.subjectsId[i] === subjectId) {
                    findSubject = true;
                    break;
                }
            }
            if(!findSubject){
                res.status(400).json({"error":"not found subject"});
                return;
            }
            let response_subject = await axios.post(Data.Main_address + '/subject/get_data',{subjectsId:[subjectId]});
            if(!response_subject){
                res.status(400).json({"error":"not found subject"});
                return;
            }
            switch (response_user.data.role) {
                case 0:{
                    delete response_subject.data[0].usersId;
                    break;
                }
                case 1:
                {
                    break;
                }
                default:
                {
                    res.status(400).json({"error": "not found role"});
                    return;
                }
            }
            res.json(response_subject.data[0]);
            return;
        }

        let response_subject = await axios.post(Data.Main_address + '/subject/get_data',{subjectsId:response_user.data.subjectsId});
        if(!response_subject){
            res.status(400).json({"error":"not found subject"});
            return;
        }

        switch (response_user.data.role) {
            case 0:{
                for (let i = 0; i < response_subject.data.length; i++) {
                    delete response_subject.data[i].usersId;
                }

                break;
            }
            case 1:
            {
                break;
            }
            default:
            {
                res.status(400).json({"error": "not found role"});
                return;
            }
        }
        res.json(response_subject.data);
        return;

    }
    catch (e) {
        res.status(500).json({"error":"server"});
    }
});

subjectRouter.post('/add_subject',  async (req, res)=>{
    try{
        var {session_token, data} = req.body;
        if(!session_token){
            session_token = req.headers.session_token;
        }

        let {access_token} = await TokenManager.Check(session_token);
        if(!access_token){
            res.status(400).json({"error":"not found token"});
            return;
        }
        let response_user = await axios.get(Data.Auth_address + '/user/get_data?access_token='+access_token);
        if(!response_user){
            res.status(400).json({"error":"not found user"});
            return;
        }
        if(response_user.data.role !== 1) {
            res.status(400).json({"error": "not found role"});
            return;
        }
        console.log(",,,,,")

        data.userId = [response_user.data.userId];
        let response_subject = await axios.post(Data.Main_address + '/subject/add_subject',data);
        if(!response_subject){
            res.status(400).json({"error":"can't create"});
            return;
        }


        console.log("//")
        let response_user_public = await axios.post(Data.Auth_address + '/subject/add_subject',{userId:response_user.data.userId, subjectId:response_subject.data.subjectId});
        if(!response_user_public){
            res.status(400).json({"error":"not found user"});
            return;
        }
        console.log("//")
        res.json({ok:true});
        return;

    }
    catch (e) {
        res.status(500).json({"error":"server"});
    }
});

subjectRouter.post('/update_data',  async (req, res)=>{
    try{
        var {title, description, subjectId, session_token} = req.body;

        if(!session_token){
            session_token = req.headers.session_token;
        }
        let {access_token} = await TokenManager.Check(session_token);
        if(!access_token){
            res.status(400).json({"error":"not found token"});
            return;
        }
        let response_user = await axios.get(Data.Auth_address + '/user/get_data?access_token='+access_token);
        if(!response_user){
            res.status(400).json({"error":"not found user"});
            return;
        }
        if(response_user.data.role !== 1) {
            res.status(400).json({"error": "not found role"});
            return;
        }




        if(!subjectId || !description || !title) {
            res.status(400).json({"error": "not found title or description or subjectId"});
            return;
        }
        let findSubject = false;
        for (let i = 0; i < response_user.data.subjectsId.length; i++) {
            if (response_user.data.subjectsId[i] === subjectId) {
                findSubject = true;
                break;
            }
        }
        if(!findSubject){
            res.status(400).json({"error":"not found subject"});
            return;
        }


        let response_subject = await axios.post(Data.Main_address + '/subject/update_data',{title, description, subjectId});
        if(!response_subject){
            res.status(400).json({"error":"not found subject"});
            return;
        }

        res.json({ok:true});
        return;

    }
    catch (e) {
        console.log(e)
        res.status(500).json({"error":"server"});
    }
});

subjectRouter.post('/delete_data',  async (req, res)=>{
    try{
        var { subjectId, session_token} = req.body;

        if(!session_token){
            session_token = req.headers.session_token;
        }
        let {access_token} = await TokenManager.Check(session_token);
        if(!access_token){
            res.status(400).json({"error":"not found token"});
            return;
        }
        let response_user = await axios.get(Data.Auth_address + '/user/get_data?access_token='+access_token);
        if(!response_user){
            res.status(400).json({"error":"not found user"});
            return;
        }
        if(response_user.data.role !== 1) {
            res.status(400).json({"error": "not found role"});
            return;
        }


        let response_subject = await axios.post(Data.Main_address + '/subject/get_data',{ subjectsId:[subjectId]});
        if(!response_subject){
            res.status(400).json({"error":"not found subject"});
            return;
        }



        if(!subjectId && subjectId !== 0) {
            res.status(400).json({"error": "not found subjectId"});
            return;
        }
        let findSubject = false;
        for (let i = 0; i < response_user.data.subjectsId.length; i++) {
            if (response_user.data.subjectsId[i] === subjectId) {
                findSubject = true;
                break;
            }
        }
        console.log(response_user.data.userId,  response_subject.data[0].userId[0])
        if(!findSubject || response_user.data.userId !== response_subject.data[0].userId[0]){
            res.status(400).json({"error":"not found subject"});
            return;
        }



        let response_subject_main = await axios.post(Data.Main_address + '/subject/delete_data',{subjectId});
        if(!response_subject_main){
            res.status(400).json({"error":"not found subject"});
            return;
        }

        res.json({ok:true});
        return;

    }
    catch (e) {
        console.log(e)
        res.status(500).json({"error":"server"});
    }
});

subjectRouter.post('/get_all',  async (req, res)=>{
    try{
        var {session_token} = req.body;
        if(!session_token){
            session_token = req.headers.session_token;
        }

        let {access_token} = await TokenManager.Check(session_token);
        if(!access_token){
            res.status(400).json({"error":"not found token"});
            return;
        }
        let response_user = await axios.get(Data.Auth_address + '/user/get_data?access_token='+access_token);
        if(!response_user){
            res.status(400).json({"error":"not found user"});
            return;
        }



            let response_subjects = await axios.post(Data.Main_address + '/subject/get_all');
            if(!response_subjects){
                res.status(400).json({"error":"not found subject"});
                return;
            }



        for (let i = 0; i < response_subjects.data.length; i++) {
            delete response_subjects.data[i].usersId;
            delete response_subjects.data[i].testsId;
        }

        res.json(response_subjects.data);
        return;

    }
    catch (e) {
        res.status(500).json({"error":"server"});
    }
});


subjectRouter.post('/add_user',  async (req, res)=>{
    try{
        var {userId, subjectId, session_token} = req.body;

        if(!session_token){
            session_token = req.headers.session_token;
        }
        let {access_token} = await TokenManager.Check(session_token);
        if(!access_token){
            res.status(400).json({"error":"not found token"});
            return;
        }
        let response_user = await axios.get(Data.Auth_address + '/user/get_data?access_token='+access_token);
        if(!response_user){
            res.status(400).json({"error":"not found user"});
            return;
        }
        if(response_user.data.role !== 1) {
            res.status(400).json({"error": "not found role"});
            return;
        }




        if(!subjectId || !userId) {
            res.status(400).json({"error": "not found subjectId or userId"});
            return;
        }
        let findSubject = false;
        for (let i = 0; i < response_user.data.subjectsId.length; i++) {
            if (response_user.data.subjectsId[i] === subjectId) {
                findSubject = true;
                break;
            }
        }
        if(!findSubject){
            res.status(400).json({"error":"not found subject"});
            return;
        }


        let response_add_user = await axios.get(Data.Auth_address + '/user/get_public_data?access_token='+access_token + "&userId=" + userId);
        if(!response_add_user || response_add_user?.data?.role !== 0){
            res.status(400).json({"error":"not found add user"});
            return;
        }

        if( response_add_user?.data?.role === 0){
            let response_subject = await axios.post(Data.Main_address + '/subject/add_user',{userId:userId, subjectId:subjectId});
            if(!response_subject){
                res.status(400).json({"error":"not found subject"});
                return;
            }

        }else{
            let response_subject = await axios.post(Data.Main_address + '/subject/add_teacher',{userId:userId, subjectId:subjectId});
            if(!response_subject){
                res.status(400).json({"error":"not found subject"});
                return;
            }
        }

        console.log("bbb")
        let response_user_public = await axios.post(Data.Auth_address + '/subject/add_subject',{userId:userId, subjectId:subjectId});
        if(!response_user_public){
            res.status(400).json({"error":"not found user"});
            return;
        }

        res.json({ok:true});
        return;

    }
    catch (e) {
        res.status(500).json({"error":"server"});
    }
});

subjectRouter.post('/delete_user',  async (req, res)=>{
    try{
        var {userId, subjectId, session_token} = req.body;

        if(!session_token){
            session_token = req.headers.session_token;
        }
        let {access_token} = await TokenManager.Check(session_token);
        if(!access_token){
            res.status(400).json({"error":"not found token"});
            return;
        }
        let response_user = await axios.get(Data.Auth_address + '/user/get_data?access_token='+access_token);
        if(!response_user){
            res.status(400).json({"error":"not found user"});
            return;
        }
        if(response_user.data.role !== 1) {
            res.status(400).json({"error": "not found role"});
            return;
        }



        console.log("ggg")

        if(!subjectId || !userId) {
            res.status(400).json({"error": "not found subjectId or userId"});
            return;
        }
        let findSubject = false;
        for (let i = 0; i < response_user.data.subjectsId.length; i++) {
            if (response_user.data.subjectsId[i] === subjectId) {
                findSubject = true;
                break;
            }
        }
        if(!findSubject){
            res.status(400).json({"error":"not found subject"});
            return;
        }

        console.log("ggg")

        let response_add_user = await axios.get(Data.Auth_address + '/user/get_public_data?access_token='+access_token + "&userId=" + userId);
        if(!response_add_user){
            res.status(400).json({"error":"not found add user"});
            return;
        }

        console.log("ggg")

        let response_subject = await axios.post(Data.Main_address + '/subject/delete_user',{userId:userId, subjectId:subjectId});
        if(!response_subject){
            res.status(400).json({"error":"not found subject"});
            return;
        }
        console.log("bbb")
        let response_user_public = await axios.post(Data.Auth_address + '/subject/delete_subject',{userId:userId, subjectId:subjectId});
        if(!response_user_public){
            res.status(400).json({"error":"not found user"});
            return;
        }

        res.json({ok:true});
        return;

    }
    catch (e) {
        res.status(500).json({"error":"server"});
    }
});

subjectRouter.post('/add_user_self',  async (req, res)=>{
    try{
        var { subjectId, session_token} = req.body;

        if(!session_token){
            session_token = req.headers.session_token;
        }
        let {access_token} = await TokenManager.Check(session_token);
        if(!access_token){
            res.status(400).json({"error":"not found token"});
            return;
        }
        let response_user = await axios.get(Data.Auth_address + '/user/get_data?access_token='+access_token);
        if(!response_user){
            res.status(400).json({"error":"not found user"});
            return;
        }



        if(!subjectId ) {
            res.status(400).json({"error": "not found subjectId"});
            return;
        }

        console.log("yyy")

        if( response_user?.data?.role === 0){
            console.log("yyy")
            let response_subject = await axios.post(Data.Main_address + '/subject/add_user',{userId:response_user.data.userId, subjectId:subjectId});
            if(!response_subject){
                res.status(400).json({"error":"not found subject"});
                return;
            }

        }else{
            let response_subject = await axios.post(Data.Main_address + '/subject/add_teacher',{userId:response_user.data.userId, subjectId:subjectId});
            if(!response_subject){
                res.status(400).json({"error":"not found subject"});
                return;
            }
        }

        console.log("yyy")
        let response_user_public = await axios.post(Data.Auth_address + '/subject/add_subject',{userId:response_user.data.userId, subjectId:subjectId});
        if(!response_user_public){
            res.status(400).json({"error":"not found user"});
            return;
        }

        res.json({ok:true});
        return;

    }
    catch (e) {
        res.status(500).json({"error":"server"});
    }
});

subjectRouter.post('/delete_user_self',  async (req, res)=>{
    try{
        var { subjectId, session_token} = req.body;

        if(!session_token){
            session_token = req.headers.session_token;
        }
        let {access_token} = await TokenManager.Check(session_token);
        if(!access_token){
            res.status(400).json({"error":"not found token"});
            return;
        }
        let response_user = await axios.get(Data.Auth_address + '/user/get_data?access_token='+access_token);
        if(!response_user){
            res.status(400).json({"error":"not found user"});
            return;
        }



        console.log("gggDel")

        if(!subjectId) {
            res.status(400).json({"error": "not found subjectId"});
            return;
        }

        let findSubject = false;
        for (let i = 0; i < response_user.data.subjectsId.length; i++) {
            if (response_user.data.subjectsId[i] === subjectId) {
                findSubject = true;
                break;
            }
        }
        if(!findSubject){
            res.status(400).json({"error":"not found subject"});
            return;
        }


        console.log("gggDel")

        let response_subject = await axios.post(Data.Main_address + '/subject/delete_user',{userId:response_user.data.userId, subjectId:subjectId});
        if(!response_subject){
            res.status(400).json({"error":"not found subject"});
            return;
        }
        console.log("bbbDel")
        let response_user_public = await axios.post(Data.Auth_address + '/subject/delete_subject',{userId:response_user.data.userId, subjectId:subjectId});
        if(!response_user_public){
            res.status(400).json({"error":"not found user"});
            return;
        }

        res.json({ok:true});
        return;

    }
    catch (e) {
        res.status(500).json({"error":"server"});
    }
});

export default subjectRouter;