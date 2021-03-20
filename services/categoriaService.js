const categoriaModel = require('../models/categoria');

const listCategories = () => {
    return categoriaModel.listCategories();
}

const getCategory = (id) => {
    return categoriaModel.getCategory();

}

module.exports = { listCategories, getCategory }