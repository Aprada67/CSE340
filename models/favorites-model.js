const pool = require("../database/")

/* *****************************
*   Add favorite
* *************************** */
async function addFavorite(account_id, inv_id) {
    try {
        const sql = `
            INSERT INTO favorites (account_id, inv_id)
            VALUES ($1, $2)
            ON CONFLICT (account_id, inv_id) DO NOTHING
            RETURNING *;
        `
        const result = await pool.query(sql, [account_id, inv_id])
        return result.rows[0]
    } catch (error) {
        console.error("Add favorite error:", error)
        throw error
    }
}

/* *****************************
*   Remove favorite
* *************************** */
async function removeFavorite(account_id, inv_id) {
    try {
        const sql = `DELETE FROM favorites WHERE account_id = $1 AND inv_id = $2;`
        const result = await pool.query(sql, [account_id, inv_id])
        return result.rowCount > 0
    } catch (error) {
        console.error("Remove favorites error:", error)
        throw error
    }
}

/* *****************************
*   Confirm if is favorite
* *************************** */
async function isFavorite(account_id, inv_id) {
    try {
        const sql = `SELECT 1 FROM favorites WHERE account_id = $1 AND inv_id = $2;`
        const result = await pool.query(sql, [account_id, inv_id])
        return result.rowCount > 0
    } catch (error) {
        console.error("isFavorite error:", error)
        throw error
    }
}

/* *****************************
*   Get user favorites
* *************************** */
async function getUserFavorites(account_id) {
    try {
        const sql = `
            SELECT 
                i.inv_id,
                i.classification_id,
                i.inv_make,
                i.inv_model,
                i.inv_year,
                i.inv_price,
                i.inv_miles,
                i.inv_color,
                i.inv_image,
                i.inv_thumbnail,
                i.inv_description
            FROM favorites f
            JOIN inventory i ON f.inv_id = i.inv_id
            WHERE f.account_id = $1;
        `
        const result = await pool.query(sql, [account_id])
        return result.rows
    } catch (error) {
        console.error("Get user favorites error:", error)
        throw error
    }
}

module.exports = {
    addFavorite,
    removeFavorite,
    isFavorite,
    getUserFavorites
}