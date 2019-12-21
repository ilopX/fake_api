const config = require('config');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const mongoose = require('mongoose');

//simple schema
const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 50
    },
    email: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 255,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 255
    },
});

const tokenGenerator =  function(id) {
    const token = jwt.sign(
        {
            _id: id,
        }, config.get('myprivatekey')
    ); //get the private key from the config file -> environment variable
    return token;
};
//custom method to generate authToken
UserSchema.methods.generateAuthToken = function() {
    return tokenGenerator(this._id);
};

const User = mongoose.model('User', UserSchema);

//function to validate user
function validateUser(user) {
    const schema = {
        name: Joi.string().min(3).max(50).required(),
        email: Joi.string().min(5).max(255).required().email(),
        password: Joi.string().min(8).max(255).required()
    };

    return Joi.validate(user, schema);
}

function validateResetPassword(password, passwordConfirmation, email) {
    let objectToValidate = {
        password: password,
        confirmationPassword: passwordConfirmation,
        email: email
    };

    const schema = (pass) =>  {
        return {
            password: Joi.string().min(8).max(255).required(),
            confirmationPassword: Joi.string().min(8).max(255).equal(pass).required(),
            email: Joi.string().min(5).max(255).required().email()
        }
    };

    return Joi.validate(objectToValidate, schema(password));
}

exports.User = User;
exports.validate = validateUser;
exports.validateResetPassword = validateResetPassword;
exports.tokenGenerator = tokenGenerator;
