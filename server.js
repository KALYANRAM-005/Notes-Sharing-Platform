const express=require('express');
const multer=require('multer');
const path=require('path');
const db=require('./db');
const session=require('express-session');
const fs=require('fs');



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
  const semno=req.query.semester;
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

app.get('/api/course-details',(req,res)=>{
  const courseId=req.query.id;
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not logged in' });
  }
  if (!courseId) {
    return res.status(400).json({ error: 'Course ID is required' });
  }

  sql='SELECT * FROM Courses WHERE course_id=?';
  db.query(sql,[courseId],(err,results)=>{
    if (err) {
      console.error('Database Error', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }
    res.json(results[0]);
  })
})

app.get('/api/notes',(req,res)=>{
  const courseId=req.query.courseId;
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not logged in' });
  }
  
  if (!courseId) {
    return res.status(400).json({ error: 'Cours ID is required' });
  }

  const sql = `
    SELECT n.*, s.name as student_name,
    CAST(n.average_rating AS FLOAT) AS average_rating
    FROM Notes n
    JOIN Students s ON n.uploader_id = s.student_id
    WHERE n.course_id = ?
    ORDER BY n.average_rating DESC
  `;

  db.query(sql,[courseId],(err,results)=>{
    if (err) {
      console.error('Database Error', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    
    res.json(results);

  })

})



app.get('/api/download-note', (req, res) => {
  const noteId = req.query.id;
  
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not logged in' });
  }
  
  if (!noteId) {
    return res.status(400).json({ error: 'Note ID is required' });
  }
  
  // Get note information from database
  const sql = 'SELECT * FROM Notes WHERE note_id = ?';
  db.query(sql, [noteId], (err, results) => {
    if (err) {
      console.error('Database Error', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }
    
    const note = results[0];
    
    // Check if file exists
    const filePath = path.resolve(note.file_url);
    
    // Make sure the file exists (security check)
    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
        console.error('File not found:', err);
        return res.status(404).json({ error: 'File not found' });
      }
      
      // Get the file name from the path
      const fileName = path.basename(filePath);
      
      // Set headers for file download
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.setHeader('Content-Type', 'application/octet-stream');
      
      // Create read stream and pipe to response
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    });
  });
});


app.post('/api/rate-note', express.json(), (req, res) => {
  const { noteId, studentId, rating, comment } = req.body;
  
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not logged in' });
  }
  
  if (!noteId || !studentId || !rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Invalid rating data' });
  }
  
  // Begin transaction
  db.beginTransaction(err => {
    if (err) {
      console.error('Transaction Error', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    
    // Check if user has already rated this note
    const checkSql = 'SELECT * FROM Reviews WHERE note_id = ? AND student_id = ?';
    db.query(checkSql, [noteId, studentId], (err, results) => {
      if (err) {
        return db.rollback(() => {
          res.status(500).json({ error: 'Internal Server Error' });
        });
      }
      
      let insertOrUpdateSql;
      let params;
      
      if (results.length > 0) {
        // Update existing review
        insertOrUpdateSql = `
          UPDATE Reviews 
          SET rating = ?, comment = ?, review_date = CURRENT_TIMESTAMP
          WHERE note_id = ? AND student_id = ?
        `;
        params = [rating, comment || null, noteId, studentId];
      } else {
        // Insert new review
        insertOrUpdateSql = `
          INSERT INTO Reviews (note_id, student_id, rating, comment)
          VALUES (?, ?, ?, ?)
        `;
        params = [noteId, studentId, rating, comment || null];
      }
      
      db.query(insertOrUpdateSql, params, (err) => {
        if (err) {
          return db.rollback(() => {
            console.error('Insert/Update Error', err);
            res.status(500).json({ error: 'Internal Server Error' });
          });
        }
        
        // Update average rating in Notes table
        const updateAvgSql = `
          UPDATE Notes n
          SET n.average_rating = (
            SELECT AVG(r.rating) 
            FROM Reviews r 
            WHERE r.note_id = ?
          )
          WHERE n.note_id = ?
        `;
        
        db.query(updateAvgSql, [noteId, noteId], (err) => {
          if (err) {
            return db.rollback(() => {
              console.error('Average Update Error', err);
              res.status(500).json({ error: 'Internal Server Error' });
            });
          }
          
          // Commit transaction
          db.commit(err => {
            if (err) {
              return db.rollback(() => {
                console.error('Commit Error', err);
                res.status(500).json({ error: 'Internal Server Error' });
              });
            }
            
            res.json({ success: true, message: 'Rating submitted successfully' });
          });
        });
      });
    });
  });
});

app.post('/api/upload-note', upload.single('noteFile'), (req, res) => {
  const { title, courseId, uploaderId } = req.body;
  const file = req.file;
  
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not logged in' });
  }
  
  // Validate request data
  if (!title || !courseId || !uploaderId || !file) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  // Check if the uploader is the logged-in user (security check)
  if (parseInt(uploaderId) !== req.session.user.student_id) {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  
  // Check if course exists
  const checkCourseSql = 'SELECT * FROM Courses WHERE course_id = ?';
  db.query(checkCourseSql, [courseId], (err, results) => {
    if (err) {
      console.error('Database Error', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    
    if (results.length === 0) {
      // Remove uploaded file if course doesn't exist
      fs.unlink(file.path, (unlinkErr) => {
        if (unlinkErr) console.error('Error deleting file:', unlinkErr);
      });
      return res.status(404).json({ error: 'Course not found' });
    }
    
    // Insert note record into database
    const insertSql = `
      INSERT INTO Notes (course_id, uploader_id, title, file_url)
      VALUES (?, ?, ?, ?)
    `;
    db.query(insertSql, [courseId, uploaderId, title, file.path], (err, result) => {
      if (err) {
        console.error('Database Error', err);
        // Remove uploaded file on error
        fs.unlink(file.path, (unlinkErr) => {
          if (unlinkErr) console.error('Error deleting file:', unlinkErr);
        });
        return res.status(500).json({ error: 'Internal Server Error' });
      }
      
      res.status(201).json({
        success: true,
        message: 'Note uploaded successfully',
        noteId: result.insertId
      });
    });
  });
});



// Get note requests for a course
app.get('/api/note-requests', (req, res) => {
  const courseId = req.query.courseId;
  
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not logged in' });
  }
  
  if (!courseId) {
    return res.status(400).json({ error: 'Course ID is required' });
  }
  
  const sql = `
    SELECT r.*, s.name as student_name 
    FROM NoteRequests r
    JOIN Students s ON r.student_id = s.student_id
    WHERE r.course_id = ?
    ORDER BY r.request_date 
  `;
  
  db.query(sql, [courseId], (err, results) => {
    if (err) {
      console.error('Database Error', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    
    res.json(results);
  });
});

// Submit a new note request
app.post('/api/submit-request', express.json(), (req, res) => {
  const { studentId, courseId, topic } = req.body;
  
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not logged in' });
  }
  
  if (!studentId || !courseId || !topic) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  // Security check - ensure the student ID matches logged-in user
  if (parseInt(studentId) !== req.session.user.student_id) {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  
  // Check if course exists
  const checkCourseSql = 'SELECT * FROM Courses WHERE course_id = ?';
  db.query(checkCourseSql, [courseId], (err, results) => {
    if (err) {
      console.error('Database Error', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    // Insert the note request
    const insertSql = `
      INSERT INTO NoteRequests (student_id, course_id, topic_requested)
      VALUES (?, ?, ?)
    `;
    
    db.query(insertSql, [studentId, courseId, topic], (err, result) => {
      if (err) {
        console.error('Database Error', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
      
      res.status(201).json({
        success: true,
        message: 'Note request submitted successfully',
        requestId: result.insertId
      });
    });
  });
});

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