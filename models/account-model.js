const pool = require("../database/")

/* *****************************
*   Register new account
* *************************** */
async function registerAccount(account_firstname, account_lastname, account_email, account_password) {
  try {
    const sql = `
      INSERT INTO account 
      (account_firstname, account_lastname, account_email, account_password, account_type) 
      VALUES ($1, $2, $3, $4, 'Client') 
      RETURNING *;
    `
    const result = await pool.query(sql, [account_firstname, account_lastname, account_email, account_password])
    return result.rows[0]
  } catch (error) {
    return error.message
  }
}

/* **********************
 *   Check for existing email
 * ********************* */
async function checkExistingEmail(account_email) {
  try {
    const sql = "SELECT * FROM account WHERE account_email = $1"
    const result = await pool.query(sql, [account_email])
    return result.rowCount
  } catch (error) {
    return error.message
  }
}

/* *****************************
* Return account data using email address
* ***************************** */
async function getAccountByEmail(account_email) {
  try {
    const sql = `
      SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password 
      FROM account 
      WHERE account_email = $1
    `
    const result = await pool.query(sql, [account_email])
    return result.rows[0]
  } catch (error) {
    return new Error("No matching email found")
  }
}

/* *****************************
* Return account data using account ID
* ***************************** */
async function getAccountById(account_id) {
  try {
    const sql = `
      SELECT account_id, account_firstname, account_lastname, account_email, account_type 
      FROM account 
      WHERE account_id = $1
    `
    const result = await pool.query(sql, [account_id])
    return result.rows[0]
  } catch (error) {
    return new Error("No matching account found")
  }
}

/* *****************************
* Update account information (first_name, last_name, email)
* ***************************** */
async function updateAccountInfo(account_id, account_firstname, account_lastname, account_email) {
  try {
    const sql = `
      UPDATE account 
      SET account_firstname = $1, account_lastname = $2, account_email = $3
      WHERE account_id = $4
      RETURNING *;
    `
    const result = await pool.query(sql, [account_firstname, account_lastname, account_email, account_id])
    return result.rowCount > 0
  } catch (error) {
    return false
  }
}

/* *****************************
* Update the hashed password
* ***************************** */
async function updateAccountPassword(account_id, hashedPassword) {
  try {
    const sql = `
      UPDATE account 
      SET account_password = $1 
      WHERE account_id = $2
      RETURNING *;
    `
    const result = await pool.query(sql, [hashedPassword, account_id])
    return result.rowCount > 0
  } catch (error) {
    return false
  }
}

module.exports = {
  registerAccount,
  checkExistingEmail,
  getAccountByEmail,
  getAccountById,
  updateAccountInfo,
  updateAccountPassword
}