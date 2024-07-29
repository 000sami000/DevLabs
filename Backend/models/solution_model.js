let mongoose=require('mongoose')
let solution_schema=mongoose.Schema({

  profile_img_:{type:Object,default:null},
   problem_id:{type:String,require:true},
    solution_content:{type:String,required:true},
    
    down_vote:{
        type:[String],
        default:[]
    },
    up_vote:{
        type:[String],
        default:[]
    },
    vote:{
        type:Number,
        default:0
    },

    saved_sol_by: {
        type: [String],
        default: [],
      },
      total_comments:{type:Number,default:0},
    creator_username:{type:String,require:true},
    creator_id:{type:String,require:true},
    isApproved: { type: Boolean, default: false },
},{timestamps: true} )
const solution_Model=mongoose.model('solution_',solution_schema)
module.exports=solution_Model;