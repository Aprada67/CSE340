const utilities = require("../utilities/")
const baseController = {}

baseController.buildHome = async function(req, res){
  const nav = await utilities.getNav()
  res.render("index", {title: "Home", nav})
}

baseController.triggerError = function (req, res, next) {
  next({ status: 500, message: "Intentional server error! Something went wrong on purpose." })
}

module.exports = baseController