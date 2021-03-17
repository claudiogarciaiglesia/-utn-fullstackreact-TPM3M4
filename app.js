// Se utiliza para el promosify, transforma callbacks en promise para utilizar con async await
const util = require('util');

// Configuracion de express
const express = require('express');
const app = express();

// Configuracion de middleware cors
const cors = require('cors');
app.use(cors());

// Express recibira y enviara las solicitudes en formato JSON
app.use(express.json());

// Si el programa se ejecuta en un servidor, el puerto lo asignara una variable de entorno
// Caso contrario se utilizara el puerto 3000
const PORT = process.env.PORT || 3000;

// Configuracion mysql
const mysql = require('mysql');

// Estos datos de conexion pueden variar segun como este configurado el servidor de cada usuario
const conexion = mysql.createConnection({
    host: 'localhost',
    user: 'admin',
    password: 'admin',
    database: 'my_books'
});

conexion.connect((error) => {
    if (error) {
        throw error;
    }

    console.log('Connection with database established.');
});

// permite uso de async await con mysql
const qy = util.promisify(conexion.query).bind(conexion);

// Rutas de FerPM

app.post("/libro", async (req, res) => {
    try {
        // Desestructura el objeto
        let { nombre, descripcion, categoria_id, persona_id } = req.body;

        // Verifica que las variables descripcion y persona_id no sean indefinidas (undefined)
        // y que no sean espacios en blanco o vacios.
        [descripcion, persona_id].forEach((element) => {
            if (!element || element.replace(/ /g, "") === "") {
                throw new Error("Faltan datos");
            }
        });
        // Verifica que las variables nombre y categoria no sean indefinidas (undefined)
        // y que no sean espacios en blanco o vacios.
        [nombre, categoria_id].forEach((element) => {
            if (!element || element.replace(/ /g, "") === "") {
                throw new Error("Nombre y categoría son datos obligatorios");
            }
        });

        // Verifica que no se hayan enviado campos que no existen
        let contador = 0;
        [nombre, descripcion, categoria_id, persona_id].forEach((element) => {
            if (!!element) {
                contador++;
            }
        });
        if (Object.keys(req.body).length > contador) {
            throw new Error("Se enviaron uno o mas campos invalidos");
        }

        // Transforma las variables a tipo string en mayusculas
        [nombre, descripcion] = [nombre, descripcion].map((element) =>
            element.toString().toUpperCase()
        );

        // Verifica que el libro no este repetido
        let query = "SELECT * FROM libro WHERE nombre = ?";
        let queryRes = await qy(query, [nombre]);
        if (queryRes.length > 0) {
            throw new Error("Ese libro ya existe");
        }

        // Verifica que la persona exista
        query = "SELECT * FROM persona WHERE id = ?";
        queryRes = await qy(query, [persona_id]);
        if (queryRes.length == 0) {
            throw new Error("No existe la persona indicada");
        }

        // Carga el nuevo libro en la base de datos
        query =
            "INSERT INTO libro (nombre, descripcion, categoria_id, persona_id) VALUES (?, ?, ?, ?)";
        queryRes = await qy(query, [nombre, descripcion, categoria_id, persona_id]);

        let id = queryRes.insertId;

        // Muestra el libro actualizado
        query = "SELECT * FROM libro WHERE id = ?";
        queryRes = await qy(query, id);

        res.status(200);
        res.send(queryRes[0]);
    } catch (e) {
        res.status(413).send({ Error: e.message });
    }
});

app.get("/libro/:id", async (req, res) => {
    try {
        const query = "SELECT * FROM libro WHERE id = ?";
        const respuesta = await qy(query, [req.params.id]);
        if (respuesta.length == 1) {
            res.send(respuesta[0]);
        } else {
            res.status(404).send("No se encuentra ese libro");
        }
    } catch (e) {
        console.error(e.message);
        res.status(413).send({ Error: e.message });
    }
});



//FEDERICO TARTARI

app.post('/categoria', async (req, res) => {
    try {
        // Valido que me manden bien la info
        if (!req.body.nombre) {
            throw new Error('Faltan datos');

        }

        const nombre = req.body.nombre;

        //Verifico que no exista previamente esa categoria
        let query = 'SELECT id FROM categoria WHERE nombre = ?';

        let respuesta = await qy(query, [nombre]);

        if (respuesta.length > 0) {
            throw new Error('Ese nombre de categoria ya existe');
        }

        //Guardo la nueva categoria
        query = 'INSERT INTO categoria (nombre) VALUE (?)';
        respuesta = await qy(query, [nombre]);

        console.log(respuesta);
        res.status(200).send("Se guardo correctamente");
    }
    catch (e) {
        console.error(e.mesagge);
        res.status(413).send({ "Error": e.mesagge });

    }

});

app.delete('/categoria/:id', async (req, res) => {
    try {

        //Verifico que no exista ningún libro asociado a la categoria
        let query = 'SELECT * FROM libro WHERE categoria_id = ?';

        let respuesta = await qy(query, [req.params.id]);

        if (respuesta.length > 0) {
            throw new Error("Categoria con libro asociado, no se puede eliminar");
        }

        //Elimino la categoria
        query = 'DELETE FROM categoria WHERE id = ?';

        respuesta = await qy(query, [req.params.id]);

        res.status(200).send("Se borro correctamente");

    }
    catch (e) {
        console.error(e.mesagge);
        res.status(413).send({ "Error": e.mesagge });

    }
});

// CLAUDIO GARCIA IGLESIA
app.post('/persona', async (req, res) => {
    try {

        // Desestructura el objeto
        let { nombre, apellido, alias, email } = req.body;

        // Verifica que las variables definidas en el paso anterior no sean indefinidas (undefined)
        // y que no sean espacios en blanco o vacios.
        [nombre, apellido, alias, email].forEach(element => {
            if (!element || (element.replace(/ /g, '') === '')) {
                throw new Error('Faltan datos')
            }
        });

        // Verifica que no se hayan enviado campos que no existen
        let contador = 0;
        [nombre, apellido, alias, email].forEach(element => {
            if (!!element) { contador++ }
        })
        if (Object.keys(req.body).length > contador) {
            throw new Error('Se enviaron uno o mas campos invalidos')
        };

        // Transforma las variables a tipo string en mayusculas
        [nombre, apellido, alias, email] = [nombre, apellido, alias, email].map(element => (element.toString().toUpperCase()));

        // Verifica que el email no este repetido
        let query = 'SELECT * FROM persona WHERE email = ?';
        let queryRes = await qy(query, [email]);
        if (queryRes.length > 0) {
            throw new Error('La direccion de email ya se encuentra registrada');
        };

        // Carga el nuevo usuario en la base de datos
        query = 'INSERT INTO persona (nombre, apellido, alias, email) VALUES (?, ?, ?, ?)';
        queryRes = await qy(query, [nombre, apellido, alias, email]);

        let id = queryRes.insertId;

        // Muestra la persona actualizada
        query = 'SELECT * FROM persona WHERE id = ?';
        queryRes = await qy(query, id);

        res.status(200);
        res.send(queryRes[0]);

    } catch (e) {
        res.status(413).send({ "Error": e.message });
    }
});

app.put('/persona/:id', async (req, res) => {
    try {
        // Desestructura los parametros y objeto
        const id = req.params.id;
        let { nombre, apellido, alias, email } = req.body;

        // Verifica que no se hayan enviado campos que no existen 
        // y que los que existen no sean espacios en blanco
        let contador = 0;
        [nombre, apellido, alias, email].forEach(element => {
            if (!!element) {
                contador++
                if (element.replace(/ /g, '') === '') {
                    throw new Error('Se enviaron uno o mas campos invalidos');
                }
            }
        })
        if (Object.keys(req.body).length > contador) {
            throw new Error('Se enviaron uno o mas campos invalidos')
        };

        // Verifica que la persona exista
        let query = 'SELECT * FROM persona WHERE id = ?';
        let queryRes = await qy(query, id);

        if (queryRes.length === 0) {
            throw new Error('No se encuentra esa persona');
        };

        // Transforma las variables que no sean indefinidas a tipo string en mayusculas
        [nombre, apellido, alias, email] = [nombre, apellido, alias, email].map(element => {
            return (!!element ? element.toString().toUpperCase() : element);
        });

        // Verifica que no se este intentando modificar el email siempre que haya sido enviado
        if ((queryRes[0].email !== email) && (!!email)) { throw new Error('El email no se puede modificar') };

        // Construye el query segun los datos enviados
        // Objeto con los datos a insertar, solo se puede insertar nombre, apellido o alias
        let queryObject = {};

        // String que guardara nombre de las columnas, el signo = y el signo de ? por cada modificacion que sea necesaria
        let querySet = '';

        // Array con los valores a asignar a las columnas para el array del query
        let querySetValues = [];

        // Agrega datos al queryObject siempre que no sean indefinidos
        !!nombre && (queryObject.nombre = nombre);
        !!apellido && (queryObject.apellido = apellido);
        !!alias && (queryObject.alias = alias);

        // Agrega datos desde el objeto al querySet y al querySetValues
        for (const prop in queryObject) {
            querySet = querySet + `${prop} = ?, `;
            querySetValues.push(queryObject[prop]);
        };

        // Remueve la ultima coma que siempre esta de mas pero es necesaria
        querySet = querySet.substring(0, querySet.length - 2);

        // Modifica los campos de persona
        query = `UPDATE persona SET ${querySet} WHERE id = ?`;
        queryRes = await qy(query, [...querySetValues, id]);

        // Muestra la persona actualizada
        query = 'SELECT * FROM persona WHERE id = ?';
        queryRes = await qy(query, id);

        res.status(200);
        res.send(queryRes[0]);

    } catch (e) {
        res.status(413).send({ "Error": e.message });
    }
});

// PATRICIO HERNAN MURIEGA
app.delete('/libro/:id', async (req, res) => {
    try {
        //Primero chequeo que el libro exista
        const id = req.params.id;
        let query = 'SELECT * FROM libro WHERE id = ?';
        let respuesta = await qy(query, id);
        if (respuesta.length == 0) {
            throw new Error("No se encuentra este libro");
        }
        //En caso de que exista verifico el estado de persona_id para ver si fue prestado
        else {
            query = 'SELECT * FROM libro WHERE id = ? AND persona_id <> 0';
            respuesta = await qy(query, id);
            if (respuesta.length > 0) {
                throw new Error("Ese libro esta prestado, no se puede borrar");
            }
            //Por último, ejecuto la consulta para borrar el libro
            else {
                query = 'DELETE FROM libro WHERE id = ?';
                respuesta = await qy(query, id);
                res.status(200).send("Se borro correctamente");
            }
        }
    }
    catch (e) {
        console.error(e.message);
        res.status(413).send({ "Error": e.message });
    }
});

app.put('/libro/devolver/:id', async (req, res) => {
    try {
        //Compruebo que el libro exista
        let query = 'SELECT * FROM libro WHERE id = ?';
        let respuesta = await qy(query, [req.params.id]);
        if (respuesta.length == 0) {
            throw new Error("Ese libro no existe");
        }
        //Compruebo que el libro esté prestado
        else {
            query = 'SELECT * FROM libro WHERE id = ? AND persona_id is NULL';
            respuesta = await qy(query, [req.params.id]);
            if (respuesta.length > 0) {
                throw new Error("Ese libro no estaba prestado");
            }
            //Hechas las comprobaciones, actualizo la columna a Null, indicando que el libro está en biblioteca
            else {
                query = 'UPDATE libro SET persona_id = NULL WHERE id = ?';
                respuesta = await qy(query, [req.params.id]);
                res.status(200).send("Se realizo la devolucion correctamente");
            }
        }
    }

            catch(e){
            console.error(e.message);
            res.status(413).send({"Error": e.message});
        }
});

app.put('/libro/prestar/:id', async (req, res)=>{
    try{
        const persona_id = req.body.persona_id;

        let query = 'SELECT * FROM persona WHERE id = ?';
        let respuesta = await qy(query, [persona_id]);
        if (respuesta.length==0) {
            throw new Error("No se encontró la persona a la que se quiere prestar el libro");
        }
        //Compruebo que el libro exista
        query = 'SELECT * FROM libro WHERE id = ?';
        respuesta = await qy(query, [req.params.id]);
        if (respuesta.length==0) {
            throw new Error("No se encontró el libro");
        }
        //Compruebo que el libro esté prestado
        else{
        query = 'SELECT * FROM libro WHERE id = ? AND persona_id is not NULL';
        respuesta = await qy(query, [req.params.id]);
        if (respuesta.length>0) {
            throw new Error("Ese libro está prestado, no se puede prestar hasta que no se devuelva");
        }
        //Hechas las comprobaciones, actualizo la columna
            else{
            query = 'UPDATE libro SET persona_id = ?';
            respuesta = await qy(query, [persona_id]);
            res.status(200).send("Se prestó correctamente");
            }
        }

    catch (e) {
        console.error(e.message);
        res.status(413).send({ "Error": e.message });
    }
});




//Rutas sin asignar
app.get('/categoria', async (req, res) => {
    try {
        // Muestra las categorias
        let query = 'SELECT * FROM categoria';
        let queryRes = await qy(query);

        if (queryRes.length === 0) {
            res.status(413).send([]);
        };

        res.status(200);
        if (queryRes.length > 1) {
            res.send(queryRes);
        } else {
            res.send(queryRes[0]);
        };

    } catch (e) {
        res.status(413).send({ "Error": e.message });
    }
});

app.get('/categoria/:id', async (req, res) => {
    try {
        // Desestructuracion
        const { id } = req.params;

        // Verifica que la categoria exista
        let query = 'SELECT * FROM categoria WHERE id = ?';
        let queryRes = await qy(query, [id]);
        if (queryRes.length === 0) {
            throw new Error('Categoria no encontrada');
        };

        // Muestra la categoria

        res.status(200);
        res.send(queryRes[0]);

    } catch (e) {
        res.status(413).send({ "Error": e.message });
    }
});

app.get('/persona', async (req, res) => {
    try {
        // Muestra las personas
        let query = 'SELECT * FROM persona';
        let queryRes = await qy(query);

        if (queryRes.length === 0) {
            res.status(413).send([]);
        };

        res.status(200);
        if (queryRes.length > 1) {
            res.send(queryRes);
        } else {
            res.send(queryRes[0]);
        };

    } catch (e) {
        res.status(413).send({ "Error": e.message });
    }
});

app.get('/libro', async (req, res) => {
    try {
        // Muestra los libros
        let query = 'SELECT * FROM libro';
        let queryRes = await qy(query);

        if (queryRes.length === 0) {
            res.status(413).send([]);
        };

        res.status(200);
        if (queryRes.length > 1) {
            res.send(queryRes);
        } else {
            res.send(queryRes[0]);
        };

    } catch (e) {
        res.status(413).send({ "Error": e.message });
    }
});

// Se ejecuta la app para que escuche al puerto determinado
app.listen(PORT, () => {
    console.log(`Our app is running on port ${PORT} `);
});