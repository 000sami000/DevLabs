let mongoose=require('mongoose')


let comment_schema=mongoose.Schema({
    content_creator_id:{type:String,require:true},
    content_creator_username:{type:String,default:""},
    content_title:{type:String,required:true},
    type_id:{type:String,required:true},
    comment_type:{type:String,required:true},
    comment_content:{type:String,required:true},
    commentor_username:{type:String,default:"",require:true},
    commentor_id:{type:String,default:"",require:true},

},{timestamps: true})
const comment_Model = mongoose.model("comment_", comment_schema);
module.exports = comment_Model;