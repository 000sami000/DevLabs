let mongoose=require('mongoose')
let article_schema=mongoose.Schema({

    title:{type:String,default:"",required:true},
    description:{type:String,default:"",required:true},
    article_content:{type:Object,default:null,required:true},
    tags:{
        type:[String],
        default:[]
    },
    likes:{
        type:[String],
        default:[]
    },
    dislikes:{
        type:[String],
        default:[]
    },
    // views:{
    //     type:[String],
    //     default:[]
    // },
    thumbnail:{
        type:Object,
        require:true
    },
    saved_art_by: {
        type: [String],
        default: [],
      },
   
    creator_username:{type:String,default:"",require:true},
    creator_id:{type:String,default:"",require:true},
    isApproved: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },

},{timestamps: true})
const article_Model=mongoose.model('articles_',article_schema)
module.exports=article_Model;