const express = require("express");
const router = express.Router();

router.get('/', (req,res,next)=>{
    res.status(200).json({
        message: 'Rent were fetched'
    })
});

router.get('/:rentId', (req,res,next)=>{
    res.status(201).json({
        message: 'Rent details',
        orderId: req.params.rentId
    })
});

router.post('/', (req,res,next)=>{
    const rent = {
        bookId: req.body.bookId,
        date: req.body.date
    }
    res.status(201).json({
        message: 'Rent was created',
        rent: rent
    })
});

router.delete('/', (req,res,next)=>{
    res.status(200).json({
        message: 'Rent was deleted'
    })
});

module.exports = router;