class ApiError extends Error{
    constructor(
        statusCode,
        message = "Something went wrong",
        stack = "",
        errors=[]
    ){
        super(message)
        this.data = null
        this.message = message
        this.success  = false
        this.errors = errors
        this.statusCode = statusCode


        if (stack){
            this.stack = stack
        }else{
            Error.captureStackTrace(this,this.constructor)
        }
    }
    
    
}


module.exports= {ApiError}