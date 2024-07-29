const dotenv=require("dotenv")
dotenv.config()
const express =require('express')
const app=express();
const bodyParser =require('body-parser');
const mongoose=require('mongoose');
const cors=require('cors');
const { exec } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path')
const http=require('http')
const { Server } = require('socket.io');
const cookieParser=require('cookie-parser')
const morgan=require("morgan")

//Routes
let problem_routes=require("./routes/problem_routes")
let user_routes=require("./routes/user_routes")
let solution_routes=require("./routes/solution_routes");
let article_routes=require("./routes/article_routes")
let comment_routes=require("./routes/comment_routes")
let report_routes=require("./routes/report_routes")
let cource_routes=require('./routes/cource_routes')
app.use(morgan("tiny"))
app.use(cors(  {  origin: 'http://localhost:5173',credentials: true}));
app.use(bodyParser.urlencoded({limit:"60mb",extended:true}))
app.use(bodyParser.json())

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
app.use(express.json());
app.use(cookieParser())
app.use("/problem",problem_routes)
app.use("/user",user_routes)
app.use("/solution",solution_routes)
app.use("/article",article_routes)
app.use("/comment",comment_routes)
app.use("/report",report_routes)
app.use("/cource",cource_routes)


app.use('/public/upload', express.static(path.join(__dirname, 'public/upload')));
// app.use('/posts',post_routes)
// app.use('/users',user_routes)
//compiler
app.post('/run', (req, res) => {
    const { language, code, input } = req.body;
    console.log(input)
//   console.log(language,code)
    const fileName = `temp.${language === 'c_cpp' ? 'cpp' : language}`;
    const inputFileName = 'temp_input.txt';
    fs.writeFileSync(fileName, code);
    fs.writeFileSync(inputFileName, input);
    const outputFileName = 'temp.out';
    const isWindows = os.platform() === 'win32';
    const commandMap = {
      c_cpp:  isWindows
      ? `g++ ${fileName} -o ${outputFileName} && ${outputFileName} < ${inputFileName}`
      : `g++ ${fileName} -o ${outputFileName} && ./${outputFileName} < ${inputFileName}`,
      java: isWindows
      ? `javac ${fileName} && java ${path.basename(fileName, '.java')} < ${inputFileName}`
      : `javac ${fileName} && java ${path.basename(fileName, '.java')} < ${inputFileName}`,
    php: `php ${fileName} < ${inputFileName}`,
    javascript: `node ${fileName} < ${inputFileName}`,
    python: `python ${fileName} < ${inputFileName}`,
    };
  
    const command = commandMap[language];
  
    exec(command,async (error, stdout, stderr) => {
        await wait(500);
        if (fs.existsSync(fileName)) {
            try {
              fs.unlinkSync(fileName);
            } catch (err) {
              console.error(`Failed to delete ${fileName}:`, err);
            }
          }
          if (fs.existsSync(inputFileName)) {
            try {
              fs.unlinkSync(inputFileName);
            } catch (err) {
              console.error(`Failed to delete ${inputFileName}:`, err);
            }
          }
          if (language === 'c_cpp' && fs.existsSync(outputFileName)) {
            try {
              fs.unlinkSync(outputFileName);
            } catch (err) {
              console.error(`Failed to delete ${outputFileName}:`, err);
            }
          }
      if (error) {
        res.json({ output: stderr });
      } else {
     
        console.log("---",stdout)
        res.json({ output: stdout });
      }
    });
  });



const connection_URL="mongodb://127.0.0.1:27017/DevLabs";
const PORT=process.env.PORT || 3000;
try{

    mongoose.connect(connection_URL);
    app.listen(PORT,()=>{
         console.log(`Server running on port ${PORT}`)
        })
    }
    catch(err){
    console.log(err)

}