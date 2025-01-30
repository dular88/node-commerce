
import multer from "multer";
import path from "path";
import CustomErrorHandler from "../services/CustomErrorHandler.js";
import Joi from "joi";
import Product from "../models/product.js";
import productSchema from "../validators/productValidator.js";
import fs from "fs";

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "upload/"),
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.random() * 1E9}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

const handleMaultipartData = multer({storage, limits: { filesize: 1000000 * 5}}).single("image");
const productController = {
    async index(req, res, next){
        let documents;
        try {
            documents = await Product.find().select("-updatedAt -__v").sort({_id:-1});
        } catch (error) {
            return next(CustomErrorHandler.serverError());
        }
        return res.json(documents);
    },
    async show(req, res, next){
        let document;
        try {
            document = await Product.findOne({_id: req.params.id}).select("-updatedAt, -__v");
        } catch (error) {
            return next(CustomErrorHandler.serverError());
        }
        return res.json(document)
    },
    async store(req, res, next){
        // handle multipart
        handleMaultipartData(req, res, async (err) =>{
            if(err){
                return next(CustomErrorHandler.serverError(err.message));
            }

            const filePath = req.file.path;
             // validation 
                    const {error} = productSchema.validate(req.body);
                    if(error){
                        // Delete uploaded file
                        fs.unlink(`${appRoot}/${filePath}`, (err)=>{
                            if(err){
                                return next(CustomErrorHandler.serverError(err.message));
                            }
                        });
                        return next(error);
                    }

            const {name, price, size} = req.body;
            let document; 
            try {
                document = await Product.create({
                    name,
                    size,
                    price,
                    image: filePath
                });
            } catch (err) {
                return next(err)
            }
           return res.status(201).json(document);
        })
    },
    update(req, res, next){
        handleMaultipartData(req, res, async (err) =>{
            if(err){
                return next(CustomErrorHandler.serverError(err.message));
            }

            let filePath;
            if(req.file){
                filePath = req.file.path;
            }

            
             // validation 
                    const {error} = productSchema.validate(req.body);
                    if(error){
                        // Delete uploaded file
                        if(req.file){
                            fs.unlink(`${appRoot}/${filePath}`, (err)=>{
                                if(err){
                                    return next(CustomErrorHandler.serverError(err.message));
                                }
                            });
                        }

                        return next(error);
                    }

            const {name, price, size} = req.body;
            let document; 
            try {
                document = await Product.findOneAndUpdate({_id: req.params.id},{
                    name,
                    size,
                    price,
                    ...(req.file && {image: filePath})
                },{new: true});
            } catch (err) {
                return next(err)
            }

           return res.status(201).json(document);
        })
    },
    async destroy(req, res, next){
        const document = await Product.findOneAndDelete({_id: req.params.id});
        if(!document){
            return next(new Error("Nothing to delete"));
        }
        // Image Delete
        const imagePath = document._doc.image;

        fs.unlink(`${appRoot}/${imagePath}`, (err)=>{
            return next(CustomErrorHandler.serverError());
        });

        return res.json(document);
    }
}

export default productController;