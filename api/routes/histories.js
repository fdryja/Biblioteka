const express = require("express");
const router = express.Router();
const mongoose = require('mongoose');
const checkAuth = require('../middleware/check-auth');

const History = require('../models/history');
const Rent = require('../models/rent');


router.get('/', checkAuth, (req, res, next)=>{
    History.find()
    .select('book member dateRent dateReturned _id')
    .populate('book', 'name author')
    .populate('member', 'name surname email')
    .exec()
    .then(docs =>{
        const response = {
            count: docs.length,
            history: docs.map(doc =>{
                return{
                    book: doc.book,
                    member: doc.member,
                    dateRent: doc.dateRent,
                    dateReturned: doc.dateReturned,
                    _id: doc._id,
                    url:{
                        request:{
                            type:'GET',
                            url: 'http://localhost:3000/histories/'+doc._id
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


router.get('/:historyId', checkAuth, (req,res,next)=>{
    History.findById(req.params.historyId)
    .select('book name author _id')
    .populate('book', 'name author')
    .select('member name surname email')
    .populate('member', 'name surname email')
    .select('history dateRent dateReturned')
    .populate('history', 'dateRent dateReturned')
    .exec()
    .then(rent=>{
        if(!rent){
            return res.status(404).json({message: 'Nie ma takiego wypożyczenia'});
        }
        res.status(200).json({
            rent: rent,
            request:{
                type: 'GET',
                url: 'http://localhost:3000/histories/'
            }              
        });
    })
    .catch(err =>{
        res.status(500).json({
            error: err
        });
    });
});

router.delete('/r/:rentId', checkAuth, (req,res,next)=>{
    Rent.findById({_id: req.params.rentId})
    .exec()
    .then(result=>{
        if(!result){
            return res.status(404).json({
                message: 'Nie ma takiego wypożyczenia'
            });
        }

        const history = new History({
            _id: mongoose.Types.ObjectId(),
            book: result.book,
            member: result.member,
            dateRent: result.date,
            dateReturned: Date.now()
        });
        history.save();
        Rent.remove({_id: req.params.rentId})
        .exec()
        .then(result=>{
            res.status(200).json({
                message: 'Oddano książkę',
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

router.delete('/:historyId', checkAuth, (req,res,next)=>{
    History.findById({_id: req.params.historyId})
    .exec()
    .then(result=>{
        if(!result){
            return res.status(404).json({
                message: 'Nie ma takiego wypożyczenia w historii'
            });
        }
        History.remove({_id: req.params.historyId})
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