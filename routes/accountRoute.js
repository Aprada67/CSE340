// Needed Resources
const express = require("express")
const router = new express.Router()
const utilities = require("../utilities")
const accountController = require("../controllers/accountController")
const regValidate = require('../utilities/account-validation')
const { body } = require('express-validator');

// Route to build login view
router.get("/login", utilities.handleErrors(accountController.buildLogin))

// Route to build register view
router.get("/register", utilities.handleErrors(accountController.buildRegister))

// Deliver account management view
router.get(
  "/", 
  utilities.checkJWTToken,
  utilities.checkLogin, 
  utilities.handleErrors(accountController.buildAccount)
);

// Registration route to handle form POST
router.post(
  "/register",
  regValidate.registationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)

// Process the login request
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
)

router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err)
    }
    res.clearCookie("jwt")
    res.redirect("/")
  })
})

// Update account GET route (show update form)
router.get(
  "/update/:accountId",
  utilities.checkJWTToken,
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildUpdateAccount)
)

// Validation rules for updating account info
const updateValidation = [
  body('account_firstname').trim().isLength({ min: 2 }).matches(/^[A-Za-zÀ-ÿ\s\-]+$/).withMessage('Invalid first name'),
  body('account_lastname').trim().isLength({ min: 2 }).matches(/^[A-Za-zÀ-ÿ\s\-]+$/).withMessage('Invalid last name'),
  body('account_email').isEmail().withMessage('Invalid email'),
];

// Validation rules for changing password
const passwordValidation = [
  body('new_password').optional({ checkFalsy: true })
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter')
    .matches(/\d/).withMessage('Password must contain a number')
    .matches(/[\W_]/).withMessage('Password must contain a special character'),
];

// POST route to process account info update
router.post(
  "/update",
  utilities.checkJWTToken,
  utilities.checkLogin,
  updateValidation,
  utilities.handleErrors(accountController.processUpdate)
)

// POST route to process password change
router.post(
  "/update-password",
  utilities.checkJWTToken,
  utilities.checkLogin,
  passwordValidation,
  utilities.handleErrors(accountController.processPasswordChange)
)

// Export the router
module.exports = router