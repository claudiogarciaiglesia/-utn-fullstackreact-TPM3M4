const express = require('express');
const app = express.Router();

const categoriaService = require('../services/categoriaService');

app.get('/', async (req, res) => {
    try {
        let list = await categoriaService.listCategories();
        
        if (list.length === 0) {
            res.status(404).send(list);
            return;
        }

        if (list.length > 1) {
            res.send(list);
        } else {
            res.send(list[0]);
        };

    } catch (e) {
        if (res.statusCode === 200) { res.status(413) }
        res.send({ 'mensaje': e.message });
    }
});

const getCategory = () => {

}


module.exports = app;