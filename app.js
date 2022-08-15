//import libary
const express = require('express')
const app = express()
var session = require('express-session')
const { MongoClient, ObjectId } = require('mongodb')
var validator = require('validator');
var hbs = require('express-handlebars')

// link database
const DATABASE_URL = 'mongodb+srv://anh20112001:anh20112001@cluster0.ukucj.mongodb.net/test'
const DATABASE_NAME = 'GCH0901_DB'



//hbs
app.set('view engine', 'hbs')
app.set('views', './views');
app.use(express.urlencoded({ extended: true }))

app.use(express.static("public"));

app.engine('hbs', hbs({
    extname: 'hbs',
    partialsDir: __dirname + '/views/partials'
}));

//Set session
app.use(session({
    secret: 'my secrete !@#$$%%@@$%$@#%%@#%##',
    resave: false,
    saveUninitialized: true,

}))



//index
app.get('/', async(req, res) => {

    const dbo = await getDatabase()
    const results = await dbo.collection("Products").find({}).sort({ name: 1 }).limit(200).toArray()
    let user = await dbo.collection("AccountGuess").find({ $and: [{ 'name': req.session.GuessNameLogin }] }).limit(1).toArray()
    res.render('index/index', { products: results, 'nameA': req.session.userName, 'user': user[0] })
});

app.post('/addtocart', async(req, res) => {
    const status = 'addedtocart'
    const id = req.query.id
    const myquery = { _id: ObjectId(id) }
    const newvalues = { $set: { status: status } }
    const dbo = await getDatabase()
    await dbo.collection("Products").updateOne(myquery, newvalues)
    return
})

app.post('/removeincart', async(req, res) => {
    const status = 'none'
    const id = req.query.id
    const myquery = { _id: ObjectId(id) }
    const newvalues = { $set: { status: status } }
    const dbo = await getDatabase()
    await dbo.collection("Products").updateOne(myquery, newvalues)
    let products = dbo.collection("Products")
    res.render('index/cart', { products: products })
})


app.post('/search', async(req, res) => {
    let searchText = req.body.txtSearch;
    let client = await MongoClient.connect(DATABASE_URL);
    let dbo = client.db('GCH0901_DB');
    let results = await dbo.collection("Products").find({ name: new RegExp(searchText, 'i'), slug: req.params.slug }).toArray();
    res.render('index/search', { products: results })
})

app.get('/search', (req, res) => {
    res.render('index/search')
})

app.get('/productbylowprice', async(req, res) => {
    const dbo = await getDatabase()
    const results = await dbo.collection("Products").find({}).sort({ price: 1 }).limit(200).toArray()
    res.render('index/index', { products: results })
});

app.get('/productbyhighprice', async(req, res) => {
    const dbo = await getDatabase()
    const results = await dbo.collection("Products").find({}).sort({ price: -1 }).limit(200).toArray()
    res.render('index/index', { products: results })
});

app.get('/product', async(req, res) => {
    const dbo = await getDatabase()
    const results = await dbo.collection("Products").find({}).sort({ name: 1 }).limit(200).toArray()

    res.render('productsManage/product', { products: results })
});

app.get('/productbylowprice', async(req, res) => {
    const dbo = await getDatabase()
    const results = await dbo.collection("Products").find({}).sort({ price: 1 }).limit(200).toArray()
    res.render('productsManage/product', { products: results })
});

app.get('/productbyhighprice', async(req, res) => {
    const dbo = await getDatabase()
    const results = await dbo.collection("Products").find({}).sort({ price: -1 }).limit(200).toArray()
    res.render('productsManage/product', { products: results })
});

app.get('/about', (req, res) => {
    res.render('index/about')
});

app.get('/productInfo', async(req, res) => {
    const id = req.query.id
    const dbo = await getDatabase()
    const productToEdit = await dbo.collection("Products").findOne({ _id: ObjectId(id) })
    res.render('index/productInfo', { product: productToEdit })
})

app.get('/productbylego', async(req, res) => {
    const dbo = await getDatabase()
    const productbylego = await dbo.collection("Products").find({ $and: [{ type: 'Lego' }] }).toArray()
    res.render('index/search', { products: productbylego })
})

app.get('/productbyBroadgame', async(req, res) => {
    const dbo = await getDatabase()
    const productbylego = await dbo.collection("Products").find({ $and: [{ type: 'Board game' }] }).toArray()
    res.render('index/search', { products: productbylego })
})

app.get('/productbyHero', async(req, res) => {
    const dbo = await getDatabase()
    const productbylego = await dbo.collection("Products").find({ $and: [{ type: 'Siêu nhân' }] }).toArray()
    res.render('index/search', { products: productbylego })
})

app.get('/productbyMohinh', async(req, res) => {
    const dbo = await getDatabase()
    const productbylego = await dbo.collection("Products").find({ $and: [{ type: 'Mô hình' }] }).toArray()
    res.render('index/search', { products: productbylego })
})

app.get('/productbyLaprap', async(req, res) => {
    const dbo = await getDatabase()
    const productbylego = await dbo.collection("Products").find({ $and: [{ type: 'Lắp ráp' }] }).toArray()
    res.render('index/search', { products: productbylego })
})

app.get('/productbyDieukhien', async(req, res) => {
    const dbo = await getDatabase()
    const productbylego = await dbo.collection("Products").find({ $and: [{ type: 'Điều khiển' }] }).toArray()
    res.render('index/search', { products: productbylego })
})

//login
app.get('/login', (req, res) => {
    res.render('login')
});

app.get('/signup', (req, res) => {
    res.render('signup')
});


app.post('/signup', async(req, res) => {
    const NewAccountName = req.body.txtNewAccountName
    const NewAccountPassword = req.body.txtNewAccountPassword


    const newGuess = { GuessNameLogin: NewAccountName, GuessPasswordLogin: NewAccountPassword }
    const dbo = await getDatabase()
    const result = await dbo.collection("AccountGuess").insertOne(newGuess);

    res.redirect('/')
})

app.post('/login', async(req, res) => {
    let nameLogin = req.body.txtNameLogin
    let passwordLogin = req.body.txtPasswordLogin

    const dbo = await getDatabase()
    let result = await dbo.collection("AccountGuess").find({ $and: [{ 'GuessNameLogin': nameLogin }] }).toArray()
    if (result.length > 0) {
        res.redirect('/'),
            req.session.userName = result.GuessNameLogin
    } else {
        res.render('login', { error: 'Login False. Retry' })
    }
});

function isAuthenticated(req, res, next) {
    let chuaDangNhap = !req.session.userName
    if (chuaDangNhap)
        res.redirect('/')
    else
        next()
}

app.get('/logout', (req, res) => {
    req.session.userName = null
    req.session.save((err) => {
        req.session.regenerate((err2) => {
            res.redirect('/')
        })
    })
})



//product
app.get('/addnew', (req, res) => {
    res.render('productsManage/addnew')
})
app.post('/addnew', async(req, res) => {
    const nameInput = req.body.txtName
    const priceInput = req.body.txtPrice
    const picURLInput = req.body.txtPicURL
    const decriptionInput = req.body.txtDecription
    const typeInput = req.body.txtType
    const slug = req.body.txtName
    const status = 'none'
    if (isNaN(priceInput) == true) {
        //Khong phai la so, bao loi, ket thuc ham
        const errorMessage = "Gia phai la so!"
        const oldValues = { name: nameInput, price: priceInput, picURL: picURLInput, type: typeInput, status: status, decription: decriptionInput }
        res.render('productsManage/addnew', { error: errorMessage, oldValues: oldValues })
        return;
    }
    if (nameInput == 0) {
        const errorMess = "phai nhap"
        const oldValues = { name: nameInput, price: priceInput, picURL: picURLInput, type: typeInput, status: status, decription: decriptionInput }
        res.render('productsManage/addnew', { errors: errorMess, oldValues: oldValues })
        return;
    }
    const newP = { name: nameInput, price: Number.parseFloat(priceInput), picURL: picURLInput, type: typeInput, slug: slug, status: status, decription: decriptionInput }

    const dbo = await getDatabase()
    const result = await dbo.collection("Products").insertOne(newP)

    res.redirect('product')
})

app.get('/delete', async(req, res) => {
    const id = req.query.id
    const dbo = await getDatabase()
    await dbo.collection("Products").deleteOne({ _id: ObjectId(id) })
    res.redirect('product')
})



app.post('/edit', async(req, res) => {
    const nameInput = req.body.txtName
    const priceInput = req.body.txtPrice
    const picURLInput = req.body.txtPicURL
    const typeInput = req.body.txtType
    const decriptionInput = req.body.txtDecription
    const id = req.body.txtId

    if (isNaN(priceInput) == true) {
        //Khong phai la so, bao loi, ket thuc ham
        const errorMessage = "Gia phai la so!"
        const oldValues = { name: nameInput, price: Number.parseFloat(priceInput), picURL: picURLInput, type: typeInput, decription: decriptionInput }
        res.render('productsManage/edit', { error: errorMessage, oldValues: oldValues })
        return;
    }

    const myquery = { _id: ObjectId(id) }
    const newvalues = { $set: { name: nameInput, price: priceInput, type: typeInput, picURL: picURLInput, decription: decriptionInput } }
    const dbo = await getDatabase()
    await dbo.collection("Products").updateOne(myquery, newvalues)
    res.redirect('/product')
})

app.get('/edit', async(req, res) => {
    const id = req.query.id
    const dbo = await getDatabase()
    const productToEdit = await dbo.collection("Products").findOne({ _id: ObjectId(id) })
    res.render('productsManage/edit', { product: productToEdit })
})


// cart

app.get('/cart', async(req, res) => {
    let total = 0
    const dbo = await getDatabase()
    const results = await dbo.collection("Products").find({ status: 'addedtocart' }).sort({ name: 1 }).limit(200).toArray()
    res.render('index/cart', { products: results })
        //const totalMoney = convertMoney(products.price)
})




app.post('/addnewguess', async(req, res) => {
    const nameGuessInput = req.body.txtNameGuessInput
    const emailGuessInput = req.body.txtEmailGuessInput
    const cityGuessInput = req.body.txtCityGuessInput
    const addressGuessInput = req.body.txtAddressGuessInput
    const imageGuessInput = req.body.txtAddressGuessInput

    const newGuess = { GuessName: nameGuessInput, GuessEmail: emailGuessInput, GuessCity: cityGuessInput, GuessAdress: addressGuessInput, GuessImage: imageGuessInput }
    const dbo = await getDatabase()
    const result = await dbo.collection("AccountGuess").insertOne(newGuess);

    res.redirect('/')
})



// guess manage

app.get('/guessmanage', async(req, res) => {
        const dbo = await getDatabase()
        const results = await dbo.collection("AccountGuess").find({}).sort({ name: 1 }).limit(200).toArray()
        res.render('guessmanage', { accountGuess: results })
    })
    ///////////////////
const PORT = process.env.PORT || 8000
const port = 8000
app.listen(PORT)
console.log(`Server is running at "http://localhost:${port}"`)

async function getDatabase() {
    const client = await MongoClient.connect(DATABASE_URL)
    const dbo = client.db(DATABASE_NAME)
    return dbo
}