
import mongoose from "mongoose";
import { APP_URL } from "../config/index.js";

const Schema = mongoose.Schema;

const productSchema = new Schema({
    name : {type: String, required: true},
    price : {type: String, required: true},
    size : {type: String, required: true},
    image : {type: String, required: true, get: (image) =>{
        return `${APP_URL}/${image}`;
    }},
},{timestamps:true, toJSON:{getters:true}, id:false});

export default mongoose.model('Product', productSchema, 'products');