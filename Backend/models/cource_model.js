let mongoose=require('mongoose')
let cource_schema=mongoose.Schema({
    thumbnail:{
        type:Object,
        require:true
    },
    title:{type:String,default:"",required:true},
    description:{type:String,default:"",required:true},
    cource_data:{type:Object,defaulr:null,required:true}

},{timestamps: true})
const cource_Model=mongoose.model('articles_',cource_schema)
module.exports=cource_Model;