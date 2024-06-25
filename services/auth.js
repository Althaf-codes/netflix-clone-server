const jwt = require('jsonwebtoken');

function createToken(admin){
    const payload = {
        _id:admin._id,
        username:admin.username,
        role:admin.role
    }

    const token = jwt.sign(payload,process.env.JWT_SECRET);
    return token;
}

function verifyToken(token){
    const payload = jwt.verify(token,process.env.JWT_SECRET);

    return payload
}



module.exports = {
    createToken,
    verifyToken
}