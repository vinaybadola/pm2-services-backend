import adminModel from "../models/admin-model.js";
import bcrypt from "bcryptjs";

export default class AuthController {

    login = async (req, res) => {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        try {
            const user = await adminModel.findOne({ email });
            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ error: "Invalid credentials" });
            }
            const token = await user.generateAuthToken();
            await user.save();
            res.cookie("admincookie", token, { httpOnly: true });
            return res.json({ success: true, data: user });
        } catch (err) {
            console.log("An error occured while logging in: ", err);
            res.status(500).json({ success: false, error: err.message });
        }
    };

    signup = async (req, res) => {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        try {
            const user = new adminModel({ email, password });
            const token = await user.generateAuthToken();
            await user.save();
            res.cookie("admincookie", token, { httpOnly: true});
            return res.status(201).json({ success: true, data: user });
            
        } catch (err) {
            console.log("An error occured while signing up: ", err);
            res.status(500).json({success: false, error: err.message });
        }
    };

    logout = async (req, res) => {
        try {
            res.clearCookie("admincookie");
            await adminModel.findByIdAndUpdate(req.user._id, { tokens: [] });
            return res.status(200).json({ success: true, message: "Logged out successfully" });
        } catch (err) {
            console.log("An error occured while logging out: ", err);
            res.status(500).json({ success: false, error: err.message });
        }
    };

    deleteAccount = async (req, res) => {
        try {
            await adminModel.findByIdAndDelete(req.user._id);
            res.clearCookie("admincookie");
            return res.json({ success: true, message: "Account deleted successfully" });
        } catch (err) {
            console.log("An error occured while deleting account: ", err);
            res.status(500).json({ success: false, error: err.message });
        }
    };
}