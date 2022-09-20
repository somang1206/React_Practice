if(process.env.NODE_ENV === 'production'){
    module.exports = require('./prod');
}else{
    module.exports = require('./dev');
}

//배포 전/후에 따라서 가져올 파일 설정 > 정보 보호하기 위해서는 gitignore에 dev.js 추가해야함