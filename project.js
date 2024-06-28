var con=require('./project_connection');
var express=require('express');
var app=express();
var bodyparser=require('body-parser');
var encoder=bodyparser.urlencoded({extended:true});
app.use(bodyparser.json());
app.use(express.static('public'));
//app.use(express.static('public'));
app.use(bodyparser.urlencoded({extended:true}));
app.set('view engine','ejs');
app.use(express.static('public'));
const path = require('path');


app.set('views', path.join(__dirname, 'views'));
const session = require('express-session');


app.use(session({
    secret: 'rgukt123', // Replace with a strong secret key
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set secure: true if you're using https
  }));

// Middleware to check if user is logged in
function isAuthenticated(req, res, next) {
    if (req.session.user) {
      return next();
    }
    res.redirect('/user_login_form.html');
  }


app.get('/',function(req,res){
    res.sendFile(__dirname +'/home_page.html');
});
app.get('/user_login_form.html',function(req,res){
    res.sendFile(__dirname+'/user_login_form.html');
});

app.get('/admin_login_form.html',function(req,res){
    res.sendFile(__dirname+'/admin_login_form.html');
});

app.get('/new_user_login.html',function(req,res){
    res.sendFile(__dirname+'/new_user_login.html');
});

app.get('/inserting_books.html',function(req,res){
    res.sendFile(__dirname+'/inserting_books.html');
});

// Configure Express to serve static files from the 'public' directory


// Route to serve the after_user_login.ejs file
// app.get('/after_user_login', function(req, res) {
//     res.sendFile(__dirname + '/after_user_login.ejs');
// });


app.get('/after_user_login.ejs', (req, res) => {
    res.render('after_user_login'); // Renders after_user_login.ejs for GET requests
});

app.get('/books.ejs',function(req,res){
    var query="select * from books";
    con.query(query,function(error,result){
        if(error) throw error;
        res.render(__dirname+'/books.ejs',{some:result})
    });
    
});
app.get('/orders.ejs', function(req, res) {
    var qry = "SELECT * FROM orders";
    con.query(qry, function(error, result) {
        if (error) {
            console.error("Error fetching orders:", error);
            return res.status(500).send('Database error');
        }
     //   console.log("Fetched orders:", result); // Check fetched orders in the console
        res.render(__dirname + '/orders.ejs', { orders: result });
    });
});

app.get('/delete_book',function(req,res){
    var book_id=req.query.book_id;
    var qry="delete from books where book_id=?";
    con.query(qry,[book_id],function(error,result){
        if(error) throw error;
        res.redirect('/books.ejs');
    });
});


app.get('/update_book',function(req,res){
    var book_id=req.query.book_id;
    var qry="select * from books where book_id=?";
    con.query(qry,[book_id],function(error,result){
        if(error) throw error;
        res.render(__dirname+'/update_book.ejs',{updating:result});
    });
});

app.get('/viewing_for_user',function(req,res){
    var query="select * from books";
    con.query(query,function(error,result){
        if(error) throw error;
        res.render(__dirname+'/views/viewing_for_user.ejs',{some:result, user: req.session.user});
    });
});
app.get('/place_order_form.html',function(req,res){
    res.sendFile(__dirname+'/place_order_form.html');
});

/*app.get('/orders.ejs',function(req,res){
    var qry="select * from orders";
    con.query(qry,function(error,result){
        if(error) throw error;
        res.render(__dirname+'/orders.ejs',{orders:result})
    });
});*/






app.get('/bought',function(req,res){
    var user_id=req.query.user_id;
    var qry="select * from users where user_id=?";
    con.query(qry,[user_id],function(error,result){
        if(error) throw error;
        else if (result.length>0) {
            res.render(__dirname+'/after_user_login.ejs',{any:result});
        } else {
            res.sendFile(__dirname+'/user_not_found.html');
        }
    });
});
//STOPPED HERE , THINK OF DELETING FROM HISTORY , ADDING THE BOOK BACK TO THE BOOKS TABLE AND REDIRECT IT TO THE SHOWING HISTORY PAGE
app.get('/delete_from_history',function(req,res){
    var user_id=req.query.user_id;
    var book_id=req.query.book_id;
    var qry="update books set book_quantity=book_quantity+1 where book_id=?";
    con.query(qry,[book_id],function(error,result){
        if(error) throw error;
        var qry2="delete from borrowed_books where user_id=?";
        con.query(qry2,[user_id],function(error,result){
            if(error) throw error;
            else{
                var qry3="select * from borrowed_books where book_id=?";
                con.query(qry3,[book_id],function(error,result){
                    if(error) throw error;
                });
            }
        });
    });
});
app.get('/logged_out.html',function(req,res){
    res.sendFile(__dirname+'/logged_out.html');
});

app.get('/selecting_book',function(req,res){
    var book_id=req.query.book_id;
    var user_id=req.session.user.user_id;
    var borrow_date= new Date();
    const finaldate = borrow_date.toISOString().slice(0, 10);
    const qry1 = `
    INSERT INTO student_${user_id}_history (user_id, book_id, borrow_date) VALUES (?, ?,?) `;
    con.query(qry1, [user_id, book_id, finaldate], function(error, result){
        if(error) throw error;
    
        const qry2 = ` UPDATE books SET book_quantity = book_quantity - 1 WHERE book_id = ? AND book_quantity > 0 `;

        con.query(qry2, [book_id], function(error, result){
            if(error) throw error;
            res.sendFile(__dirname+'/continue_to_have.html');
        });
        
        
    });
});

app.post('/bought',function(req,res){
    var user_id=req.query.user_id;
    var qry="select * from users where user_id=?";
    con.query(qry,[user_id],function(error,result){
        if(error) throw error;
        else if (result.length>0){
            res.render(__dirname+'/after_user_login.ejs',{any:result});
        } else {
            res.sendFile(__dirname+'/user_not_found.html');
        }
    });
});
/*app.post('/confirm_order', function(req, res) {
    var bookTitle = req.body.book_title;
    var bookAuthor = req.body.book_author;

    var qry = "UPDATE orders SET confirmed = 1 WHERE book_title = ? AND book_author = ?";
    con.query(qry, [bookTitle, bookAuthor], function(error, result) {
        if (error) throw error;
        res.redirect('/orders');
    });
});*/
app.post('/sending_to_orders',function(req,res){
    var book_name=req.body.book_title;
    var book_author=req.body.book_author;
    var qry="insert into orders(book_title,book_author) values(?,?)";
    con.query(qry,[book_name,book_author],function(error,result){
        if(error) throw error;
        res.sendFile(__dirname+"/done.html")
    });
});
app.post('/continue_to_have.ejs', function(req, res) {
    var book_id = req.query.book_id;
    var user_id = req.query.user_id;
    var book_author = req.query.book_author;
    var book_title = req.query.book_title;
    var book_prize = req.query.book_prize;

    console.log("Received parameters:", { book_id, user_id, book_author, book_title, book_prize });

    if (!user_id) {
        return res.status(400).send('User ID is missing');
    }

    var qry1 = "INSERT INTO borrowed_books (book_id, user_id, book_title, book_author, book_prize) VALUES (?, ?, ?, ?, ?)";
    
    con.query(qry1, [book_id, user_id, book_title, book_author, book_prize], function(error, result) {
        if (error) {
            console.error("Error inserting into borrowed_books:", error);
            return res.status(500).send('Database error');
        }

        var qry2 = "UPDATE books SET book_quantity = book_quantity - 1 WHERE book_id = ?";
        
        con.query(qry2, [book_id], function(error, result) {
            if (error) {
                console.error("Error updating books:", error);
                return res.status(500).send('Database error');
            }

            var qry3 = "SELECT * FROM users WHERE user_id = ?";
            
            con.query(qry3, [user_id], function(error, result) {
                if (error) {
                    console.error("Error selecting from users:", error);
                    return res.status(500).send('Database error');
                }

                console.log("User query result:", result);

                if (result.length === 0) {
                    return res.status(404).send('User not found');
                }

                res.render('continue_to_have', { many: result });
            });
        });
    });
});


   /* app.post('/continue_to_have.ejs',function(req,res ) PRAVEEN CODE{
        var book_id=req.query.book_id;
        var user_id=req.query.user_id;
        var book_author=req.query.book_author;
        var book_title=req.query.book_title;
        var book_prize=req.query.book_prize;
        var qry1="insert into borrowed_books(book_id,user_id,book_title,book_author,book_prize) values(?,?,?,?,?)";
        con.query(qry1,[book_id,user_id,book_title,book_author,book_prize],function(error,result){
            if(error) throw error;
            var qry2="update books set book_quantity=book_quantity-1 where book_id=?"; 
            con.query(qry2,[book_id],function(error,result){
                if(error) throw error;
            var qry3="select * from users where user_id=?";
            con.query(qry3,[user_id],function(error,result){
                if(error) throw error;
                res.render(__dirname+'/continue_to_have.ejs',{many:result});
            }); 
        });

    });
    
});
/*app.post('/continue_to_have.ejs',function(req,res){
    var book_id=req.query.book_id;
    var user_id=req.query.user_id;
    var qry1="select * from books,users where book_id=? and user_id=?";
    con.query(qry1,[book_id,user_id],function(error,result){
        if(error) throw error;
        else if (result.length>0) {
            res.render(__dirname+'/continue_to_have.ejs',{many:result});
        } else {
            printf("nothing.!");
        }
    });
    
});*/
app.get('/history', function(req, res){
    var user_id=req.session.user.user_id;
    
    const query=`select * from student_${user_id}_history`;
    con.query(query, function(error, result){
        if(error) throw error;
        if(result.length>0){
        res.render(__dirname+'/views/viewing_history.ejs', {some:result});
        }
        else{
            res.render(__dirname+'/views/no_history.ejs');
        }
    });
});

app.post('/update_book',function(req,res){
    var book_title=req.body.book_title;
    var book_author=req.body.book_author;
    var book_prize=req.body.book_prize;
    var book_quantity=req.body.book_quantity;
    var book_id=req.body.book_id;
    
    var qry="update books set book_title=?,book_author=?,book_prize=?,book_quantity=? where book_id=?"
    con.query(qry,[book_title,book_author,book_prize,book_quantity,book_id],function(error,result){
        if(error) throw error;
        res.redirect('/books.ejs');
    });
});

app.post('/viewing_book.ejs', function(req, res) {
    var book_title = req.body.book_title;
    var book_author = req.body.book_author;
  //  var user_id = req.body.user_id; // Make sure to retrieve user_id from the request
    var query = "SELECT * FROM books WHERE book_title = ? AND book_author = ?";
    con.query(query, [book_title, book_author], function(error, result) {
        if (error) throw error;
        if (result.length > 0) {
            res.render(__dirname + '/viewing_book.ejs', { book: result});
        } else {
            res.sendFile(__dirname + '/book_not_found.html');
        }
    });
});




/*app.post('/viewing_book.ejs',function(req,res){
    var book_title=req.body.book_title;
    var book_author=req.body.book_author;
    var id=req.query.user_id;
    var query="select * from books,users where book_title=? and book_author=?";
    con.query(query,[book_title,book_author],function(error,result){
        if(error) throw error;
        else if (result.length>0) {
            res.render(__dirname+'/viewing_book.ejs',{book:result});
        } else {
            res.sendFile(__dirname+'/book_not_found.html');
        }
    });
});*/

app.post('/after_admin_login.html',function(req,res){
    var admin_name=req.body.admin_name;
    var password=req.body.password;

    var query="select * from admins where admin_name=? and password=?";
    con.query(query,[admin_name,password],function(error,result){

        if(error) throw error;
        else if (result.length>0) {
            res.render(__dirname+'/after_admin_login.ejs',{admin:result});
        } else {
            res.sendFile(__dirname+'/admin_not_found.html');
        }
    });
});

app.post('/add_books',function(req,res){
    var book_id=req.body.book_id;
    var book_title=req.body.book_title;
    var book_author=req.body.book_author;
    var book_prize=req.body.book_prize;
    var book_quantity=req.body.book_quantity;
    var qry="insert into books(book_id,book_title,book_author,book_prize,book_quantity) values(?,?,?,?,?)";
    con.query(qry,[book_id,book_title,book_author,book_prize,book_quantity],function(error,result){
        if(error) throw error;
        res.redirect('/books.ejs');
    });
});

app.get('/after_user_login',encoder,function(req, res){
    res.render(__dirname+ '/views/after_user_login.ejs', {user: req.session.user});
});

// app.get('/after_user_login', isAuthenticated,function(req, res){
//     res.render(__dirname+'/views/after_user_login.ejs', {user: req.session.user});
// });

app.post('/after_user_login.ejs',encoder,function(req,res){
    var user_id=req.body.user_id; 
    var password=req.body.password;
    var qry="select * from users where user_id=? and password=?";
    con.query(qry,[user_id,password],function(error,result){
        if(error) throw error;
        else if (result.length>0) {
            req.session.user = { user_id: result[0].user_id };
            res.render(__dirname+ '/views/after_user_login.ejs',{ user: req.session.user});
        } else {
            res.sendFile(__dirname+'/user_not_found.html');
        }
    });
});




app.post('/register',function(req,res){
    var user_id=req.body.user_id;
    var password=req.body.password;
    var query="insert into users(user_id,password) values(?,?)";


    con.query(query,[user_id,password],function(error,result){
        if(error) throw error;
        
        const createhistorytable=`
            create table if not exists student_${user_id}_history (
                id int auto_increment primary key,
                user_id varchar(30), 
                book_id varchar(30), 
                borrow_date Date, 
                return_date Date, 
                foreign key(user_id) references users(user_id),
                foreign key(book_id) references books(book_id)
            )
        `;
        con.query(createhistorytable , function(error, result){
            if(error) throw error;
            res.sendFile(__dirname+"/registered.html");
        });

        res.sendFile(__dirname+"/registered.html");
    });
});

// const session = require('express-session');



app.listen(8000,'localhost',function(){
    console.log('server started listening on port:8000');
});
