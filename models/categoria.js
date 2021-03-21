const conexion = require('../db');

const listCategories = async () => {
    let categoryList = await conexion.qy('SELECT * FROM categoria');
    return categoryList;
}

const getCategory = async (id) => {
    let category = await conexion.qy('SELECT * FROM categoria WHERE id = ?', id);
    return category;
}

const getCategoryByName = async (nombre) => {
    let category = await conexion.qy('SELECT * FROM categoria WHERE nombre = ?', nombre);
    return category;
}

const addCategory = async (nombre) => {
    let result = await conexion.qy('INSERT INTO categoria (nombre) VALUES (?)', nombre)
    return result.insertId;
}

const deleteCategory = async (id) => {
    let result = await conexion.qy('DELETE FROM categoria WHERE id = ?', id);
    return result;
}



module.exports = {
    listCategories,
    getCategory,
    getCategoryByName,
    addCategory,
    deleteCategory
}