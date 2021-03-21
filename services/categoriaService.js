const categoriaModel = require('../models/categoria');

const listCategories = () => {
    return categoriaModel.listCategories();
}

const getCategory = async (id) => {
    return categoriaModel.getCategory(id);
}

const addCategory = async (nombre) => {
    nombre = nombre.toUpperCase();

    let qRes = await categoriaModel.getCategoryByName(nombre);

    if (qRes.length > 0) {
        throw new Error('Ese nombre de categoria ya existe');
    }

    let newId = await categoriaModel.addCategory(nombre);
    let newCategory = await categoriaModel.getCategory(newId);

    return newCategory;
}

module.exports = { listCategories, getCategory, addCategory }