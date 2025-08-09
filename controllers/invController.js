const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")
const { validationResult } = require('express-validator')
const favoritesModel = require("../models/favorites-model")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  try {
    const classification_id = req.params.classificationId
    const data = await invModel.getInventoryByClassificationId(classification_id)

    if (!data || data.length === 0) {
      // If no vehicles found, show friendly message
      let nav = await utilities.getNav()
      return res.render("./inventory/classification", {
        title: "No Vehicles Found",
        nav,
        grid: null,
        message: "No vehicles available for this classification."
      })
    }

    const grid = await utilities.buildClassificationGrid(data)
    let nav = await utilities.getNav()
    const className = data[0].classification_name

    res.render("./inventory/classification", {
      title: className + " vehicles",
      nav,
      grid,
      message: null
    })
  } catch (error) {
    next(error)
  }
}

/* ***************************
 *  Build detail view for single vehicle
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
    const userId = res.locals.accountData ? res.locals.accountData.account_id : null
    const isFavorite = userId ? await favoritesModel.isFavorite(userId, invId) : false
    const vehicleHtml = utilities.buildVehicleDetailHtml(vehicle, isFavorite)

    res.render("./inventory/vehicle-detail", {
      title: `${vehicle.inv_make} ${vehicle.inv_model}`,
      nav,
      vehicleHtml,
      isFavorite
    })
  } catch (error) {
    next(error)
  }
}

/* ***************************
 *  Build inventory management view
 * ************************** */
invCont.buildManagementView = async function (req, res, next) {
  try {
    let nav = await utilities.getNav()
    const message = req.flash("notice")
    const classificationList = await utilities.buildClassificationList()

    res.render("inventory/management", {
      title: "Inventory Management",
      nav,
      message,
      errors: null,
      classificationList,
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
        classificationList: await utilities.buildClassificationList()
      })
    } else {
      throw new Error("Failed to add classification.")
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

/* ***************************
 *  Handle Add Inventory POST
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
    const {
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_price,
      inv_miles,
      inv_color,
      inv_image,
      inv_thumbnail,
      inv_description
    } = req.body

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
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0] && invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.editInventoryView = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.params.invId)
    const nav = await utilities.getNav()
    const itemData = await invModel.getVehicleById(inv_id)
    const classificationList = await utilities.buildClassificationList(itemData.classification_id)
    const itemName = `${itemData.inv_make} ${itemData.inv_model}`

    res.render("./inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationList,
      errors: null,
      message: null,
      data: itemData
    })
  } catch (error) {
    next(error)
  }
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  try {
    const nav = await utilities.getNav()
    const {
      inv_id,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      classification_id,
    } = req.body

    // Call model to update inventory
    const updateResult = await invModel.updateInventory(
      parseInt(inv_id),
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      classification_id
    )

    if (updateResult) {
      const itemName = updateResult.inv_make + " " + updateResult.inv_model
      req.flash("notice", `The ${itemName} was successfully updated.`)
      return res.redirect("/inv/")
    } else {
      // If update fails, rebuild classification list and render edit form with errors
      const classificationList = await utilities.buildClassificationList(classification_id)
      const itemName = `${inv_make} ${inv_model}`
      req.flash("notice", "Sorry, the update failed.")
      return res.status(501).render("inventory/edit-inventory", {
        title: "Edit " + itemName,
        nav,
        classificationList,
        errors: null,
        message: null,
        data: req.body
      })
    }
  } catch (error) {
    next(error)
  }
}

/* ***************************
 *  Show Delete Confirmation View
 * ************************** */
invCont.showDeleteConfirm = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.params.inv_id)
    if (isNaN(inv_id)) {
      return res.status(400).render("inventory/noVehicle", {
        title: "Invalid Request",
        message: "The vehicle ID is not valid"
      })
    }
    const nav = await utilities.getNav()
    const itemData = await invModel.getVehicleById(inv_id)
    if (!itemData) {
      return res.status(404).render("inventory/noVehicle", {
        title: "Vehicle not found",
        message: "Sorry! The vehicle you're trying to delete doesn't exist."
      })
    }
    const itemName = `${itemData.inv_make} ${itemData.inv_model}`

    res.render("./inventory/delete-confirm", {
      title: "Delete " + itemName,
      nav,
      errors: null,
      message: null,
      data: itemData
    })
  } catch (error) {
    next(error)
  }
}

/* ***************************
 *  Delete Inventory Item
 * ************************** */
invCont.deleteItem = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.params.inv_id)
    if (isNaN(inv_id)) {
      req.flash("notice", "Invalid vehicle ID.")
      return res.redirect("/inv/")
    }
    const deleteResult = await invModel.deleteInventoryItem(inv_id)
    if (deleteResult) {
      req.flash("notice", "Vehicle successfully deleted.")
    } else {
      req.flash("notice", "Failed to delete vehicle. Please try again.")
    }
    return res.redirect("/inv/")
  } catch (error) {
    next(error)
  }
}

module.exports = invCont