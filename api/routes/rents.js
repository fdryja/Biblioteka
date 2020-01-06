const express = require("express");
const router = express.Router();
const mongoose = require('mongoose');
const checkAuth = require('../middleware/check-auth');

const Rent = require('../models/rent');
const Book = require('../models/book');
const Member = require('../models/member');

router.get('/', checkAuth, (req,res,next)=>{
    Rent.find()
    .select('book date _id')
    .populate('book', 'name')
    .exec()
    .then(docs =>{
        res.status(200).json({
            count: docs.length,
            rents: docs.map(doc=>{
                return{
                    _id: doc._id,
                    book: doc.book,
                    date: doc.date,
                    request:{
                        type:'GET',
                        url: 'http://localhost:3000/rents/' + doc._id
                    }
                }
            }),
            
        });
    })
    .catch(err =>{
        res.status(500).json(err);
    });
});

router.get('/:rentId', checkAuth, (req,res,next)=>{
    Rent.findById(req.params.rentId)
    .populate('book')
    .exec()
    .then(rent=>{
        if(!rent){
            return res.status(404).json({message: 'Rent not found'});
        }
        res.status(200).json({
            rent: rent,
            request:{
                type: 'GET',
                url: 'http://localhost:3000/rents/'
            }              
        });
    })
    .catch(err =>{
        res.status(500).json({
            error: err
        });
    });
});

router.post('/', checkAuth, (req,res,next)=>{
    Book.findById(req.body.bookId)
    .then(book =>{
        if(!book){
            return res.status(404).json({
                message: 'Book not found'
            });
        }
        const rent = new Rent({
            _id: mongoose.Types.ObjectId(),
            date: req.body.date,
            book: req.body.bookId
        });
        return rent.save()
    })
    
        .then(result =>{
            console.log(result);
            res.status(201).json({
                message: 'Rent added',
                createrRent:{
                    _id: result._id,
                    book: result.book,
                    date: result.date
                },
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/rents/' + result._id
                }
            });
        })        
    
        .catch(err=>{
            res.status(404).json({
                message:"Book already on rent"
            });
        });
    
});

router.delete('/:rentId', checkAuth, (req,res,next)=>{
    Rent.findById({_id: req.params.rentId})
    .exec()
    .then(result=>{
        if(!result){
            return res.status(404).json({
                message: 'Rent not found'
            });
        }else{Rent.remove({_id: req.params.rentId})
        .exec()
        .then(result=>{
            res.status(200).json({
                message: 'Rent deleted',
                request:{
                    type:'POST',
                    url: 'http://localhost:3000/rents/',
                    body: {bookId: "ID", date: 'Date'}
                }
            })
        })
        .catch(err=>{
            res.status(500).json({
                message: 'Book not found',
                error: err
            });
        });}
    });
    
});

module.exports = router;