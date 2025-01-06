import Request from "../Request.js";
import axios from "axios";
import Data from "./data.js";

export default new class TokenManager {
    async Check(session_token){
        try {
            if (!session_token) {
                return {};
            }
            let {access_token,refresh_token} = (await axios.get(Data.WebServer_address+'/token/get_access_token?session_token=' + session_token)).data;

            if (access_token === "none" || !access_token || !refresh_token || refresh_token === "none") {
                return {};
            }

            return {access_token,refresh_token};
        }
        catch(e){
            return {};
        }
    }

}