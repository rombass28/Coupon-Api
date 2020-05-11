const express = require('express');
const app = express();
const port = 3000;
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectID;
const bodyParser = require('body-parser');
const cors = require('cors');

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));


app.use(bodyParser.json());

let db;
const client = new MongoClient('mongodb://localhost:27017', { useUnifiedTopology: true });
client.connect((err) => {
    if (err) {
        console.error(err);
        return;
    }
    db = client.db('store');
    console.log('Successful connection to DB');
});


app.put('/coupon', (req, res) => {
    const coupon = {
        code: req.body.code,
        date: new Date(),
        isRedeem: false
    };
    db.collection('coupons').insertOne(coupon, (err, coupon) => {
        if (err) {
            console.log(err);
            res.sendStatus(500);
            return;
        }
        res.status(201);
    });
});


app.get('/coupon', (req, res) => {
    db.collection('coupons').find().toArray((err, coupons) => {
        if (err) {
            console.log(err);
            res.sendStatus(500);
            return;
        }
        res.json(coupons);
    });
});

app.get('/coupon/:id', (req, res) => {
    db.collection('coupons').findOne({
        _id: ObjectId(req.params.id)
    }, (err, coupon) => {
        if (err) {
            console.log(err);
            res.sendStatus(500);
            return;
        }
        res.json(coupon);
    });
});

app.post('/coupon/:id', (req, res) => {
    const couponId = ObjectId(req.params.id);
    db.collection('coupons').findOne({
        _id: couponId
    }, (err, coupon) => {
        if (err) {
            console.log(err);
            res.sendStatus(500);
            return;
        }
        if (!coupon) {
            res.sendStatus(404);
            return;
        }
        db.collection('coupons').updateOne(
            { _id: couponId },
            { $set: req.body },
            (err) => {
                if (err) {
                    console.log(err);
                    res.sendStatus(500);
                    return;
                }
                res.sendStatus(200);
            }
        );
    });
});

app.post('/coupon/:id/redeem', (req, res) => {
    const couponId = ObjectId(req.params.id);
    db.collection('coupons').findOne({
        _id: couponId,
    }, (err, coupon) => {
        if (err) {
            console.log(err);
            res.sendStatus(500);
            return;
        }
        if (!coupon) {
            res.sendStatus(404);
            return;
        }
        db.collection('coupons').updateOne(
            { _id: couponId },
            { $set: { isRedeem: true } },
            (err) => {
                if (err) {
                    console.log(err);
                    res.sendStatus(500);
                    return;
                }
                res.sendStatus(200);
            }
        );
    });
});

app.get('/coupon/search/:code', (req, res) => {
    const couponCodeId = parseInt(req.params.code);
    db.collection('coupons').findOne({code:couponCodeId}, (err,coupon) =>{
        if (err) {
            console.log(err);
            res.sendStatus(500);
            return;
        }
        if(coupon === null){
            res.sendStatus(404);
            return;
        }
        res.json(coupon);
    });
});


app.delete('/coupon/:id', (req, res) => {
    db.collection('coupons').findOneAndDelete(
        {
            _id: ObjectId(req.params.id)
        }, (err, report) => {
            if (report.value === null) {
                res.sendStatus(404);
                return;
            }
            res.sendStatus(204);
        }
    );
});


app.listen(port, () => console.log(`Server listening on port ${port}!`));

