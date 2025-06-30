const express=require('express');
const multer=require('multer');
const path=require('path');
const db=require('./db');
const session=require('express-session');


const app=express()
const PORT=3000;

app.use(express.static('public')); // Serve index.html
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'your_secret_key', // Change to something secure
  resave: false,
  saveUninitialized: true
}));
app.use(express.json());


// Set up Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

//login route
app.post('/login',(req,res)=>{
  const {email,password}=req.body;
  // query to verify credentials
  const sql='SELECT * FROM Students WHERE email=? AND password=?';
  db.query(sql,[email,password],(err,results)=>{
    if(err){
      console.error('Database Error',err);
      return res.status(500).send('Internal Server Error');
    }
    if(results.length>0){

      const user=results[0];
      req.session.user=user;
      res.redirect('/home.html');
      // res.send('Login Successful !!')
    } else{
      res.send('Invalid Email-ID or password')

    }
  })
})

app.post('/signup',(req,res)=>{
  const{name,email,semester,department,password}=req.body;
  const sql='SELECT * FROM Students WHERE email=?';
  db.query(sql,email,(err,results)=>{
    if(err){
      console.error('Database Error',err);
      return res.status(500).send('Internal Server Error');
    }
    if(results.length>0){
      res.send('Email-ID already exists')
      } else{
        const sql2='INSERT INTO Students(name,email,semester_number,department_name,password) VALUES(?,?,?,?,?)'
        db.query(sql2,[name,email,semester,department,password],(err,results2)=>{
          if(err){
            console.error('Database Error',err);
            return res.status(500).send('Internal Server Error');
          }
          res.send('SignUp Successful !!')

        })
  
      }
  })
})

app.post('/logout',(req,res)=>{
  req.session.destroy(err=>{
    if(err){
      console.error(err);
      return res.status(500).send('Could not logout')
    }
    res.redirect('/index.html')
  })


})

app.get('/api/user', (req, res) => {
  if (!req.session.user) {
      return res.status(401).json({ error: 'Not logged in' });
  }
  
  res.json({
      user: req.session.user,
      semester: req.session.sem || null
  });
});

app.post('/set-semester',(req,res)=>{
  if(!req.session.user){
    return res.status(401).json({ error: 'Not logged in' });
  }
  req.session.sem=req.body.sem;
  res.json({ success: true });

})

app.get('/api/courses',(req,res)=>{
  const semno=req.session.sem;
  if(!req.session.user){
    return res.status(401).json({ error: 'Not logged in' });
  }

  sql='SELECT * FROM Courses WHERE semester_number=?';
  db.query(sql,semno,(err,results)=>{
    if (err){
      console.error('Database Error', err);
            return res.status(500).json({ error: 'Internal Server Error' });

    }
    res.json(results);
  })
})

/*

// File upload route
app.post('/upload', upload.single('noteFile'), (req, res) => {
  const file = req.file;
  const { uploader, course } = req.body;

  const sql = `INSERT INTO notes (course_id, uploader_id, title, file_url)
             VALUES (?, ?, ?, ?)`;
const values = [course, uploader, file.originalname, file.path];


  db.query(sql, values, (err) => {
    if (err) {
      console.error('DB error:', err);
      return res.status(500).send('Upload failed!');
    }
    res.send('File uploaded successfully!');
  });
});
*/

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});