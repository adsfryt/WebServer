import Data from "./new/data.js";
import axios from "axios";

export default new class Request {
    async send(path, init={}){
        try {
            init.url = Data.ADDRESS_SERVER + '/' + path;
            return await axios( init);
        }catch (e) {
            return {};
        }
    }

    // async token(type,data = ""){
    //     try {
    //         var response;
    //         switch (type){
    //             case "get_access_token":
    //             {
    //                 response = await this.send("token/get_access_token" + "?session_token=" + data);
    //                 break;
    //             }
    //             case "create":
    //             {
    //                 response = await this.send("token/create_token" + (data !== "" ? "?access_token=" + data : ""));
    //                 break;
    //             }
    //             case "delete":
    //             {
    //                 response = await this.send("token/delete_token" + "?session_token=" + data);
    //                 break;
    //             }
    //         }
    //
    //
    //         return response.data;
    //     }catch (e) {
    //         return {};
    //     }
    // }


}