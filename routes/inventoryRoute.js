// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const { body } = require("express-validator")
const utilities = require("../utilities/utilities")
const {
  newInventoryRules,
  checkUpdateData,
} = require("../utilities/inventory-validation");
const index = require("../utilities/index")


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
// router.get("/", invController.buildManagementView)

// Route to build add classification view
// router.get("/add-classification", invController.buildAddClassificationView)

// Route to show the edition form of a vehicle by its invId
router.get(
  "/edit/:invId",
  utilities.handleErrors(invController.editInventoryView)
);

// POST route to add classification
router.post(
  "/add-classification",
  body("classification_name")
    .trim()
    .matches(/^[A-Za-z0-9]+$/)
    .withMessage("Classification name must not contain spaces or special characters."),
  invController.addClassification
)

router.post(
  "/update/",
  newInventoryRules(),
  checkUpdateData,
  utilities.handleErrors(invController.updateInventory)
);

// GET route to build add inventory view
router.get("/add-inventory", invController.buildAddInventoryView)

// POST route to add Inventory with validation
router.post("/add-inventory", validateInventory, invController.addInventory)

// Route to manage the inventary update
router.post("/update/", invController.updateInventory)

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId)

// Route to build detail view
router.get("/detail/:invId", invController.buildDetailView)

// New route to return inventory JSON by classification
router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON));

// GET route to show delete confirmation view
router.get('/delete/:inv_id', async (req, res) => {
  try {
    await invController.showDeleteConfirm(req, res)
  } catch (error) {
    console.error('Error showing delete confirmation:', error)
    res.status(500).send('Internal server error while loading delete confirmation.')
  }
})

// POST route to perform delete action
router.post('/delete/:inv_id', async (req, res) => {
  try {
    await invController.deleteItem(req, res)
  } catch (error) {
    console.error('Error deleting item:', error)
    res.status(500).send('Internal server error while deleting item.')
  }
})

// Protected route (admin view)
router.get("/", index.checkEmployeeOrAdmin, invController.buildManagementView)

// Protected route to add classification
router.get("/add-classification", index.checkEmployeeOrAdmin, invController.buildAddClassificationView)

// Protected route to edit inventary
router.get("/edit/:invId", index.checkEmployeeOrAdmin, invController.editInventoryView)


module.exports = router;