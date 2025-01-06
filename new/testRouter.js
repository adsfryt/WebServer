import Router from 'express'
import Output from "../Output.js";
const  testRouter = new Router();
import { v4 as uuidv4 } from 'uuid';
import TokenManager from "./tokenManager.js";
import axios from "axios";
import Data from "./data.js";




testRouter.post('/get_data',  async (req, res)=>{
    try{
        var {session_token, subjectId, testId} = req.body;
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





        let response_subject = await axios.post(Data.WebServer_address + '/subject/get_data',{session_token, subjectId});

        if(!response_subject){
            res.status(400).json({"error":"not found subject or you didn't login"});
            return;
        }




        let findSubject = false;
        if(testId) {
            for (let i = 0; i < response_subject.data.testsId.length; i++) {
                if (response_subject.data.testsId[i] === testId) {
                    findSubject = true;
                    console.log("//")
                    break;
                }
            }
            if(!findSubject){
                res.status(400).json({"error":"not found test"});
                return;
            }

            let response_test = await axios.post(Data.Main_address + '/test/get_data',{testsId:[testId]});
            if(!response_test){
                res.status(400).json({"error":"not found test"});
                return;
            }

            switch (response_user.data.role) {
                case 0:{
                    for (let i = 0; i < response_test.data.length; i++) {
                        delete response_test.data[i].attempts;
                        delete response_test.data[i].questions;
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

            res.json(response_test.data[0]);
            return;
        }

        let response_test = await axios.post(Data.Main_address + '/test/get_data',{testsId:response_subject.data.testsId});
        if(!response_test){
            res.status(400).json({"error":"not found subject"});
            return;
        }

        switch (response_user.data.role) {
            case 0:{
                for (let i = 0; i < response_test.data.length; i++) {
                    delete response_test.data[i].attempts;
                    delete response_test.data[i].questions;
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

        res.json(response_test.data);
        return;

    }
    catch (e) {
        res.status(500).json({"error":"server"});
    }
});

testRouter.post('/add_test',  async (req, res)=>{
    try{
        var {data, session_token} = req.body;

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

        console.log("gdfddfdghgfhgf")



        let findSubject = false;
        for (let i = 0; i < response_user.data.subjectsId.length; i++) {
            if (response_user.data.subjectsId[i] === data.subjectId) {
                findSubject = true;
                break;
            }
        }
        if(!findSubject){
            res.status(400).json({"error":"not found subject"});
            return;
        }
        console.log("gdfddfdghgfhgf")

        let response_question = await axios.post(Data.Main_address + '/test/get_questions',{questionsId:data.questionsId });
        if(!response_question || response_question.data.length !== data.questionsId.length){
            res.status(400).json({"error":"not found questions"});
            return;
        }
        console.log("gdfddfdghgfhgf")
        data.userId = response_user.data.userId;
        console.log(data)
        let response = await axios.post(Data.Main_address + '/test/add_test',data);
        if(!response){
            res.status(400).json({"error":"not found user"});
            return;
        }
        console.log("gdfddfdghgfhgf")

        res.json({ok:true});
        return;

    }
    catch (e) {
        res.status(500).json({"error":"server"});
    }
});

testRouter.post('/update_data',  async (req, res)=>{
    try{
        var {testId,data, session_token} = req.body;

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


        console.log("fff.")
        let response_test = await axios.post(Data.Main_address + '/test/get_data',{testsId:[testId]});
        if(!response_test ){
            res.status(400).json({"error":"not found test"});
            return;
        }


        console.log()

        // if(response_test.data[0].userId !== response_user.data.userId){
        //     res.status(400).json({"error":"not found author"});
        //     return;
        // }

        console.log("fff.")
        let response_attempts = await axios.post(Data.Main_address + '/test/get_attempts_t',{testId:testId });
        if(!response_attempts ){
            res.status(400).json({"error":"not found test"});
            return;
        }
        console.log("fff.")
        if(response_attempts.data[0]) {
            let response = await axios.post(Data.Main_address + '/test/update_data', {
                testId,
                name: data.name,
                description: data.description,
                activate: data.activate
            });
            if (!response) {
                res.status(400).json({"error": "can't change"});
                return;
            }
        }else {
            console.log("fff.")
            let response = await axios.post(Data.Main_address + '/test/update_data', {
                testId,
                name: data.name,
                description: data.description,
                activate: data.activate,
                questionsId: data.questionsId
            });
            if (!response) {
                res.status(400).json({"error": "can't update"});
                return;
            }
        }
        console.log("fff.")
        return res.json({ok:true});
    }
    catch (e) {
        console.log(e);
        res.status(500).json({"error":"server"});
    }
});

testRouter.post('/get_full_data',  async (req, res)=>{
    try{
        var {session_token, testId} = req.body;
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
        if(!testId) {
            res.status(400).json({"error": "not found test"});
            return;
        }



        let response_test = await axios.post(Data.Main_address + '/test/get_data',{testsId:[testId]});
        if(!response_test){
            res.status(400).json({"error":"not found test"});
            return;
        }

        let findSubject = false;
        for (let i = 0; i < response_user.data.subjectsId.length; i++) {
            if (response_user.data.subjectsId[i] === response_test.data[0].subjectId) {
                findSubject = true;
                break;
            }
        }
        if(!findSubject){
            res.status(400).json({"error":"not found test"});
            return;
        }

        let response_question = await axios.post(Data.Main_address + '/test/get_questions',{questionsId:response_test.data[0].questionsId });
        if(!response_question || response_question.data.length !== response_test.data[0].questionsId.length){
            res.status(400).json({"error":"not found questions"});
            return;
        }

        let response_attempts = await axios.post(Data.Main_address + '/test/get_attempts_t',{testId:testId });
        if(!response_attempts ){
            res.status(400).json({"error":"not found test"});
            return;
        }

        let Arr = [];
        for (let i = 0; i < response_question.data.length; i++) {
            Arr.push(response_question.data[i].var[response_question.data[i].var.length - 1])
        }

        return res.json({attempts:response_attempts.data ,data:response_test.data[0], questions:Arr });
    }
    catch (e) {
        res.status(500).json({"error":"server"});
    }
});

testRouter.post('/start_test',  async (req, res)=>{
    try{
        var {subjectId, testId, session_token} = req.body;

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
        if(response_user.data.role !== 0) {
            res.status(400).json({"error": "not found role"});
            return;
        }

        let response_subject = await axios.post(Data.WebServer_address + '/subject/get_data',{session_token, subjectId});
        if(!response_subject){
            res.status(400).json({"error":"not found subject or you didn't login"});
            return;
        }


        let findTest = false;
        for (let i = 0; i < response_subject.data.testsId.length; i++) {
            if (response_subject.data.testsId[i] === testId) {
                findTest = true;
                break;
            }
        }
        if(!findTest){
            res.status(400).json({"error":"not found test"});
            return;
        }


        //console.log("?//")

        let response_test = await axios.post(Data.Main_address + '/test/get_data',{testsId:[testId]});
        if(!response_test || !response_test.data[0].activate){
            res.status(400).json({"error":"not found test"});
            return;
        }
        //console.log("?//")
        
        
        let response_attempt = await axios.post(Data.Main_address + '/test/get_active_attempt',{userId:response_user.data.userId, testId:testId });
        if(!response_attempt || response_attempt.data.attemptId !== -1){
            res.status(400).json({"error":"already have active attempt"});
            return;
        }

        //console.log(response_test.data)

        let response_question = await axios.post(Data.Main_address + '/test/get_questions',{questionsId:response_test.data[0].questionsId });
        //console.log(response_question.data.length, response_test.data[0].questionsId.length)
        if(!response_question || response_question.data.length !== response_test.data[0].questionsId.length){
            res.status(400).json({"error":"not found questions"});
            return;
        }
        //console.log(response_question.data)

        let lastsId = [];
        for (let i = 0; i < response_question.data.length; i++) {
            lastsId.push(response_question.data[i].var.length-1);
        }
        //console.log(lastsId)

        let response = await axios.post(Data.Main_address + '/test/add_attempt',{testId:testId, userId:response_user.data.userId, lastsId:lastsId});
        if(!response){
            res.status(400).json({"error":"not found user"});
            return;
        }

        return res.json({attemptId:response.data.attemptId});
    }
    catch (e) {
        res.status(500).json({"error":"server"});
    }
});

testRouter.post('/save_answers',  async (req, res)=>{
    try{
        var {attemptId, answers, session_token} = req.body;

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
        if(response_user.data.role !== 0) {
            res.status(400).json({"error": "not found role"});
            return;
        }



        let response_attempt = await axios.post(Data.Main_address + '/test/get_attempts',{attemptsId:[attemptId] });
        if(!response_attempt || response_attempt.data[0].finished){
            res.status(400).json({"error":"not found attempt or it was finished"});
            return;
        }
        console.log("?//")
        if(answers.length !== response_attempt.data[0].data.length){
            res.status(400).json({"error":"wrong syntax"});
            return;
        }
        console.log("?//")
        let response_test = await axios.post(Data.Main_address + '/test/get_data',{testsId:[response_attempt.data[0].testId]});
        if(!response_test || !response_test.data[0].activate){
            res.status(400).json({"error":"not found test"});
            return;
        }
        console.log("?//")


        let findSubject = false;
        for (let i = 0; i < response_user.data.subjectsId.length; i++) {
            if (response_user.data.subjectsId[i] === response_test.data[0].subjectId &&  response_user.data.userId ===response_attempt.data[0].userId) {
                findSubject = true;
                break;
            }
        }
        if(!findSubject){
            res.status(400).json({"error":"not found subject"});
            return;
        }

        console.log("?//")

        let response_set_answer = await axios.post(Data.Main_address + '/test/save_answers',{answers,attemptId});
        if(!response_set_answer){
            res.status(400).json({"error":"can't save"});
            return;
        }

        return res.json({ok:true});
    }
    catch (e) {
        res.status(500).json({"error":"server"});
    }
});

testRouter.post('/stop_attempt',  async (req, res)=>{
    try{
        var {attemptId, session_token} = req.body;

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
        if(response_user.data.role !== 0) {
            res.status(400).json({"error": "not found role"});
            return;
        }



        let response_attempt = await axios.post(Data.Main_address + '/test/get_attempts',{attemptsId:[attemptId] });
        if(!response_attempt || response_attempt.data[0].finished){
            res.status(400).json({"error":"not found attempt or it has already finished"});
            return;
        }



        let response_test = await axios.post(Data.Main_address + '/test/get_data',{testsId:[response_attempt.data[0].testId]});
        if(!response_test || !response_test.data[0].activate){
            res.status(400).json({"error":"not found test"});
            return;
        }
        console.log("?//")


        let findSubject = false;
        for (let i = 0; i < response_user.data.subjectsId.length; i++) {
            if (response_user.data.subjectsId[i] === response_test.data[0].subjectId  &&  response_user.data.userId ===response_attempt.data[0].userId) {
                findSubject = true;
                break;
            }
        }
        if(!findSubject){
            res.status(400).json({"error":"not found test"});
            return;
        }

        console.log("?//")

        let response_set_answer = await axios.post(Data.Main_address + '/test/stop_attempt',{attemptId});
        if(!response_set_answer){
            res.status(400).json({"error":"can't finished"});
            return;
        }

        return res.json({ok:true});
    }
    catch (e) {
        console.log(e)
        res.status(500).json({"error":"server"});
    }
});

testRouter.post('/get_question_attempt',  async (req, res)=>{
    try{
        var {attemptId, session_token} = req.body;

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



        let response_attempt = await axios.post(Data.Main_address + '/test/get_attempts',{attemptsId:[attemptId] });
        if(!response_attempt ){
            res.status(400).json({"error":"not found user"});
            return;
        }




        let response_test = await axios.post(Data.Main_address + '/test/get_data',{testsId:[response_attempt.data[0].testId]});
        if(!response_test || !response_test.data[0].activate){
            res.status(400).json({"error":"not found test"});
            return;
        }



        let response_subject = await axios.post(Data.Main_address + '/subject/get_data',{subjectsId:[response_test.data[0].subjectId]});
        if(!response_subject){
            res.status(400).json({"error":"not found subject"});
            return;
        }



        let findUser = false;
        for (let i = 0; i < response_subject.data[0].usersId.length; i++) {
            if (response_subject.data[0].usersId[i] === response_user.data.userId &&   response_user.data.userId ===response_attempt.data[0].userId) {
                findUser = true;
                break;
            }
        }
        if(!findUser){
            res.status(400).json({"error":"not found test for user"});
            return;
        }


        let response_question = await axios.post(Data.Main_address + '/test/get_questions',{questionsId:response_test.data[0].questionsId });
        if(!response_question || response_question.data.length !== response_test.data[0].questionsId.length){
            res.status(400).json({"error":"not found questions"});
            return;
        }


        let Arr = [];
        for (let i = 0; i < response_question.data.length; i++) {
            Arr.push(response_question.data[i].var[response_attempt.data[0].lastsId[i]])
            delete Arr[i].answer;
        }
        console.log("%%")


        return res.json({attempt:response_attempt.data[0] ,data:{name:response_test.data[0].name,description:response_test.data[0].description}, questions:Arr });
    }
    catch (e) {
        res.status(500).json({"error":"server"});
    }
});

testRouter.post('/get_question_attempt_result',  async (req, res)=>{
    try{
        var {attemptId, session_token} = req.body;

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



        let response_attempt = await axios.post(Data.Main_address + '/test/get_attempts',{attemptsId:[attemptId] });
        if(!response_attempt ){
            res.status(400).json({"error":"not found user"});
            return;
        }




        let response_test = await axios.post(Data.Main_address + '/test/get_data',{testsId:[response_attempt.data[0].testId]});
        if(!response_test){
            res.status(400).json({"error":"not found test"});
            return;
        }



        let response_subject = await axios.post(Data.Main_address + '/subject/get_data',{subjectsId:[response_test.data[0].subjectId]});
        if(!response_subject){
            res.status(400).json({"error":"not found subject"});
            return;
        }



        let findUser = false;
        for (let i = 0; i < response_subject.data[0].usersId.length; i++) {
            if (response_subject.data[0].usersId[i] === response_user.data.userId && response_user.data.userId ===response_attempt.data[0].userId) {
                findUser = true;
                break;
            }
        }
        if(!findUser) {
            if(response_user.data.role !== 1) {
                res.status(400).json({"error": "not found role"});
                return;
            }
            for (let i = 0; i < response_subject.data[0].userId.length; i++) {
                if (response_subject.data[0].userId[i] === response_user.data.userId) {
                    findUser = true;
                    break;
                }
            }
        }

        if(!findUser) {
            res.status(400).json({"error":"not found test for user"});
            return;
        }



        let response_question = await axios.post(Data.Main_address + '/test/get_questions',{questionsId:response_test.data[0].questionsId });
        if(!response_question || response_question.data.length !== response_test.data[0].questionsId.length){
            res.status(400).json({"error":"not found questions"});
            return;
        }


        let Arr = [];
        for (let i = 0; i < response_question.data.length; i++) {
            Arr.push(response_question.data[i].var[response_attempt.data[0].lastsId[i]])
            delete Arr[i].answer;
        }
        console.log("%%")


        return res.json({attempt:response_attempt.data[0] ,data:{name:response_test.data[0].name,description:response_test.data[0].description}, questions:Arr });
    }
    catch (e) {
        res.status(500).json({"error":"server"});
    }
});

testRouter.post('/get_active_attempt',  async (req, res)=>{
    try{
        var {testId, session_token} = req.body;

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
        if(response_user.data.role !== 0) {
            res.status(400).json({"error": "not found role"});
            return;
        }


        console.log("fff")
        let response_test = await axios.post(Data.Main_address + '/test/get_data',{testsId:[testId]});
        if(!response_test || !response_test.data[0].activate){
            res.status(400).json({"error":"not found test"});
            return;
        }


        console.log("fff")

        let response_subject = await axios.post(Data.Main_address + '/subject/get_data',{subjectsId:[response_test.data[0].subjectId]});
        if(!response_subject){
            res.status(400).json({"error":"not found subject"});
            return;
        }

        console.log("fff")

        let response_attempt = await axios.post(Data.Main_address + '/test/get_active_attempt',{userId:response_user.data.userId, testId:testId });
        if(!response_attempt){
            res.status(400).json({"error":"not found user"});
            return;
        }


        console.log("fff")
        return res.json({attemptId:response_attempt.data.attemptId});
    }
    catch (e) {
        res.status(500).json({"error":"server"});
    }
});

testRouter.post('/get_attempts',  async (req, res)=>{
    try{
        var {testId, session_token} = req.body;

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



        let response_test = await axios.post(Data.Main_address + '/test/get_data',{testsId:[testId]} );
        if(!response_test ){
            res.status(400).json({"error":"not found test"});
            return;
        }



        let findSubject = false;
        for (let i = 0; i < response_user.data.subjectsId.length; i++) {
            if (response_user.data.subjectsId[i] === response_test.data[0].subjectId) {
                findSubject = true;
                break;
            }
        }
        if(!findSubject){
            res.status(400).json({"error":"not found subject"});
            return;
        }





        let response_attempt = await axios.post(Data.Main_address + '/test/get_attempts_t_u',{testId:testId , userId:response_user.data.userId });
        if(!response_attempt){
            res.status(400).json({"error":"not found user"});
            return;
        }


        return res.json(response_attempt.data);
    }
    catch (e) {
        res.status(500).json({"error":"server"});
    }
});

testRouter.post('/add_question',  async (req, res)=>{
    try{
        var {data, subjectId, session_token} = req.body;

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




        data.userId = response_user.data.userId;
        let response = await axios.post(Data.Main_address + '/test/add_question',{data,subjectId});
        if(!response){
            res.status(400).json({"error":"not found user"});
            return;
        }

        res.json(response.data);
        return;

    }
    catch (e) {
        res.status(500).json({"error":"server"});
    }
});

testRouter.post('/update_question',  async (req, res)=>{
    try{
        var {data, questionId, session_token} = req.body;

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


        let response_question = await axios.post(Data.Main_address + '/test/get_questions',{questionsId:[questionId] });
        if(!response_question ){
            res.status(400).json({"error":"not found question"});
            return;
        }



        let findSubject = false;
        for (let i = 0; i < response_user.data.subjectsId.length; i++) {
            if (response_user.data.subjectsId[i] === response_question.data[0].subjectId) {
                findSubject = true;
                break;
            }
        }
        if(!findSubject){
            res.status(400).json({"error":"not found subject"});
            return;
        }




        let response = await axios.post(Data.Main_address + '/test/update_question', {
            questionId,
            data,
        });
        if (!response) {
            res.status(400).json({"error": "can't change"});
            return;
        }

        res.json(response.data);
        return;

    }
    catch (e) {
        res.status(500).json({"error":"server"});
    }
});

testRouter.post('/get_questions',  async (req, res)=>{
    try{
        var {questionId, subjectId, session_token} = req.body;

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



        if(questionId && questionId !== 0){
            let response_question = await axios.post(Data.Main_address + '/test/get_questions',{questionsId:[questionId] });
            if(!response_question ){
                res.status(400).json({"error":"not found question"});
                return;
            }

            let findSubject = false;
            for (let i = 0; i < response_user.data.subjectsId.length; i++) {
                if (response_user.data.subjectsId[i] === response_question.data[0].subjectId) {
                    // if(subjectId === response_question.data[0].subjectId){
                         findSubject = true;
                         console.log(subjectId)
                    // }else{
                    //     res.status(400).json({"error":"not found question in such subject"});
                    //     return;
                    // }
                    break;
                }
            }

            if(!findSubject){
                res.status(400).json({"error":"not found subject"});
                return;
            }

            return res.json(response_question.data[0]);
        }

        if(!questionId && subjectId){
            let response_question = await axios.post(Data.Main_address + '/test/get_questions_s',{subjectId:subjectId });
            if(!response_question ){
                res.status(400).json({"error":"not found question"});
                return;
            }

            let findSubject = false;
            for (let i = 0; i < response_user.data.subjectsId.length; i++) {
                if (response_user.data.subjectsId[i] === subjectId) {
                        findSubject = true;
                        console.log(subjectId);
                    break;
                }
            }
            console.log("vvvvvvvv")
            if(!findSubject){
                res.status(400).json({"error":"not found subject"});
                return;
            }

            return res.json(response_question.data);
        }




    }
    catch (e) {
        res.status(500).json({"error":"server"});
    }
});

testRouter.post('/delete_data',  async (req, res)=>{
    try{
        var { testId, session_token} = req.body;

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
        if(!testId && testId !== 0) {
            res.status(400).json({"error": "not found subjectId"});
            return;
        }



        let response_test = await axios.post(Data.Main_address + '/test/get_data',{ testsId:[testId]});
        if(!response_test){
            res.status(400).json({"error":"not found test"});
            return;
        }


        let response_subject = await axios.post(Data.Main_address + '/subject/get_data',{ subjectsId:[response_test.data[0].subjectId]});
        if(!response_subject){
            res.status(400).json({"error":"not found subject"});
            return;
        }




        let findSubject = false;
        for (let i = 0; i < response_user.data.subjectsId.length; i++) {
            if (response_user.data.subjectsId[i] === response_test.data[0].subjectId) {
                findSubject = true;
                break;
            }
        }
        console.log(response_user.data.subjectsId, response_test.data[0].subjectId)
        console.log(response_user.data.userId,  response_subject.data[0].userId[0],findSubject)
        if(!findSubject || response_user.data.userId !== response_subject.data[0].userId[0]){
            res.status(400).json({"error":"not found subject"});
            return;
        }



        let response_test_main = await axios.post(Data.Main_address + '/test/delete_data',{testId});
        if(!response_test_main){
            res.status(400).json({"error":"not found test"});
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

testRouter.post('/delete_question',  async (req, res)=>{
    try{
        var { questionId, session_token} = req.body;

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
        if(!questionId && questionId !== 0) {
            res.status(400).json({"error": "not found subjectId"});
            return;
        }


        let response_question = await axios.post(Data.Main_address + '/test/get_questions',{ questionsId:[questionId]});
        if(!response_question){
            res.status(400).json({"error":"not found test"});
            return;
        }


        let response_subject = await axios.post(Data.Main_address + '/subject/get_data',{ subjectsId:[response_question.data[0].subjectId]});
        if(!response_subject){
            res.status(400).json({"error":"not found subject"});
            return;
        }


        let findSubject = false;
        for (let i = 0; i < response_user.data.subjectsId.length; i++) {
            if (response_user.data.subjectsId[i] === response_question.data[0].subjectId) {
                findSubject = true;
                break;
            }
        }
        //console.log(response_user.data.subjectsId, response_test.data[0].subjectId)
        console.log(response_user.data.userId,  response_subject.data[0].userId[0],findSubject)
        if(!findSubject || response_user.data.userId !== response_subject.data[0].userId[0]){
            res.status(400).json({"error":"not found subject"});
            return;
        }


        let response_delete = await axios.post(Data.Main_address + '/test/delete_question',{subjectId:response_question.data[0].subjectId, questionId});
        if(!response_delete){
            res.status(400).json({"error":"not found question"});
            return;
        }


        res.json(response_delete.data);

        return;

    }
    catch (e) {
        console.log(e)
        res.status(500).json({"error":"server"});
    }
});


export default testRouter;