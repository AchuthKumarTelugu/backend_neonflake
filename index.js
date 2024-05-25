let express = require('express')
let app = express()
let mongoose = require('mongoose')
let multer = require('multer')
let Media = require('./routes/MediaSchema')
const { v2: cloudinary } = require('cloudinary')
let port = 3000
let cors=require('cors')
app.use(cors())

require('dotenv').config()
app.use(express.json())

//mongodb connection
mongoose.connect(process.env.MONGO_URI)
let db = mongoose.connection
db.once('open', () => {
    console.log('Connected to MongoDB')
})
db.on('error', (err) => { console.log(err) })

//cloudinary configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

//multer configuration
let storage = multer.diskStorage({})//used to file upload files
let upload = multer({ storage })

//routes
app.get('/', (req, res) => {
    res.json({ msg: "welcome to dead" })
})
app.post('/upload', upload.fields([{ name: 'thumbnail' }, { name: 'videos' }]), async (req, res) => {
    try {
        const { name, description } = req.body
        console.log(req.body)
        // let thumbnail = await cloudinary.uploader.upload(req.files.thumbnail[0].path, { resource_type: 'image' })
        // let video = await cloudinary.uploader.upload(req.files.videos[0].path, { resource_type: 'video' })

        const thumbnailUpload = cloudinary.uploader.upload(req.files.thumbnail[0].path, { resource_type: 'image' }) || '';

        // Upload video asynchronously
        const videoUpload = cloudinary.uploader.upload(req.files.videos[0].path, { resource_type: 'video' });
    
        // Await both uploads
        const [thumbnail, video] = await Promise.all([thumbnailUpload, videoUpload]);

        let media =new Media({
            name,
            description,
            thumbnailUrl: thumbnail.secure_url ||'',
            videosUrl: video.secure_url||''
        })
      await media.save()
        res.json(media)
    } catch (error) {
        console.log(error)
    }
})

app.get('/media',async(req,res)=>{
    let media = await Media.find()
    res.json(media)
})
app.get('/media/:id',async(req,res)=>{
 let media = await Media.findById(req.params.id)
 res.json(media)
})

app.listen(port, () => console.log('server is running on', port))