const express = require('express');
const { addCategory } = require('../models/categoria');
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

app.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        let category = await categoriaService.getCategory(id);
        
        if (category.length === 0) {
            res.status(404);
            throw new Error('Categoria no encontrada');
        };

        res.send(category[0]);

    } catch (e) {
        if (res.statusCode === 200) { res.status(413) }
        res.send({ 'mensaje': e.message });
    }
});

app.post('/', async (req, res) => {
    try {
        if (!req.body.nombre) {
            throw new Error('Faltan datos')
        }

        let nombre = req.body.nombre;

        if (nombre === null) {
            throw new Error('Faltan datos');
        }
        if (nombre === "") {
            throw new Error('Faltan datos');
        }
        if (nombre && typeof (nombre) !== 'string') {
            throw new Error('Error inesperado');
        }
        if (nombre.replace(/ /g, '') === '') {
            throw new Error('Faltan datos')
        }

        let newCategory = await categoriaService.addCategory(nombre)

        res.send(newCategory);

    }
    catch (e) {
        if (res.statusCode === 200) { res.status(413) }
        res.send({ 'mensaje': e.message });
    }

});


module.exports = app;