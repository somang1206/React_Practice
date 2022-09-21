const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10
const jwt = require('jsonwebtoken')

const userSchema = mongoose.Schema({
    name: {
        type: String,
        maxlength : 50
    },
    email:{
        type: String,
        trim: true, //공백 없애줌
        unique: 1 //같은 이메일 못쓰게
    },
    password: {
        type: String,
        minlength: 5
    },
    lastname:{
        type: String,
        maxlength: 50
    },
    role: { //관리자인지 사용자인지
        type: Number, //숫자를 정해서, 만약 1이면 관리자, 0이면 사용자 ...
        default:0 //임의로 롤을정하지 않으면 0 으로 하겠다
    },
    image: String,
    token: { //유효성 관리
        type: String
    },
    tokenExp:{
        //토큰 유효기간
        type: Number
    }
})

//몽구스에서 가져온 메소드        //무엇인가(비번 암호화)를 다 끝내면 next(다음) 펑션으로 register route의 user.save로 보낸다
userSchema.pre('save', function(next){
    var user = this; //info를 가져오는 것. req.body에 info를 다 넣었으므로!


    //user의 인포 중에서 password가 바뀔 때에만 암호화해주는 것! 아이디나 다른 정보가 바뀔 때는 암호화 또 되지않도록
    if(user.isModified('password')){
    //비밀번호를 암호화 시킨다  >> salt를 이용해서 비번 암호화 함 > salt 생성 먼저 해야함 > saltRounds=10인데, salt가 몇글자인지 나타내는 것. 10자리인 salt를 만들어서 이걸 이용해서 비번 암호화
    //salt만들 때 saltRounds가 필요함. genSalt는 salt생성한다는 뜻
    bcrypt.genSalt(saltRounds, function(err, salt) {
        if(err) return next(err) //err가 나면 register route의 user.save로 보낸다
                    
                    //myPlaintextPassword=user.password postman에 넣었던, 암호화되지않은 password임
        bcrypt.hash(user.password, salt, function(err, hash) {
            if(err) return next(err)
            user.password = hash //hash된 비밀번호. 암호화된 비밀번호로 바꿔주는 것
            next()

            });
        });
    } else {
        next()
        //만약 비번말고 다른거 바꿀 때는 그냥 next로 보내기
    }



    userSchema.methods.comparePassword = function(plainPassword, cb){
        //plainPassword 1234567      암호화된비밀번호 "$2b$10$ullre7/ycprW1w5AiAAJOumKTFYTZppcZAit3e8tRXkvuFrSveSgS" >> 같은지 체크를 해야됨 >> 플레인 패스워드도 암호화해서 맞는지봐야함

        bcrypt.compare(plainPassword, this.password, function(err, isMatch){
            if(err) return cb(err);
            cb(null, isMatch); //에러가없고, 비번같을 때는 cb(콜백)안에 null=에러없다, isMatch = 비번같다
        })
    }


    userSchema.methods.generateToken =function(cb){
        var user = this;
        
        //jsonwebtoken을 이용해서 token을 생성하기

        var token = jwt.sign(user._id.toHexString(), 'secretToken')

        //user._id + 'secretToken' = token
        //->
        //'secretToken' -> user._id

        user.token = token
        user.save(function(err, user){
            if(err) return cb(err)
            cb(null, user)
        })
    }




    userSchema.statics.findByToken = function(token, cb) {
        var user = this;

        //토큰을 decode 한다.
        jwt.verify(token, 'secretToken', function(err, decoded){
            //유저 아이디를 이용해서 유저를 찾은 다음에
            //클라이언트에서 가져온 token과 DB에 보관된 토큰이 일치하는지 확인

            user.findOne({"_id" : decoded, "token" : token}, function(err, user){
                
                if(err) return cb(err);
                cb(null, user)
            })
            
        })
    }
})
    

//user 모델에 userInfo를 저장하기 전에 무엇(비번암호화)을 한다는 것!

//위에 설정한 스키마를 감싸주는게 모델임!

                            //모델이름
const User = mongoose.model('User', userSchema)

module.exports = {User} 
//다른곳에서도 쓸 수 있도록 이 모델을 export 해준 것
