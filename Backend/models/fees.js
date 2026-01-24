const mongoose=require('mongoose')

const feesSchema = mongoose.Schema({
    _id: mongoose.Types.ObjectId,
    fullName: { type: String, required: true },
    courseId: { type: String, required: true },
    phone: { type: String, required: true },
    creatorId: { type: String, required: true },
    amount: { type: Number, required: true },
    remark: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true }); // ✅ This adds 'createdAt' and 'updatedAt' fields



module.exports=mongoose.model("Fees",feesSchema);

