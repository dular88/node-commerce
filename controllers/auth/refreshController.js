import Joi from "joi";
import { RefreshToken, User } from "../../models/index.js";
import CustomErrorHandler from "../../services/CustomErrorHandler.js";
import JwtService from "../../services/JwtService.js";
import { REFRESH_SECRET } from "../../config/index.js";

const refreshController = {
    async refresh(req, res, next){
         // validation 
                const refreshSchema = Joi.object({
                    refresh_token: Joi.string().required(),
                });
        
                const {error} = refreshSchema.validate(req.body);

                if(error){
                    return next(error);
                }
                // Database check
                let refreshToken;
                try {
                    refreshToken = await RefreshToken.findOne({token: req.body.refresh_token});
                    if(!refreshToken){
                        return next(CustomErrorHandler.unAuthorized("Invalid refresh token"));
                    }

                    let userId;
                    try {
                        const {_id} = await JwtService.verify(refreshToken.token, REFRESH_SECRET);
                        userId = _id;
                    } catch (error) {
                        return next(CustomErrorHandler.unAuthorized("Invalid refresh token"));
                    }

                    const user = await User.findOne({_id: userId});
                    if(!user){
                        return next(CustomErrorHandler.unAuthorized("User not found"));
                    }

                    // tokens

                     // accesstoken
                    const access_token = JwtService.sign({_id: user._id, role: user.role});
                    const refresh_token = JwtService.sign({_id: user._id, role: user.role}, "1y", REFRESH_SECRET);
                    // DB Token whitelisting
                    await RefreshToken.create({token: refresh_token});

                    res.json({access_token, refresh_token});

                } catch (error) {
                    return next(new Error("Something went wrong "+error.message));
                }
    }
}

export default refreshController;