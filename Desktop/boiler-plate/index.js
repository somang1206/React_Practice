const express = require('express')
const app = express()
const port = 5000
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const config = require('./config/key');
const { auth } = require('./middleware/auth')
const {User} = require("./models/User");

//application/x-www-form-urlencoded 를 분석해서 가져오게 함
app.use(bodyParser.urlencoded({extended:true}));

//application/json 으로 된 것을 분석해서 가져오게 함
app.use(bodyParser.json());
app.use(cookieParser());


const mongoose = require('mongoose')
mongoose.connect(config.mongoURI, {
  /* useNewUrlParser:true, useUnifiedTopology: true, useCreateIndex:true, useFindAndModify:false  */
}).then(()=> console.log('MongoDB Connected...'))
  .catch(err => console.log(err))

app.get('/', (req, res) => {
  res.send('Hello World! 안녕!')
})

app.post('api/users/register',(req, res) => {
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




app.post('/api/users/login', (req, res)=>{

  //요청된 이메일을 데이터벱이스에서 있는지 찾는다.
  User.findOne({email:req.body.email}, (err, user)=>{

    console.log('user', user)
    
    if(!user){
      return res.json({
        loginSuccess : false,
        message:"제공된 이메일에 해당하는 유저가 없습니다."    //유저가 없을때!
      })
    }
  
    
  //요청한 E-mail이 데이터베이스에 있다면, 비밀번호가 맞는지 확인
  user.comparePassword(req.body.password, (err, isMatch)=>{
    if(!isMatch)
    return res.json({loginSuccess : false, message :"비밀번호가 틀렸습니다."})

 

  //비밀번호까지 같다면, 해당 유저를 위한 TOKEN생성  >>npm install jsonwebtoken 설치
  user.generateToken((err, user)=>{
    if(err) return res.status(400).send(err);

    //토큰을 저장한다. 어디에? 쿠키, 로컬스토리지,... >> 쿠키에 저장하려면 npm install cookie-parser --save 해야됨

    res.cookie("x_auth", user.token)
    .status(200) //성공했다는 표시
    .json({loginSuccess:true, userId:user._id}) //json으로 데이터 보내주기

      })

    })

  })

})


                          //미들웨어 : 엔드포인트에서 리퀘스트 받고, 콜백함수 받기 전에 중간에서 뭔가를 해줌
app.get('/api/users/auth', auth, (req, res) => {

//여기까지 미들웨어를 통과해 왔다는 얘기는 Authentication이 True 라는 말.

  res.status(200).json({
    _id: req.user._id,
    isAdmin: req.user.role === 0 ? false : true,

    // role 1 어드민 role2 특정 부서 어드민
    // role 0 => 일반유저 role 0이 아니면 관리자
    isAuth : true,
    email : req.user.email,
    name: req.user.name,
    lastname: req.user.lastname,
    role:req.user.role,
    image: req.user.image
  })
})


app.get('/api/users/logout', auth, (req, res) =>{
  User.findOneAndUpdate({_id:req.user._id},
    { token : ""} //token 지워주는 것
    , (err, user) => {
      if(err) return res.json({success: false, err});
      return res.status(200).send({
        success: true
      })
    })
})


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

