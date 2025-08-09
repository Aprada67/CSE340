const express = require("express")
const router = new express.Router();
const favoritesController = require("../controllers/favoritesController")
const { body } = require("express-validator")
const Util = require("../utilities")
const favoritesValidate = require("../utilities/favorites-validation")

// Route to add/remove favorites with validation
router.post("/toggle", Util.checkLogin, Util.handleErrors(favoritesController.toggleFavorite))

// Route to show favorites view
router.get(
    "/",
    Util.checkJWTToken,
    Util.checkLogin,
    favoritesController.buildFavoritesView
)

module.exports = router