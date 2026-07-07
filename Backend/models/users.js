const mongoose=require('mongoose')

const userSchema=mongoose.Schema({
    _id:mongoose.Types.ObjectId,
    fullName:{type:String,required:true},
    phone:{type:Number,required:true},
    email:{type:String,required:true},
    password:{type:String,required:true},
    imageUrl:{type:String, default: 'https://res.cloudinary.com/dxeajnde0/image/upload/v1700000000/default_avatar.png'},
    imageId:{type:String, default: 'default_avatar'},
    role: {type: String, default: 'admin', enum: ['admin', 'staff']},
    adminId: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}

})

module.exports=mongoose.model("User",userSchema);

