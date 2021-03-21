const conexion = require('../db');

const listBooks = async () => {
    let bookList = await conexion.qy('SELECT * FROM libro');
    return bookList;
}

const getBook = async (id) => {
    let book = await conexion.qy('SELECT * FROM libro WHERE id = ?', id);
    return book;
}

const getBookByName = async (nombre) => {
    let book = await conexion.qy('SELECT * FROM libro WHERE nombre = ?', nombre);
    return book;
}

const addBook = async (nombre, descripcion, categoria_id, persona_id) => {
    let result = await conexion.qy('INSERT INTO libro (nombre, descripcion, categoria_id, persona_id) VALUES (?, ?, ?, ?)', [nombre, descripcion, categoria_id, persona_id]);
    return result.insertId;
}

const deleteBook = async (id) => {
    let result = await conexion.qy('DELETE FROM libro WHERE id = ?', id);
    return result;
}

const updateBookDescription = async (id, descripcion) => {
    let result = await conexion.qy('UPDATE libro SET descripcion = ? WHERE id = ?', [descripcion, id]);
    return result;
}

const whoHasThisBook = async (id) => {
    let result = await conexion.qy('SELECT * FROM libro WHERE id = ? AND persona_id IS NOT NULL', id);
    return result;
}

const returnBook = async (id) => {
    let result = await conexion.qy('UPDATE libro SET persona_id = NULL WHERE id = ?', id);
    return result;
}

const lendBook = async (id, persona_id) => {
    let result = await conexion.qy('UPDATE libro SET persona_id = ? WHERE id = ?', id, persona_id);
    return result;
}




module.exports = {
    listBooks,
    getBook,
    getBookByName,
    addBook,
    deleteBook,
    updateBookDescription,
    isThisBookBorrowed,
    whoHasThisBook,
    returnBook,
    lendBook
}