// Se utiliza para el promosify, transforma callbacks en promise para utilizar con async await
const util = require("util");

// Configuracion de express
const express = require("express");
const app = express();

// Express recibira y enviara las solicitudes en formato JSON
app.use(express.json());

// Si el programa se ejecuta en un servidor, el puerto lo asignara una variable de entorno
// Caso contrario se utilizara el puerto 3000
const PORT = process.env.PORT || 3000;

// Configuracion mysql
const mysql = require("mysql");

// Cors;
const cors = require("cors");
app.use(cors());

// Estos datos de conexion pueden variar segun como este configurado el servidor de cada usuario
const conexion = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "my_books",
});

conexion.connect((error) => {
  if (error) {
    throw error;
  }

  console.log("Connection with database established.");
});

// permite uso de async await con mysql
const qy = util.promisify(conexion.query).bind(conexion);

// De aqui en mas se deben escribir las rutas de la API
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

// Se ejecuta la app para que escuche al puerto determinado
app.listen(PORT, () => {
  console.log(`Our app is running on port ${PORT} `);
});
