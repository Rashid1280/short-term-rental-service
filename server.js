const express = require('express');
const app = express();
const path = require('path');
const multer = require('multer');
 


//get all files

require('./src/db/conn')
const Register = require('./src/models/registers');
const propertyModel = require('./src/models/addProperty');

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({limit: '50mb', extended:false}));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(express.static('./public'));
app.set("view engine", "hbs");

app.get('/',(req,res)=>{
res.render("login");
console.log(req.query)
})

app.get('/login',(req,res)=>{
    res.render("login");
    })

app.get('/register',(req,res)=>{
    res.render('register');
    console.log(req.query)

})

app.get('/index',(req,res)=>{
    res.render('index');
    console.log(req.query)

})
//add property

const storage = multer.diskStorage({
  destination: './uploads/',
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

const upload = multer({
  storage: storage,
  limits: { 
    fileSize: 10 * 1024 * 1024, 
    files: 10  
     },
      fileFilter: fileFilter
}).array('images', 10);


app.get('/addProperty', (req, res) => {
  res.render('addProperty');
});

app.post('/addProperty', (req, res, next) => {
    upload(req, res, async (err) => {
        if (err instanceof multer.MulterError) {
            console.error('Multer Error:', err);
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).send(`
                    <h1>File too large!</h1>
                    <p>Maximum file size is 10MB per file.</p>
                    <a href="/addProperty">Go Back</a>
                `);
            }
            if (err.code === 'LIMIT_FILE_COUNT') {
                return res.status(400).send(`
                    <h1>Too many files!</h1>
                    <p>Maximum 10 files allowed.</p>
                    <a href="/addProperty">Go Back</a>
                `);
            }
            return res.status(400).send(`
                <h1>Upload Error!</h1>
                <p>${err.message}</p>
                <a href="/addProperty">Go Back</a>
            `);
        } else if (err) {
            console.error('Other Error:', err);
            return res.status(500).send(`
                <h1>Server Error!</h1>
                <p>${err.message}</p>
                <a href="/addProperty">Go Back</a>
            `);
        }

        try {
          
            if (!req.files || req.files.length === 0) {
                return res.status(400).send(`
                    <h1>No files uploaded!</h1>
                    <p>Please select at least one image.</p>
                    <a href="/addProperty">Go Back</a>
                `);
            }

           
            const imagePaths = req.files.map(file => file.path);
            
            console.log('Uploaded files:', imagePaths); 
            const propertyDetails = new propertyModel({
                propertyType: req.body.propertyType,
                description: req.body.description,
                location: req.body.location,
                address: req.body.address,
                price: req.body.price,
                ownerNo: req.body.ownerNo,
                images: imagePaths
            });

            await propertyDetails.save();
            const data = await propertyModel.find().exec();
            res.render('propertyAdded', { title: 'addProperty', records: data });
        } catch (error) {
            console.log('Database Error:', error);
            res.status(500).send(`
                <h1>Database Error!</h1>
                <p>${error.message}</p>
                <a href="/addProperty">Go Back</a>
            `);
        }
    });
});



// creating userdata
app.post('/register',async (req,res)=>{
    try {
        const password = req.body.password;
        const cpassword = req.body.cpassword;

        if(password===cpassword){
             const registerEmployee = new Register({
                Username : req.body.Username,
                email : req.body.email,
                password : req.body.password,
                cpassword : req.body.cpassword,
           })
        //    registerEmployee.save()
           const registered = await registerEmployee.save();
           res.status(201).render('login');
        }else{
            res.send("<h1>PLEASE MATCH THE PASSWORDS....</h1>")
        }
    } catch (error) {
        res.status(404).send(error)
    }

})

app.post('/login',async (req,res)=>{
   
    try {
        
       const email = req.body.email;
       const password = req.body.password;

       const userMail = await Register.findOne({email:email});
       if(userMail.password === password){
        res.status(201).render('index');
       }else{
        res.send("<h1>INVALID CREDENTIALS. PLEASE TRY AGAIN....</h1>")
       }

    } catch (error) {
        res.status(400).send("invalid email")
    }

    })

//////////////////////////////////////////////////////////////////////////////////////////////
app.get('/properties', async (req, res, next) => {
  try {
    const properties = await propertyModel.find().exec(); // Fetch all the properties from MongoDB

    res.render('properties', { title: 'All Properties', properties: properties });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

////////////////////////////////////////////////////////////////////////////////////////////
app.get('/search', async (req, res, next) => {
    try {
        const propertyType = req.query.propertyType;
        const location = req.query.location;

        // Build search query
        let searchQuery = {};
        
        if (propertyType && propertyType !== '') {
            searchQuery.propertyType = propertyType;
        }
        
        if (location && location !== '') {
            searchQuery.location = { $regex: location, $options: 'i' };
        }

        console.log('Search query:', searchQuery); // Debug log

        const results = await propertyModel.find(searchQuery).exec();
        
        console.log('Search results:', results.length, 'properties found'); // Debug log

        res.render('searchResults', { title: 'Search Results', properties: results });
    } catch (error) {
        console.error('Search Error:', error);
        next(error);
    }
});







app.all('*',(req,res)=>{
    res.status(404).send("<h1>resource not found</h1>")
})

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server listening on ${port}`));


