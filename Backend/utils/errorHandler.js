class ErrorHandler extends Error {
       constructor(message,statusCode){
        super(message);//this will send message to Error class
        this.statusCode = statusCode;

        Error.captureStackTrace(this,this.constructor);
       }    
}

module.exports = ErrorHandler