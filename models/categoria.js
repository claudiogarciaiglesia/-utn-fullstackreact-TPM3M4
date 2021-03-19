const conexion = require('../db');

const getAllCategories = async () => {
    let categoryList = await conexion.qy('SELECT * FROM categoria');
    return categoryList;
}


module.exports = { getAllCategories }