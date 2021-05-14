const joi = require('joi');

const registartionSchema = joi.object({
    userName: joi.string()
        .alphanum()
        .min(3)
        .max(20)
        .required(),
    password: joi.string()
        .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
        //.max(20)
        .min(8)
        .required()
        .messages({
            'string.pattern.base': "password did not satisfay pattern"
        }),
    email: joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'in'] } })
        .required(),
    name: joi.string()
        //.pattern(new RegExp(`^[a-zA-Z]+$`))
        .min(3)
        .max(50)
        .required(),
    userType: joi.string()
        .valid('vendor', 'customer'),
});

const loginSchema = joi.object({
    userName: joi.alternatives().conditional('email', {
        is: '',
        then: joi.string().alphanum().min(3).max(20).required(),
        otherwise: joi.string().allow('')
    }),
    email: joi.alternatives().conditional('userName', {
        is: '',
        then: joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'in'] } }).required(),
        otherwise: joi.string().allow('')
    }),
    password: joi.string()
        .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
        //.max(20)
        .min(8)
        .required()
        .messages({
            'string.pattern.base': "password did not satisfay pattern"
        }),
});

function registrationValidation(req, res, next) {
    const { error, value } = registartionSchema.validate(req.body);
    if (error != null) {
        const tempError = error.details[0].message.replace(/[\"]/g, "");
        res.status(422).send({ message: tempError });
    } else { next(); }
}

function loginValidation(req, res, next) {
    const { error, value } = loginSchema.validate(req.body);
    if (error != null) {
        const tempError = error.details[0].message.replace(/[\"]/g, "");
        res.status(422).send({ message: tempError });
    } else { next(); }
}

function logoutValidation(req, res, next) {
    const { error, value } = logoutSchema.validate(req.body);
    if (error != null) {
        const tempError = error.details[0].message.replace(/[\"]/g, "");
        res.status(422).send({ message: tempError });
    } else { next(); }
}

module.exports = {
    registrationValidation,
    loginValidation,
}