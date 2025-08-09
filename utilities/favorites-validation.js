const { body } = require("express-validator")
const favValidate = {}

favValidate.addFavoritesRules = () => {
    return [
        body("inv_id")
        .isInt({ min: 1 })
        .withMessage("Invalid vehicle ID"),
    ]
}

module.exports = favValidate