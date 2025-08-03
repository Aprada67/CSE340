// Required utilities module
const utilities = require("../utilities")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()
const { validationResult } = require('express-validator')

// *************************************
// Deliver login view
// *************************************
async function buildLogin(req, res, next) {
    try {
        let nav = await utilities.getNav()
        res.render("account/login", {
            title: "Login",
            nav,
            errors: null,
        });
    } catch (error) {
        next(error)
    }
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
    try {
        let nav = await utilities.getNav()
        res.render("account/register", {
            title: "Register",
            nav,
            errors: null,
        })
    } catch (error) {
        next(error)
    }
}

async function registerAccount(req, res) {
    let nav = await utilities.getNav()
    const { account_firstname, account_lastname, account_email, account_password } = req.body

    let hashedPassword
    try {
        hashedPassword = await bcrypt.hash(account_password, 10)
    } catch (error) {
        req.flash("notice", 'Sorry, there was an error processing the registration.')
        return res.status(500).render("account/register", {
            title: "Register",
            nav,
            errors: null,
            data: req.body
        })
    }

    try {
        const regResult = await accountModel.registerAccount(
            account_firstname,
            account_lastname,
            account_email,
            hashedPassword
        )

        if (regResult) {
            req.flash(
                "notice",
                `Congratulations, you're registered ${account_firstname}. Please log in.`
            )
            return res.status(201).render("account/login", {
                title: "Login",
                nav,
                errors: null,
            })
        } else {
            req.flash("notice", "Sorry, the registration failed.")
            return res.status(501).render("account/register", {
                title: "Register",
                nav,
                errors: null,
                data: req.body
            })
        }
    } catch (error) {
        next(error)
    }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res, next) {
    let nav = await utilities.getNav()
    const { account_email, account_password } = req.body

    try {
        const accountData = await accountModel.getAccountByEmail(account_email)

        if (!accountData) {
            req.flash("notice", "Please check your credentials and try again.")
            return res.status(400).render("account/login", {
                title: "Login",
                nav,
                errors: null,
                account_email,
            })
        }

        const match = await bcrypt.compare(account_password, accountData.account_password)

        if (match) {
            // Remove password from session data
            delete accountData.account_password

            req.session.loggedin = true
            req.session.firstname = accountData.account_firstname
            req.session.account_id = accountData.account_id
            req.session.account_type = accountData.account_type

            const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })

            const cookieOptions = { httpOnly: true, maxAge: 3600 * 1000 }
            if (process.env.NODE_ENV !== 'development') {
                cookieOptions.secure = true
            }
            res.cookie("jwt", accessToken, cookieOptions)

            return res.redirect("/account/")
        } else {
            req.flash("notice", "Please check your credentials and try again.")
            return res.status(400).render("account/login", {
                title: "Login",
                nav,
                errors: null,
                account_email,
            })
        }
    } catch (error) {
        console.error(error)
        next(error)
    }
}

/* ***************************
 *  Build account management view
 * ************************** */
async function buildAccount(req, res, next) {
    try {
        let nav = await utilities.getNav()
        res.render("account/account", {
            title: "Account Management",
            nav,
            errors: null,
            messages: req.flash(),
            firstname: req.session.firstname,
            account_type: req.session.account_type,
            account_id: req.session.account_id
        })
    } catch (error) {
        next(error)
    }
}

/* ***************************
 *  Build update account view
 * ************************** */
async function buildUpdateAccount(req, res, next) {
    try {
        let nav = await utilities.getNav()
        const accountId = req.params.accountId
        const accountData = await accountModel.getAccountById(accountId)

        if (!accountData) {
            req.flash("notice", "Account not found.")
            return res.redirect("/account/")
        }

        res.render("account/update-account", {
            title: "Update Account",
            nav,
            errors: null,
            account: accountData,
            messages: req.flash(),
        })
    } catch (error) {
        next(error)
    }
}

/* ***************************
 * Process account info update (name, email)
 * ************************** */
async function processUpdate(req, res, next) {
    const { account_id, account_firstname, account_lastname, account_email } = req.body;
    const errors = validationResult(req);

    let nav = await utilities.getNav()

    if (!errors.isEmpty()) {
        return res.status(400).render('account/update-account', {
            title: 'Update Account',
            nav,
            errors: errors.array(),
            account: { account_id, account_firstname, account_lastname, account_email },
            messages: req.flash()
        });
    }

    try {
        // Check if email is already used by another account
        const existingAccount = await accountModel.getAccountByEmail(account_email);
        if (existingAccount && existingAccount.account_id != account_id) {
            return res.status(400).render('account/update-account', {
                title: 'Update Account',
                nav,
                errors: [{ msg: 'Email already in use' }],
                account: { account_id, account_firstname, account_lastname, account_email },
                messages: req.flash()
            });
        }

        const result = await accountModel.updateAccount(account_id, account_firstname, account_lastname, account_email);

        if (result) {
            req.flash('success', 'Account information updated successfully.')
            return res.redirect('/account/')
        } else {
            req.flash('error', 'Failed to update account information.')
            return res.status(500).render('account/update-account', {
                title: 'Update Account',
                nav,
                errors: null,
                account: { account_id, account_firstname, account_lastname, account_email },
                messages: req.flash()
            })
        }
    } catch (error) {
        next(error)
    }
}

/* ***************************
 * Process password update
 * ************************** */
async function processPasswordChange(req, res, next) {
    const { account_id, new_password } = req.body;
    const errors = validationResult(req);

    let nav = await utilities.getNav()

    if (!errors.isEmpty()) {
        return res.status(400).render('account/update-account', {
            title: 'Update Account',
            nav,
            errors: errors.array(),
            account: { account_id },
            messages: req.flash()
        });
    }

    if (!new_password) {
        req.flash('error', 'Please enter a new password to change it.')
        return res.redirect(`/account/update/${account_id}`)
    }

    try {
        const hashedPassword = await bcrypt.hash(new_password, 10);
        const result = await accountModel.updatePassword(account_id, hashedPassword);

        if (result) {
            req.flash('success', 'Password changed successfully.')
            return res.redirect('/account/')
        } else {
            req.flash('error', 'Failed to change password.')
            const accountData = await accountModel.getAccountById(account_id);
            return res.status(500).render('account/update-account', {
                title: 'Update Account',
                nav,
                errors: null,
                account: accountData,
                messages: req.flash()
            })
        }
    } catch (error) {
        next(error)
    }
}

module.exports = {
    buildLogin,
    buildRegister,
    registerAccount,
    accountLogin,
    buildAccount,
    buildUpdateAccount,
    processUpdate,
    processPasswordChange,
}