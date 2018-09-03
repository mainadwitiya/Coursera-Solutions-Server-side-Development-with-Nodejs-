const express = require('express');
const bodyParser = require('body-parser');
const authenticate = require('../authenticate');
const cors = require('./cors');

const Favorite = require('../models/favorite');

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
    .options(cors.corsWithOptions, (req, res) => {
        res.sendStatus(200);
    })
    .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOne({
                user: req.user._id
            })
            .populate('user')
            .populate('dishes')
            .then((favorite) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOne({
                user: req.user._id
            })
            .then((favorite) => {
                if (favorite !== null) {
                    console.log("Update Favorite");
                    for (var i = 0; i < req.body.length; i++) {
                        if (favorite.dishes.indexOf(req.body[i]._id) === -1)
                            favorite.dishes.push(req.body[i]._id);
                    }
                    favorite.save()
                        .then((favorite) => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favorite);
                        }, (err) => next(err))
                        .catch((err) => next(err));
                } else {
                    Favorite.create({
                            user: req.user
                        })
                        .then((favorite) => {
                            console.log('Favorite created', favorite);
                            for (var i = 0; i < req.body.length; i++) {
                                if (favorite.dishes.indexOf(req.body[i].Id) === -1)
                                    favorite.dishes.push(req.body[i]._id);
                            }
                            favorite.save()
                                .then((favorite) => {
                                    res.statusCode = 200;
                                    res.setHeader('Content-Type', 'application/json');
                                    res.json(favorite);
                                }, (err) => next(err))
                                .catch((err) => next(err));
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favorite);
                        }, (err) => next(err))
                        .catch((err) => next(err));
                }
            })
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end('PUT not supported on /favorite');
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOneAndRemove({
                user: req.user._id
            })
            .then((resp) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(resp);
            }, (err) => next(err))
            .catch((err) => next(err));
    });

favoriteRouter.route('/:dishId')
    .get(cors.cors, (req, res) => {
        res.statusCode = 403;
        res.end('GET not supported on /favorite/' + req.params.dishId);
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOne({
                user: req.user._id
            })
            .then((favorite) => {
                if (favorite !== null) {
                    console.log("Update Favorite");
                    favorite.dishes.push(req.params.dishId);
                    favorite.save()
                        .then((favorite) => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favorite);
                        }, (err) => next(err))
                        .catch((err) => next(err));
                } else {
                    Favorite.create({
                            user: req.user,
                            dishes: req.params.dishId
                        })
                        .then((favorite) => {
                            console.log('Favorite created', favorite);
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favorite);
                        }, (err) => next(err))
                        .catch((err) => next(err));
                }
            })
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end('PUT not supported on /favorite/' + req.params.dishId);
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOne({
                user: req.user._id
            })
            .then((favorite) => {
                if (favorite === null) {
                    var err = new Error('Favorite for user ' + req.user.username + ' not found.');
                    err.status = 404;
                    next(err);
                } else {
                    if (favorite.dishes.indexOf(req.params.dishId) === -1) {
                        var err = new Error('Favorite dish ' + req.params.dishId + ' not found.');
                        err.status = 404;
                        return next(err);
                    }
                    favorite.dishes.pull({
                        _id: req.params.dishId
                    });
                    favorite.save()
                        .then((favorite) => {
                            console.log('Favorite dish ' + req.params.dishId + ' deleted.');
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favorite);
                        }, (err) => next(err))
                        .catch((err) => next(err));
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    });

module.exports = favoriteRouter;
