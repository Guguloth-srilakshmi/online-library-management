const mysql=require('mysql');
const con=mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'rgukt123',
    database:'project'
    
})
module.exports =con;