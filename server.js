// server.js
const express = require("express");
const oracledb = require("oracledb");
const path = require("path");
const app = express();
const port = 3000;

// Configuración de Oracle Instant Client (modo Thick)
oracledb.initOracleClient({
  libDir: "/Users/styp/Downloads/instantclient_23_3",
});

// Configuración de conexión
const config = {
  user: "cenate",
  password: "cenate2018",
  connectString: "10.0.0.95:1521/devsalud",
};

// Middleware para parsear el cuerpo de las peticiones en formato JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, "public")));

// Ruta para servir el archivo HTML (desde la carpeta 'public')
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "users_ti.html"));
});

// Ruta para obtener los datos de la base de datos como JSON
app.get("/data", async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection(config);
    // Realizar la consulta con el orden de columnas especificado
    const result = await connection.execute(`
      SELECT 
        ID_SOPORTE_TI, 
        NOMBRES_SOPORTE_TI, 
        APEPATERNO_SOPORTE_TI, 
        APEMATERNO_SOPORTE_TI, 
        DNI_SOPORTE_TI, 
        CORREO_SOPORTE_TI
      FROM CENATE_SOPORTE_TI
    `);

    const headers = [
      "ID",
      "Nombres",
      "Apellido Paterno",
      "Apellido Materno",
      "DNI",
      "Correo Electrónico",
    ];

    res.json({
      columns: headers,
      rows: result.rows,
    });
  } catch (err) {
    console.error("Error en la conexión o consulta:", err);
    res.status(500).send("Error en la base de datos");
  } finally {
    if (connection) {
      await connection.close();
    }
  }
});

// Ruta para crear un nuevo dato en la base de datos
app.post("/data", async (req, res) => {
  const { nombre, apellidoPaterno, apellidoMaterno, dni, correo } = req.body;
  let connection;
  try {
    connection = await oracledb.getConnection(config);

    // Usamos la secuencia CENATE_SOPORTE_TI_SEQ para generar el ID automáticamente
    const result = await connection.execute(
      `INSERT INTO CENATE_SOPORTE_TI 
        (ID_SOPORTE_TI, NOMBRES_SOPORTE_TI, APEPATERNO_SOPORTE_TI, APEMATERNO_SOPORTE_TI, DNI_SOPORTE_TI, CORREO_SOPORTE_TI) 
      VALUES 
        (CENATE_SOPORTE_TI_SEQ.NEXTVAL, :nombre, :apellidoPaterno, :apellidoMaterno, :dni, :correo)`,
      [nombre, apellidoPaterno, apellidoMaterno, dni, correo],
      { autoCommit: true } // Commit de la transacción
    );

    res.status(201).send("Nuevo dato creado");
  } catch (err) {
    console.error("Error al crear el dato:", err);
    res.status(500).send("Error al crear el dato");
  } finally {
    if (connection) {
      await connection.close();
    }
  }
});

// Ruta para actualizar un dato de la base de datos
app.put("/data/:id", async (req, res) => {
  const { id } = req.params;
  const { nombre, apellidoPaterno, apellidoMaterno, dni, correo } = req.body;
  let connection;
  try {
    connection = await oracledb.getConnection(config);
    const result = await connection.execute(
      `UPDATE CENATE_SOPORTE_TI
       SET NOMBRES_SOPORTE_TI = :nombre,
           APEPATERNO_SOPORTE_TI = :apellidoPaterno,
           APEMATERNO_SOPORTE_TI = :apellidoMaterno,
           DNI_SOPORTE_TI = :dni,
           CORREO_SOPORTE_TI = :correo
       WHERE ID_SOPORTE_TI = :id`,
      [nombre, apellidoPaterno, apellidoMaterno, dni, correo, id],
      { autoCommit: true }
    );
    if (result.rowsAffected > 0) {
      res.send("Dato actualizado");
    } else {
      res.status(404).send("Dato no encontrado");
    }
  } catch (err) {
    console.error("Error al actualizar el dato:", err);
    res.status(500).send("Error al actualizar el dato");
  } finally {
    if (connection) {
      await connection.close();
    }
  }
});

// Función para verificar si el DNI ya existe
const checkIfExists = async (dni) => {
  const query = "SELECT COUNT(*) FROM usuarios WHERE dni = :dni";
  const result = await db.execute(query, [dni]);
  return result[0] > 0;
};

// Función para crear un nuevo registro
const createRecord = async (
  nombre,
  apellidoPaterno,
  apellidoMaterno,
  dni,
  correo
) => {
  try {
    const dniExists = await checkIfExists(dni);
    if (dniExists) {
      throw new Error("El DNI ya existe en la base de datos");
    }

    // Si no existe, puedes proceder con la inserción
    const insertQuery = `
      INSERT INTO usuarios (nombre, apellido_paterno, apellido_materno, dni, correo) 
      VALUES (:nombre, :apellidoPaterno, :apellidoMaterno, :dni, :correo)
    `;
    await db.execute(insertQuery, [
      nombre,
      apellidoPaterno,
      apellidoMaterno,
      dni,
      correo,
    ]);
    console.log("Registro creado exitosamente");
  } catch (error) {
    console.error("Error al crear el registro:", error);
    throw error; // Re-lanzar el error para manejarlo en el cliente
  }
};

// Ruta para eliminar un dato de la base de datos
app.delete("/data/:id", async (req, res) => {
  const { id } = req.params;
  let connection;
  try {
    connection = await oracledb.getConnection(config);
    const result = await connection.execute(
      `DELETE FROM CENATE_SOPORTE_TI WHERE ID_SOPORTE_TI = :id`,
      [id],
      { autoCommit: true }
    );
    if (result.rowsAffected > 0) {
      res.send("Dato eliminado");
    } else {
      res.status(404).send("Dato no encontrado");
    }
  } catch (err) {
    console.error("Error al eliminar el dato:", err);
    res.status(500).send("Error al eliminar el dato");
  } finally {
    if (connection) {
      await connection.close();
    }
  }
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
