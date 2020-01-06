const express = require("express");
const router = express.Router();
const mongoose = require('mongoose');
const checkAuth = require('../middleware/check-auth');

const Member = require('../models/member');

router.get('/', checkAuth, (req, res, next)=>{
    Member.find()
    .select('name surname email _id')
    .exec()
    .then(docs =>{
        const response = {
            count: docs.length,
            members: docs.map(doc =>{
                return{
                    name: doc.name,
                    surname: doc.surname,
                    email: doc.email,
                    _id: doc._id,
                    url:{
                        request:{
                            type:'GET',
                            url: 'http://localhost:3000/members/'+doc._id
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

router.post('/', checkAuth, (req, res, next)=>{
    const member = new Member({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        surname: req.body.surname,
        email: req.body.email
    });
    Member.find({email: req.body.email}).exec()
    .then(exists=>{
        if(exists.length>=1){
            return res.status(409).json({
                message: 'E-mail już istnieje'
            });
        }
        member.save()
            .then(result=>{
                console.log(result);
                res.status(201).json({
                    message: "Utworzono czytelnika",
                    createdMember: {
                        name: result.name,
                        surname: result.surname,
                        email: result.email,
                        _id: result._id,
                        request:{
                            type:'GET',
                            url: 'http://localhost:3000/members/'+result._id
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
        })
    });
router.get('/:memberId', checkAuth, (req, res, next) => {
    const id = req.params.memberId;
    Member.findById(id)
    .exec()
    .then(doc =>{
        console.log("From database", doc);
        if(doc){
            res.status(200).json({
                member: doc,
                request:{
                    type: 'GET',
                    url: 'http://localhost:3000/members/'
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

router.patch('/:memberId',checkAuth, (req, res, next) => {
    const id = req.params.memberId;
    const updateOps = {};
    for(const ops of req.body){
        updateOps[ops.propName] = ops.value;
    }
    Member.update({_id: id}, {$set: updateOps}).exec()
    .then(result =>{
        res.status(200).json({
            message: 'Zaktualizowano czytelnika',
            request:{
                type: 'GET',
                url: 'http://localhost:3000/members/' + id
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

router.delete('/:memberId',  checkAuth,(req, res, next) => {
    const id = req.params.memberId;
    Member.remove({_id: id}).exec()
    .then(result =>{
        res.status(200).json({
            message:'Usunięto czytelnika',
            request:{
                type: 'POST',
                url: 'http://localhost:3000/members/',
                body: {name: 'String', surname:'String', email: 'String'}
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