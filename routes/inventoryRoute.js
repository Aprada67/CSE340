// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const { body } = require("express-validator");

const validateInventory = [
  body('classification_id').notEmpty().withMessage('Classification is required'),
  body('inv_make').trim().notEmpty().withMessage('Make is required'),
  body('inv_model').trim().notEmpty().withMessage('Model is required'),
  body('inv_year').isInt({ min: 1900, max: new Date().getFullYear() }).withMessage('Enter a valid year'),
  body('inv_price').isFloat({ min: 0 }).withMessage('Enter a valid price'),
  body('inv_miles').isInt({ min: 0 }).withMessage('Enter valid miles'),
  body('inv_color').trim().notEmpty().withMessage('Color is required'),
  body('inv_description').trim().notEmpty().withMessage('Description is required'),

]


// Route to build management view
router.get("/", invController.buildManagementView)

// Route to build add classification view
router.get("/add-classification", invController.buildAddClassificationView)

// POST route to add classification
router.post(
  "/add-classification",
  body("classification_name")
    .trim()
    .matches(/^[A-Za-z0-9]+$/)
    .withMessage("Classification name must not contain spaces or special characters."),
  invController.addClassification
)

// GET route to build add inventory view
router.get("/add-inventory", invController.buildAddInventoryView)

// POST route to add Inventory with validation
router.post("/add-inventory", validateInventory, invController.addInventory)

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId)

// Route to build detail view
router.get("/detail/:invId", invController.buildDetailView)

module.exports = router;