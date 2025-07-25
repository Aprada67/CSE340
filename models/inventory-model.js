const pool = require("../database/")

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications() {
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id
      WHERE i.classification_id = $1`,
      [classification_id]
    )
    return data.rows
  } catch (error) {
    console.error("getclassificationsbyid error " + error)
  }
}

/* ***************************
 *  Get a vehicle by its inventory id
 * ************************** */
async function getVehicleById(inv_id) {
  try {
    const data = await pool.query(
      `SELECT i.*, c.classification_name
         FROM inventory AS i
         JOIN classification AS c
           ON i.classification_id = c.classification_id
        WHERE inv_id = $1`,
      [inv_id]
    )
    return data.rows[0]
  } catch (error) {
    console.error("getVehicleById error:", error)
    throw error
  }
}

/* ***************************
 *  Add a new classification
 * ************************** */
async function addClassification(classification_name) {
  try {
    const sql = "INSERT INTO classification (classification_name) VALUES ($1) RETURNING *"
    const result = await pool.query(sql, [classification_name])
    return result.rows[0]
  } catch (error) {
    console.error("addClassification error:", error)
    throw error
  }
}

async function addInventoryItem(item) {
  try {
    const sql = `INSERT INTO inventory 
      (classification_id, inv_make, inv_model, inv_year, inv_price, inv_miles, inv_color, inv_image, inv_thumbnail, inv_description)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`

    const values = [
      item.classification_id,
      item.inv_make,
      item.inv_model,
      item.inv_year,
      item.inv_price,
      item.inv_miles,
      item.inv_color,
      item.inv_image,
      item.inv_thumbnail,
      item.inv_description,
    ]

    const result = await pool.query(sql, values)
    return result.rowCount > 0
  } catch (error) {
    console.error("addInventoryItem error: ", error)
    throw error
  }
}


module.exports = {
  getClassifications,
  getInventoryByClassificationId,
  getVehicleById,
  addClassification,
  addInventoryItem
}