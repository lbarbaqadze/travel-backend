import jwt from "jsonwebtoken"

export const authMiddleware = (req, res, next) => {

    const authHeader = req.headers.authorization

    if(!authHeader || !authHeader.startsWith("Bearer ")){
        return res.status(401).json({message: "There is no token."})
    }

    const token = authHeader.split(" ")[1];

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = decoded
        next()
    }catch(err){
        res.status(403).json({message: "Invalid token"})
    }

}

export const verifyAdmin = (req, res, next) => {
    if(req.user && req.user.role === 'admin'){
        next()
    }else{
        res.status(403).json({message: "Access Denied! Admin Only!"})
    }
}