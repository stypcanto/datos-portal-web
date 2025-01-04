const express = require("express");
const oracledb = require("oracledb");
const path = require("path");

const app = express();
const port = 3000;

// Configuración de Oracle Instant Client (modo Thick) - Maquina Jesus
// oracledb.initOracleClient({
//  libDir: "/Users/cenate2/Datos Cenate/instantclient_23_3",
// });

//Configuración de Oracle Instant Client (modo Thick) - Maquina Styp
oracledb.initOracleClient({
   libDir: "/Users/styp/Downloads/instantclient_23_3",
 });


// Configuración de conexión a Oracle
const config = {
  user: "cenate",
  password: "cenate2018",
  connectString: "10.0.0.95:1521/devsalud",
};

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Middleware de debugging
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.url}`, req.body || {});
  next();
});


// Ruta para servir la página de soporte TI
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "users_ti.html"));
});

// Ruta para obtener datos de la tabla CENATE_SOPORTE_TI
app.get("/data", async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection(config);
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

    console.log(result.rows);
    const headers = [
      "ID",
      "Nombres",
      "Apellido Paterno",
      "Apellido Materno",
      "DNI",
      "Correo Electrónico",
    ];

    res.json({ columns: headers, rows: result.rows });
  } catch (err) {
    console.error("Error en la conexión o consulta:", err);
    res.status(500).send("Error en la base de datos");
  } finally {
    if (connection) await connection.close();
  }
});


// Nueva ruta para obtener datos de la tabla CENATE_PERSONAL_2025
app.get("/personal_cenate", async (req, res) => {
  let connection;
  let sql = `
    SELECT 
      ID_PERSONAL, 
      NOMBRES_PERSONAL, 
      APEPATERNO_PERSONAL, 
      APEMATERNO_PERSONAL, 
      AREA_LABORAL_PERSONAL, 
      DNI_PERSONAL, 
      CORREO_PERSONAL, 
      NUM_TELEFONO_PERSONAL, 
      SEXO_PERSONAL, 
      COD_ESTADO_CONTRATO 
    FROM CENATE_PERSONAL_2025
  `;

  let bindParams = {};

  // Filtrar si se pasa un DNI
  if (req.query.dni) {
    const dni = req.query.dni;
    sql += " WHERE DNI_PERSONAL = :dni";
    bindParams.dni = dni;
  }

  try {
    connection = await oracledb.getConnection(config);
    const result = await connection.execute(sql, bindParams);

    const headers = [
      "ID",
      "Nombres",
      "Apellido Paterno",
      "Apellido Materno",
      "Área Laboral",
      "DNI",
      "Correo Electrónico",
      "Teléfono",
      "Sexo",
      "Estado del Contrato",
    ];

    res.json({ columns: headers, rows: result.rows });
  } catch (err) {
    console.error("Error en la conexión o consulta:", err);
    res.status(500).send("Error en la base de datos");
  } finally {
    if (connection) await connection.close();
  }
});


// Ruta para modificar la página de soporte TI
// Ruta para crear un nuevo registro
app.post("/data", async (req, res) => {
  let connection;
  try {
    const { nombres, apellidoPaterno, apellidoMaterno, dni, correo } = req.body;

    console.log("Datos a insertar:", { nombres, apellidoPaterno, apellidoMaterno, dni, correo });

    if (!nombres || !dni) {
      return res.status(400).send("Datos incompletos");
    }

    connection = await oracledb.getConnection(config);
    
    // Insertar el nuevo registro, usando la secuencia para el ID
    await connection.execute(
      `
      INSERT INTO CENATE_SOPORTE_TI 
      (ID_SOPORTE_TI, NOMBRES_SOPORTE_TI, APEPATERNO_SOPORTE_TI, APEMATERNO_SOPORTE_TI, DNI_SOPORTE_TI, CORREO_SOPORTE_TI) 
      VALUES (CENATE_SOPORTE_TI_SEQ.NEXTVAL, :nombres, :apellidoPaterno, :apellidoMaterno, :dni, :correo)
    `,
      { nombres, apellidoPaterno, apellidoMaterno, dni, correo },
      { autoCommit: true }
    );

    res.status(201).send("Registro creado correctamente");
  } catch (err) {
    console.error("Error al crear el registro:", err);
    res.status(500).send("Error al procesar la solicitud");
  } finally {
    if (connection) await connection.close();
  }
});


// Ruta para actualizar un registro
app.put("/data/:id", async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    const { nombres, apellidoPaterno, apellidoMaterno, dni, correo } = req.body;

    console.log("Datos a actualizar:", { id, nombres, apellidoPaterno, apellidoMaterno, dni, correo });

    if (!nombres || !dni) {
      return res.status(400).send("Datos incompletos");
    }

    connection = await oracledb.getConnection(config);
    await connection.execute(
      `
      UPDATE CENATE_SOPORTE_TI
      SET NOMBRES_SOPORTE_TI = :nombres,
          APEPATERNO_SOPORTE_TI = :apellidoPaterno,
          APEMATERNO_SOPORTE_TI = :apellidoMaterno,
          DNI_SOPORTE_TI = :dni,
          CORREO_SOPORTE_TI = :correo
      WHERE ID_SOPORTE_TI = :id
    `,
      { id, nombres, apellidoPaterno, apellidoMaterno, dni, correo },
      { autoCommit: true }
    );

    res.status(200).send("Registro actualizado correctamente");
  } catch (err) {
    console.error("Error al actualizar el registro:", err);
    res.status(500).send("Error al procesar la solicitud");
  } finally {
    if (connection) await connection.close();
  }
});

// Ruta para eliminar un registro
app.delete("/data/:id", async (req, res) => {
  let connection;
  try {
    const { id } = req.params;

    console.log("ID a eliminar:", id);

    connection = await oracledb.getConnection(config);
    await connection.execute(
      `
      DELETE FROM CENATE_SOPORTE_TI WHERE ID_SOPORTE_TI = :id
    `,
      { id },
      { autoCommit: true }
    );

    res.status(200).send("Registro eliminado correctamente");
  } catch (err) {
    console.error("Error al eliminar el registro:", err);
    res.status(500).send("Error al procesar la solicitud");
  } finally {
    if (connection) await connection.close();
  }
});





// CRUD para modificar datos del personal
// Crear un nuevo registro
app.post("/personal_cenate", async (req, res) => {
  let connection;
  try {
    const {
      nombres,
      apellidoPaterno,
      apellidoMaterno,
      areaLaboral,
      dni,
      correo,
      telefono,
      sexo,
      estadoContrato,
    } = req.body;

    if (!nombres || !dni) {
      return res.status(400).send("Datos incompletos");
    }

    connection = await oracledb.getConnection(config);

    await connection.execute(
      `
      INSERT INTO CENATE_PERSONAL_2025 
      (ID_PERSONAL, NOMBRES_PERSONAL, APEPATERNO_PERSONAL, APEMATERNO_PERSONAL, AREA_LABORAL_PERSONAL, DNI_PERSONAL, CORREO_PERSONAL, NUM_TELEFONO_PERSONAL, SEXO_PERSONAL, COD_ESTADO_CONTRATO) 
      VALUES (CENATE.CENATE_PERSONAL_SEQ.NEXTVAL, :nombres, :apellidoPaterno, :apellidoMaterno, :areaLaboral, :dni, :correo, :telefono, :sexo, :estadoContrato)
    `,
      { nombres, apellidoPaterno, apellidoMaterno, areaLaboral, dni, correo, telefono, sexo, estadoContrato },
      { autoCommit: true }
    );
    

    res.status(201).send("Registro creado correctamente");
  } catch (err) {
    console.error("Error al crear el registro:", err);
    res.status(500).send("Error al procesar la solicitud");
  } finally {
    if (connection) await connection.close();
  }
});

// Actualizar un registro por ID
app.put("/personal_cenate/:id", async (req, res) => {
  let connection;
  const id = req.params.id;
  const {
    nombres,
    apellidoPaterno,
    apellidoMaterno,
    areaLaboral,
    dni,
    correo,
    telefono,
    sexo,
    estadoContrato,
  } = req.body;

  try {
    connection = await oracledb.getConnection(config);

    const result = await connection.execute(
      `
      UPDATE CENATE_PERSONAL_2025
      SET 
        NOMBRES_PERSONAL = :nombres,
        APEPATERNO_PERSONAL = :apellidoPaterno,
        APEMATERNO_PERSONAL = :apellidoMaterno,
        AREA_LABORAL_PERSONAL = :areaLaboral,
        DNI_PERSONAL = :dni,
        CORREO_PERSONAL = :correo,
        NUM_TELEFONO_PERSONAL = :telefono,
        SEXO_PERSONAL = :sexo,
        COD_ESTADO_CONTRATO = :estadoContrato
      WHERE ID_PERSONAL = :id
    `,
      { nombres, apellidoPaterno, apellidoMaterno, areaLaboral, dni, correo, telefono, sexo, estadoContrato, id },
      { autoCommit: true }
    );

    if (result.rowsAffected === 0) {
      return res.status(404).send("Registro no encontrado");
    }

    res.status(200).send("Registro actualizado correctamente");
  } catch (err) {
    console.error("Error al actualizar el registro:", err);
    res.status(500).send("Error al procesar la solicitud");
  } finally {
    if (connection) await connection.close();
  }
});

// Eliminar un registro por ID
app.delete("/personal_cenate/:id", async (req, res) => {
  let connection;
  const id = req.params.id;

  try {
    connection = await oracledb.getConnection(config);

    const result = await connection.execute(
      `
      DELETE FROM CENATE_PERSONAL_2025
      WHERE ID_PERSONAL = :id
    `,
      { id },
      { autoCommit: true }
    );

    if (result.rowsAffected === 0) {
      return res.status(404).send("Registro no encontrado");
    }

    res.status(200).send("Registro eliminado correctamente");
  } catch (err) {
    console.error("Error al eliminar el registro:", err);
    res.status(500).send("Error al procesar la solicitud");
  } finally {
    if (connection) await connection.close();
  }
});



// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});
