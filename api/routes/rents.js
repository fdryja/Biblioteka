const express = require("express");
const router = express.Router();
const mongoose = require('mongoose');
const checkAuth = require('../middleware/check-auth');

const Rent = require('../models/rent');
const Book = require('../models/book');
const Member = require('../models/member');


router.get('/',  (req,res,next)=>{
    Rent.find()
    .select('book member date _id')
    .populate('book', 'name author')
    .populate('member','name surname email')
    .exec()
    .then(docs =>{
        res.status(200).json({
            count: docs.length,
            rents: docs.map(doc=>{
                return{
                    _id: doc._id,
                    book: doc.book,
                    member: doc.member,
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
    .select('book name author _id')
    .populate('book', 'name author')
    .select('member name surname email')
    .populate('member', 'name surname email')
    .exec()
    .then(rent=>{
        if(!rent){
            return res.status(404).json({message: 'Nie ma takiego wypożyczenia'});
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

router.post('/',  (req,res,next)=>{
    const rent = new Rent({
        _id: new mongoose.Types.ObjectId(),
        book: req.body.bookId,
        member: req.body.memberId,
        date: req.body.date
    });
    Member.findById(req.body.memberId).exec()
    .then(member=>{
        console.log(req.body.bookId);
        if(!member){
            return res.status(404).json({
                message: 'Czytelnik nie znaleziony'
            });
        }
        Book.findById(req.body.bookId)
            .then(book =>{
            if(!book){
                return res.status(404).json({
                    message: 'Książka nie znaleziona'
                });
            }
            Rent.find({book: req.body.bookId}).exec()
            .then(exists=>{
                if(exists.length>=1){
                    return res.status(409).json({
                        message: 'Książka jest już wypożyczona'
                    });
                }
                rent.save()
                .then(result =>{
                    console.log(result);
                    res.status(201).json({
                        message: 'Dodano wypożyczenie',
                        createdRent:{
                            _id: result._id,
                            book: result.book,
                            member: result.member,
                            date: result.date
                            },
                            request: {
                                type: 'GET',
                                url: 'http://localhost:3000/rents/' + result._id
                            }
                        });
                    });   
                })
            })
        })
        .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
});  



router.delete('/:rentId', checkAuth, (req,res,next)=>{
    Rent.findById({_id: req.params.rentId})
    .exec()
    .then(result=>{
        if(!result){
            return res.status(404).json({
                message: 'Nie ma takiego wypożyczenia'
            });
        }
        Rent.remove({_id: req.params.rentId})
        .exec()
        .then(result=>{
            res.status(200).json({
                message: 'Usunięto wypożyczenie',
                request:{
                    type:'POST',
                    url: 'http://localhost:3000/rents/',
                    body: {bookId: "ID", date: 'Date'}
                }
            })
        })
    })
    .catch(err=>{
        res.status(err).json({
            error: err
        });
    });
});



module.exports = router;