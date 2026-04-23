import Joi from "joi";
import CustomErrorHandler from "../../services/CustomErrorHandler.js";
import { RefreshToken, User } from "../../models/index.js";
import JwtService from '../../services/JwtService.js';
import bcrypt from 'bcrypt';
import CONFIG from "../../config/index.js";

const registerController = {
       async register(req, res, next){
                // Validation
                const registerSchema = Joi.object({
                        name: Joi.string().min(3).max(30).required(),
                        email: Joi.string().email().required(),
                        password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required(),
                        repeat_password: Joi.any()
                                        .valid(Joi.ref("password"))
                                        .required()
                                        .messages({ "any.only": "Passwords must match" }),
                });

                const {error} = registerSchema.validate(req.body);
                if(error){
                        return next(error);
                }
                // user already exists check

                try {
                        const userExists = await User.exists({email:req.body.email});
                        if(userExists){
                                return next(CustomErrorHandler.alreadyExist('This email is already taken'))
                        }
                } catch (error) {
                        return next(error);
                }

                // Hash Password
        const {name, email, password} = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const REFRESH_SECRET = CONFIG.REFRESH_SECRET;
       
        
        const user = new User ({
                name,
                email,
                password: hashedPassword
        });

        let access_token;
        let refresh_token;
        try {
                const result = await user.save();
                access_token = JwtService.sign({_id: result._id, role: result.role});
                refresh_token = JwtService.sign({_id: result._id, role: result.role}, "1y", REFRESH_SECRET);
                // DB whitelist
                await RefreshToken.create({token: refresh_token});
                
        } catch (error) {
                return next(error);
        }

        res.json({access_token, refresh_token});

        }
}

export default registerController;

