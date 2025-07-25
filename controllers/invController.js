const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")
const { validationResult } = require('express-validator')

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

/* ***************************
 *  Build Management view
 * ************************** */
invCont.buildManagementView = async function (req, res, next) {
  try {
    let nav = await utilities.getNav()
    const message = req.flash("notice")

    res.render("inventory/management", {
      title: "Inventory Management",
      nav,
      message,
      errors: null,
    })
  } catch (error) {
    next(error)
  }
}

/* ***************************
 *  Build Add Classification View
 * ************************** */
invCont.buildAddClassificationView = async function (req, res, next) {
  try {
    let nav = await utilities.getNav()
    let message = req.flash("notice") || ''

    res.render("inventory/add-classification", {
      title: "Add New Classification",
      nav,
      errors: null,
      message,
    })
  } catch (error) {
    next(error)
  }
}

/* ***************************
 *  Handle Add Classification POST
 * ************************** */
invCont.addClassification = async function (req, res, next) {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      let nav = await utilities.getNav()
      return res.status(400).render("inventory/add-classification", {
        title: "Add New Classification",
        nav,
        errors: errors.array(),
      })
    }

    const classificationName = req.body.classification_name.trim()

    const insertResult = await invModel.addClassification(classificationName)
    if (insertResult) {
      let nav = await utilities.getNav()
      req.flash("notice", `Classification "${classificationName}" added successfully.`)
      return res.status(201).render("inventory/management", {
        title: "Inventory Management",
        nav,
        message: req.flash("notice"),
        errors: null,
      })
    } else {
      throw new Error("Failed to add classification.")
    }
  } catch (error) {
    next(error)
  }
}

/* ***************************
 *  Build Add Inventory view
 * ************************** */
invCont.addInventory = async function (req, res, next) {
  try {
    const nav = await utilities.getNav()
    const classificationList = await utilities.buildClassificationList(req.body.classification_id)

    // Validate data with express-validator
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).render("inventory/add-inventory", {
        title: "Add New Inventory",
        nav,
        classificationList,
        errors: errors.array(),
        message: null,
        data: req.body
      })
    }

    // Call to model to insert into database
    const { classification_id, inv_make, inv_model, inv_year, inv_price, inv_miles, inv_color, inv_image, inv_thumbnail, inv_description } = req.body
    const result = await invModel.addInventoryItem({
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_price,
      inv_miles,
      inv_color,
      inv_image: inv_image || '/images/no-image-available.png',
      inv_thumbnail: inv_thumbnail || '/images/no-image-available.png',
      inv_description,
    })

    if (result) {
      req.flash('notice', `Success: ${inv_make} ${inv_model} added.`)
      return res.redirect('/inv/')
    } else {
      return res.status(500).render("inventory/add-inventory", {
        title: "Add New Inventory",
        nav,
        classificationList,
        errors: [{ msg: "Failed to add inventory. Please try again." }],
        message: null,
        data: req.body
      })
    }
  } catch (error) {
    next(error)
  }
}

/* ***************************
 *  Build Add Inventory View (GET)
 * ************************** */
invCont.buildAddInventoryView = async function (req, res, next) {
  try {
    const nav = await utilities.getNav()
    const classificationList = await utilities.buildClassificationList()

    res.render("inventory/add-inventory", {
      title: "Add New Inventory",
      nav,
      classificationList,
      errors: null,
      message: null,
      data: {}
    })
  } catch (error) {
    next(error)
  }
}



module.exports = invCont