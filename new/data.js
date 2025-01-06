import {makeAutoObservable,makeObservable} from "mobx";

class Data{
    constructor() {
        makeAutoObservable(this)
    }
    ADDRESS_SITE="http://localhost:3000"
    Auth_address="http://localhost:6000"
    Main_address="http://localhost:4308"
    WebServer_address="http://localhost:5000"

    AccessToken = "sdfuyintwefcxbtixdfggjhxcerf";
    RefreshToken = "wktnaowereiuthqe-egweviawioeuf";
}

export default new Data()