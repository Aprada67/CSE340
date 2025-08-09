const favoritesModel = require("../models/favorites-model")
const utilities = require("../utilities/")

async function toggleFavorite(req, res, next) {
    try {
        const account_id = res.locals.accountData.account_id
        const inv_id = parseInt(req.body.inv_id)

        const alreadyFav = await favoritesModel.isFavorite(account_id, inv_id)

        if (alreadyFav) {
            await favoritesModel.removeFavorite(account_id, inv_id)
            req.flash("notice", "Vehicle removed from favorites")
            res.redirect("/favorites")
        } else {
            await favoritesModel.addFavorite(account_id, inv_id)
            req.flash("notice", "Vehicle added to favorites")
            res.redirect(`/inv/detail/${inv_id}`)
        }
        
    } catch (error) {
        req.flash("error", "Error procesing favorites.");
        res.redirect(`/inv/detail/${req.body.inv_id || ""}`);
        next(error)
    }
}


async function buildFavoritesView(req, res, next) {
    try {
        const account_id = res.locals.accountData.account_id
        const favorites = await favoritesModel.getUserFavorites(account_id)
        const nav = await utilities.getNav()

        const grid = await utilities.buildFavoritesGrid(favorites)

        res.render("favorites/index", {
            title: "My Favorites",
            nav,
            grid
        })
    } catch (error) {
        req.flash("error", "Error loading favorites")
        next(error)
    }
}

module.exports = {
    toggleFavorite,
    buildFavoritesView
}