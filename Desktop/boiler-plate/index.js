const express = require('express')
const app = express()
const port = 5000
const bodyParser = require('body-parser');

const config = require('./config/key');
const {User} = require("./models/User");

//application/x-www-form-urlencoded 를 분석해서 가져오게 함
app.use(bodyParser.urlencoded({extended:true}));

//application/json 으로 된 것을 분석해서 가져오게 함
app.use(bodyParser.json());


const mongoose = require('mongoose')
mongoose.connect(config.mongoURI, {
  /* useNewUrlParser:true, useUnifiedTopology: true, useCreateIndex:true, useFindAndModify:false  */
}).then(()=> console.log('MongoDB Connected...'))
  .catch(err => console.log(err))

app.get('/', (req, res) => {
  res.send('Hello World! 안녕!')
})

app.post('/register',(req, res) => {
  //회원가입할 때 필요한 정보들을 client에서 가져오면
  //그것들을 데이터베이스에 넣어준다.

/*   {
    id:"hello",
    password:"123"
    ...이런 클라이언트로부터 받은 정보들이 req.body에 들어있음 >> bodyParser가 있기 때문에 가능
  } */
  const user = new User(req.body)

      //save는 몽고db의 메소드 >> 정보들이 user model에 저장됨
  user.save((err, userInfo)=>{
    if(err) return res.json({success:false, err}) //저장할 때 에러가 있으면 클라이언트에 에러가 있따고 json형식으로 전달해줌
    return res.status(200).json({success:true}) //성공했을 때(=status(200)) userInfo를 전달 
  })
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})