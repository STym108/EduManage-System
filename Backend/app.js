const express =require('express')
const app=express()
const mongoose=require('mongoose')
const bodyparser=require('body-parser')
const fileUpload=require('express-fileupload')
const userroute=require('./routes/user')
const studentroute=require('./routes/student')
const feesroute=require('./routes/fees')
const courseroute=require('./routes/courses')
const statsroute=require('./routes/statsroute')
const cors =require('cors');
app.use(cors())
require('dotenv').config();

app.use(bodyparser.urlencoded({ extended: false }))

// Add 'Institut_Management_System' after the .net/
mongoose.connect(`${process.env.string}`)
.then(()=>{
    console.log('Database connected: ', mongoose.connection.name);
})
.catch(err=>{
    console.log('Error while connecting: ', err);
});
 

app.use(bodyparser.json());

//this file upload middleware is for : when images\files get uploaded from frontend , this will store them temp in the server then upload on **cloudinary
app.use(fileUpload({
    useTempFiles : true,
    // tempFileDir : '/tmp/'
}));
// Middleware to parse JSON (Crucial for MERN!)
app.use(express.json());

app.use('/stats',statsroute);
app.use('/user',userroute)
app.use('/course',courseroute)
app.use('/fees',feesroute)
app.use('/student',studentroute)



module.exports=app