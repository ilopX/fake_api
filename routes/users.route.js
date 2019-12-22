const auth = require("../middleware/auth");
const bcrypt = require("bcrypt");
const { User, validate, validateResetPassword, tokenGenerator } = require("../models/user.model.js");
const express = require("express");
const router = express.Router();
const JsonService = require('../services/db');

router.get("/current", auth, async (req, res) => {
    let inDbUser = await JsonService.find((db) => {
        return db.users.find((user) => {
            return user._id == req.user._id;
        })
    });
    res.jsonp({
        _id: inDbUser._id,
        name: inDbUser.name,
        email: inDbUser.email
    });
});

router.post("/", async (req, res) => {
    // validate the request body first
    const { error } = validate(req.body);
    if ( error ) return res.status(400).jsonp(error.details[0].message);

    const {body} = req;

    let inDbUser = await JsonService.find((db) => {
        return db.users.find((user) => {
            return user.email == body.email;
        })
    });

    if (inDbUser) return res.status(400).jsonp('User already exists');

    let user = new User({
        name: body.name,
        password: body.password,
        email: body.email
    });

    user.password = await bcrypt.hash(user.password, 10);

    await JsonService.save((db) => db.users.push(user) );

    const token = user.generateAuthToken();

    res
        .header("x-auth-token", token)
        .status(200)
        .send({
            _id: user._id,
            name: user.name,
            email: user.email
        });

});

router.post("/reset_password", async (req, res) => {
    const { body } = req;

    let { error } = validateResetPassword(body.password, body.confirmationPassword, body.email);

    if ( error ) return res.status(400).jsonp(error.details[0].message);

    let inDbUser = await JsonService.find((db) => {
        return db.users.find((user) => {
            return user.email == body.email;
        })
    });

    if (typeof inDbUser == 'undefined' ) return res.status(400).jsonp('User does not exists');

    let newPass = await bcrypt.hash(body.password, 10);

    await JsonService.save((db) => db.users.forEach((user) => {
        if (user._id == inDbUser._id) {
            return user.password = newPass
        }
    }));

    const token = tokenGenerator(inDbUser._id);

    res
        .header("x-auth-token", token)
        .status(200)
        .send({
            _id: inDbUser._id,
            name: inDbUser.name,
            email: inDbUser.email
        });

});

router.post("/login", async (req, res) => {
    const {email, password} = req.body;

    if ( !email || !password ) return res.status(400).jsonp('Empty password or email');

    let inDbUser = await JsonService.find((db) => {
        return db.users.find((user) => {
            return user.email == email;
        })
    });

    if (typeof inDbUser == 'undefined' ) return res.status(400).jsonp('User does not exists');

    let isPasswordCorrect = await bcrypt.compare(password, inDbUser.password);

    if (!isPasswordCorrect) {
        return res.status(400).jsonp('Wrong password');
    }

    const token = tokenGenerator(inDbUser._id);

    res
        .header("x-auth-token", token)
        .status(200)
        .send({
            _id: inDbUser._id,
            name: inDbUser.name,
            email: inDbUser.email
        });

});


module.exports = router;