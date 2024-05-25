let mongoose=require('mongoose')
let MediaSchema = new mongoose.Schema({
   name:String,
   description:String,
   thumbnailUrl:String,
   videosUrl:{
    type:String,default:""
   }
})
module.exports=mongoose.model('Media',MediaSchema)