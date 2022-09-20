const mongoose = require('mongoose');

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

//위에 설정한 스키마를 감싸주는게 모델임!

                            //모델이름
const User = mongoose.model('User', userSchema)

module.exports = {User} //다른곳에서도 쓸 수 있도록 이 모델을 export 해준 것