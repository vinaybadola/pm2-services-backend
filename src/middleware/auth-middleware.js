import jwt from 'jsonwebtoken';
import Admin from '../models/admin-model.js';

const customAuth = async (req, res, next) => {
  const token = req.cookies?.admincookie;
  try {
    if(!token){
      return res.status(401).json({success:false, message : "You are not authorized!"})
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await Admin.findById(decoded._id || decoded.id);
    if (!user) {
      return res.status(404).json({ success: false, key: "unknown_user", error: 'User not found.' });
    }
    const validToken = user.tokens.some(t => t.token === token);
  
    if (!validToken) {
      return res.status(401).json({ success: false, key: "invalid_token", error: 'Invalid token provided' });
    }
    req.user = { _id: user._id, email: user.email };
    next();
  } catch (err) {
    console.error("Token verification error:", err);
    return res.status(500).json({success:false, error : err.message});
  }
};

export default customAuth;