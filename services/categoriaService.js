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
        return [];
    }

    let newId = await categoriaModel.addCategory(nombre);
    let newCategory = await categoriaModel.getCategory(newId);

    return newCategory;
}

const deleteCategory = async (id) => {

    // FALTA VERIFICAR SI LA CATEGORIA ESTA EN USO

    let categoryToBeDeleted = await categoriaModel.getCategory(id);

    if (categoryToBeDeleted.length === 0) {
        return [];
    }

    let qRes = await categoriaModel.deleteCategory(id);

    return true;

}

module.exports = { listCategories, getCategory, addCategory, deleteCategory }