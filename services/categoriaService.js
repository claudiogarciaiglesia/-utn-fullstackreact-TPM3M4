const categoriaModel = require('../models/categoria');

const listCategories = async () => {
    let categoryList = await categoriaModel.getAllCategories();
    return categoryList;
}

module.exports = { listCategories }