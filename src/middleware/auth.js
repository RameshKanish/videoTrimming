require('dotenv').config();
const API_TOKEN = process.env.API_TOKEN;

const authenticateToken = async function name(req , res , next) {
    const token = req.headers['authorization'];
    if(!token || token != API_TOKEN){
        return res.status(401).json({error : 'unauthorized'});
    }
    next();
}
module.exports = authenticateToken;