const categoriaModel = require('../models/categoria');

const listCategories = async () => {
    return categoriaModel.listCategories();
}

const getCategory = async (id) => {
    let cateogry = await categoriaModel.getCategory();
    if (category.lenght > 0) {
        return category
    } else {
        return []
    }
}

module.exports = { listCategories, getCategory }