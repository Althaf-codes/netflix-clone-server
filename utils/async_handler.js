const asynchandler  = (handler)=>{
    return (req,res,next)=>{
        Promise.resolve(handler(req,res,next)).catch((error)=>next(error))

    }
}


module.exports= {asynchandler}