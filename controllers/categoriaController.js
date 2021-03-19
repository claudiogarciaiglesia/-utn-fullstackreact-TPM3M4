const categoriaService = require('../services/categoriaService');

const listCategories = async () => {
    let list = await categoriaService.listCategories();
    return list;
}

module.exports = { listCategories }