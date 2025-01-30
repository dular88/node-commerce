import express from 'express';
import { APP_PORT, DB_URL } from './config/index.js';
import routes from './routes/index.js';
import errorHandler from './middlewares/errorHandler.js';
import mongoose from 'mongoose';
import path from "path";
import { fileURLToPath } from "url";

const app = express();

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// DB connection
mongoose.connect(DB_URL,{ useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error : '));
db.once('open', ()=>{
    console.log("DB Connected");
});

global.Root = path.resolve(__dirname);
app.use(express.urlencoded({extended:false}));

app.use(express.json());
app.use("/api", routes);
app.use("/upload", express.static("upload"));

app.use(errorHandler);
app.listen(APP_PORT, ()=>{
console.log("Server is running");
})