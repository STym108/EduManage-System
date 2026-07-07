const mongoose=require('mongoose')

const studentSchema=mongoose.Schema({
    _id:mongoose.Types.ObjectId,
    fullName:{type:String,required:true},
    phone:{type:Number,required:true},
    email:{type:String,required:true},
    address:{type:String,required:true},

    imageUrl:{type:String,required:true},
    imageId:{type:String,required:true},
    teacherId:{type:mongoose.Schema.Types.ObjectId, ref: 'User', required:true},
    // Normalized list of course references for many-to-many enrollment
    courses:[{type:mongoose.Schema.Types.ObjectId, ref: 'Course'}],
    // Legacy courseId kept for database backward compatibility
    courseId:{type:String,required:false}
},{timestamps:true})

module.exports=mongoose.model("Student",studentSchema)