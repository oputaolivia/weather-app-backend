export default class responseDto{
    constructor(status, message, data){
        this.status = status;
        this.message = message;
        this.data = data;
    }
}