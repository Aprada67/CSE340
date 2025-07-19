const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}

/* ***************************
 *  Build detail view
 * ************************** */
invCont.buildDetailView = async function (req, res, next) {
  try {
    const invId = parseInt(req.params.invId)
    if (isNaN(invId)) {
      return res.status(400).render("inventory/noVehicle", {
        title: "Invalid Request",
        message: "The vehicle ID is not valid"
      })
    }

    const vehicle = await invModel.getVehicleById(invId)
    if (!vehicle) {
      return res.status(404).render("inventory/noVehicle", {
        title: "Vehicle not found",
        message: "Sorry! The vehicle you're looking for doesn't exist."
      })
    }

    const nav = await utilities.getNav()
    const vehicleHtml = utilities.buildVehicleDetailHtml(vehicle)

    res.render("./inventory/vehicle-detail", {
      title: `${vehicle.inv_make} ${vehicle.inv_model}`,
      nav,
      vehicleHtml
    })
  } catch (error) {
    next(error)
  }
}


module.exports = invCont