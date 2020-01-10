const express = require("express");
const router = express.Router();
const mongoose = require('mongoose');
const checkAuth = require('../middleware/check-auth');

const Book = require('../models/book');

router.get('/', (req, res, next)=>{
    Book.find()
    .select('name author _id')
    .exec()
    .then(docs =>{
        const response = {
            count: docs.length,
            books: docs.map(doc =>{
                return{
                    name: doc.name,
                    author: doc.author,
                    _id: doc._id,
                    url:{
                        request:{
                            type:'GET',
                            url: 'http://localhost:3000/books/'+doc._id
                        }
                    }
                }
            })
        };
        res.status(200).json(response);
    })
    .catch(err=>{
        console.log(err);
        res.status(500).json({
            error: err
        })
    });
});

router.post('/',  (req, res, next)=>{
    const book = new Book({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        author: req.body.author
    });
    book.save()
    .then(result=>{
        console.log(result);
        res.status(201).json({
            message: "Utworzono książkę",
            createdBook: {
                name: result.name,
                author: result.author,
                _id: result._id,
                request:{
                    type:'GET',
                    url: 'http://localhost:3000/books/'+result._id
                }
            }
          });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
});
router.get('/:bookId', (req, res, next) => {
    const id = req.params.bookId;
    Book.findById(id)
    .exec()
    .then(doc =>{
        console.log("From database", doc);
        if(doc){
            res.status(200).json({
                book: doc,
                request:{
                    type: 'GET',
                    url: 'http://localhost:3000/books/'
                }
            });
        }else {
            res.status(404).json({message: 'Nie ma takiego numeru ID'});
        }
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({error: err});
    });
});

router.patch('/:bookId', checkAuth, (req, res, next) => {
    const id = req.params.bookId;
    const updateOps = {};
    for(const ops of req.body){
        updateOps[ops.propName] = ops.value;
    }
    Book.update({_id: id}, {$set: updateOps}).exec()
    .then(result =>{
        res.status(200).json({
            message: 'Zaktualizowano książkę',
            request:{
                type: 'GET',
                url: 'http://localhost:3000/books/' + id
            }
        });
    })
    .catch(err =>{
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
});

router.delete('/:bookId',  checkAuth,(req, res, next) => {
    const id = req.params.bookId;
    Book.remove({_id: id}).exec()
    .then(result =>{
        res.status(200).json({
            message:'Usunięto książkę',
            request:{
                type: 'POST',
                url: 'http://localhost:3000/books/',
                body: {name: 'String', author:'String'}
            }
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        })
    });
});


module.exports = router;