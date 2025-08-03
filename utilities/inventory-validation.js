const { body, validationResult } = require("express-validator");

/**
 * Validation rules for adding new inventory
 */
function newInventoryRules() {
  return [
    body("inv_make")
      .trim()
      .notEmpty().withMessage("The 'Make' field is required.")
      .isLength({ min: 2 }).withMessage("Make must be at least 2 characters."),
    body("inv_model")
      .trim()
      .notEmpty().withMessage("The 'Model' field is required."),
    body("inv_year")
      .trim()
      .notEmpty().withMessage("The 'Year' field is required.")
      .isInt({ min: 1900, max: new Date().getFullYear() + 1 }).withMessage("Invalid year."),
    body("inv_description")
      .trim()
      .notEmpty().withMessage("Description is required."),
    body("inv_price")
      .trim()
      .notEmpty().withMessage("Price is required.")
      .isFloat({ min: 0 }).withMessage("Price must be a positive number."),
    body("inv_miles")
      .trim()
      .notEmpty().withMessage("Mileage is required.")
      .isFloat({ min: 0 }).withMessage("Mileage must be a positive number."),
    body("classification_id")
      .trim()
      .notEmpty().withMessage("Classification is required.")
      .isInt().withMessage("Classification must be a valid number."),
  ];
}

/**
 * Validate data for adding new inventory
 */
function checkInventoryData(req, res, next) {
  const {
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_price,
    inv_miles,
    classification_id,
  } = req.body;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).render("inventory/add", {
      title: "Add Inventory",
      errors: errors.array(),
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_price,
      inv_miles,
      classification_id,
    });
  }

  next();
}

/**
 * Validate data for updating inventory
 * Redirects to the edit view if there are errors.
 */
function checkUpdateData(req, res, next) {
  const {
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_price,
    inv_miles,
    classification_id,
    inv_id,
  } = req.body;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).render("inventory/edit", {
      title: "Edit Inventory",
      errors: errors.array(),
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_price,
      inv_miles,
      classification_id,
      inv_id,
    });
  }

  next();
}

module.exports = {
  newInventoryRules,
  checkInventoryData,
  checkUpdateData,
};