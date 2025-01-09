const express = require("express");
const oracledb = require("oracledb");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(cors());  // Habilita CORS para todas las rutas
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Configuración de Oracle Instant Client (modo Thick) - Maquina Jesus
// oracledb.initOracleClient({
//  libDir: "/Users/cenate2/Datos Cenate/instantclient_23_3",
// });

//Configuración de Oracle Instant Client (modo Thick) - Maquina Styp
oracledb.initOracleClient({
   libDir: "/Users/styp/Downloads/instantclient_23_3",
 });

// Configuración de conexión a Oracle
const dbConfig = {
  user: "cenate",
  password: "cenate2018",
  connectString: "10.0.0.95:1521/devsalud",
};

// Función para conectarse a la base de datos
async function connectToDB() {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    console.log("Conexión exitosa a la base de datos");
  } catch (err) {
    console.error("Error al conectar a la base de datos:", err);
    throw err;
  }
  return connection;
}

// Ruta GET para obtener todos los registros de personal
app.get("/personal_cenate", async (req, res) => {
  let connection;
  try {
    connection = await connectToDB();
    const sql = `
      SELECT DNI, NOMBRE, APELLIDO, TO_CHAR(FECHANACIMIENTO, 'DD/MM/YYYY') FECHANACIMIENTO,
             TELEFONO, EMAIL, DIRECCION, GENERO, COLEGIATURA, RNP, PROFESION, ESPECIALIDAD,
             TO_CHAR(FECHAINGRESOLABORAL, 'DD/MM/YYYY') FECHAINGRESOLABORAL,
             TO_CHAR(FECHATERMINOLABORAL, 'DD/MM/YYYY') FECHATERMINOLABORAL, ACTIVO
      FROM CENATE_PERSONAL2025
    `;
    const result = await connection.execute(sql);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No se encontraron registros" });
    }

    const columns = result.metaData.map((col) => col.name);
    const rows = result.rows.map((row) => row.map((cell) => cell || ""));

    res.status(200).json({ columns, rows });
  } catch (err) {
    console.error("Error al obtener los registros:", err);
    res.status(500).json({ error: "Error al obtener los registros" });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error al cerrar la conexión", err);
      }
    }
  }
});

// Ruta GET para obtener un registro de personal por DNI
app.get("/personal_cenate/:dni", async (req, res) => {
  const dni = req.params.dni;
    // Lógica para buscar el personal con el DNI en tu base de datos...
  
  let connection;
  try {
    connection = await connectToDB();
    const sql = `
      SELECT DNI, NOMBRE, APELLIDO, TO_CHAR(FECHANACIMIENTO, 'YYYY-MM-DD') FECHANACIMIENTO,
             TELEFONO, EMAIL, DIRECCION, GENERO, COLEGIATURA, RNP, PROFESION, ESPECIALIDAD,
             TO_CHAR(FECHAINGRESOLABORAL, 'YYYY-MM-DD') FECHAINGRESOLABORAL,
             TO_CHAR(FECHATERMINOLABORAL, 'YYYY-MM-DD') FECHATERMINOLABORAL, ACTIVO
      FROM CENATE_PERSONAL2025
      WHERE DNI = :dni
    `;
    const result = await connection.execute(sql, [dni]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No se encontró un registro con ese DNI" });
    }

    const row = result.rows[0].reduce((acc, cell, index) => {
      acc[result.metaData[index].name.toLowerCase()] = cell || "";
      return acc;
    }, {});

    res.status(200).json(row);
  } catch (err) {
    console.error("Error al obtener el registro:", err);
    res.status(500).json({ error: "Error al obtener el registro" });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error al cerrar la conexión", err);
      }
    }
  }
});


// Ruta POST para insertar un nuevo registro
app.post("/personal_cenate", async (req, res) => {
  const { fechaNacimiento, fechaIngresoLaboral, fechaTerminoLaboral } = req.body;


// Función para formatear fechas al formato 'YYYY-MM-DD'
function formatDate(dateStr) {
  if (!dateStr) return null;  // Si la fecha está vacía, devolver null
  const [year, month, day] = dateStr.split('-');
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

// Asegurarse de que las fechas estén en el formato correcto
const formattedFechaNacimiento = formatDate(fechaNacimiento);
const formattedFechaIngresoLaboral = formatDate(fechaIngresoLaboral);
const formattedFechaTerminoLaboral = fechaTerminoLaboral ? formatDate(fechaTerminoLaboral) : null;


// Realiza la operación de guardado en la base de datos

  console.log("Datos recibidos:", req.body);

  function isValidDate(dateString) {
    const regex = /^\d{4}-\d{2}-\d{2}$/;  // Asegurarse de que las fechas estén en formato 'YYYY-MM-DD'
    return regex.test(dateString);
}

  let connection;
  try {
    connection = await connectToDB();
    console.log("Conexión a la base de datos establecida.");

   // Validar fechas antes de insertar
if (fechanacimiento && !isValidDate(fechanacimiento)) {
  console.error("Fecha de nacimiento no válida:", fechanacimiento);
  return res.status(400).json({ error: "Fecha de nacimiento no válida." });
}
if (fechaingresolaboral && !isValidDate(fechaingresolaboral)) {
  console.error("Fecha de ingreso laboral no válida:", fechaingresolaboral);
  return res.status(400).json({ error: "Fecha de ingreso laboral no válida." });
}

   // Verificar si el DNI ya existe en la base de datos
const checkQuery = `
SELECT COUNT(*) FROM CENATE_PERSONAL2025 WHERE DNI = :dni
`;
const checkResult = await connection.execute(checkQuery, { dni });

if (checkResult.rows[0][0] > 0) {
console.error("El DNI ya existe en la base de datos.");
return res.status(400).json({ error: "El DNI ya fue registrado, ingrese otro por favor." });
}

   // Consulta SQL para insertar el nuevo registro
   const query = `
   INSERT INTO CENATE_PERSONAL2025 (
     DNI, NOMBRE, APELLIDO, FECHANACIMIENTO, TELEFONO, EMAIL, DIRECCION, GENERO,
     COLEGIATURA, RNP, PROFESION, ESPECIALIDAD, FECHAINGRESOLABORAL, FECHATERMINOLABORAL, ACTIVO
   ) VALUES (
     :dni, :nombre, :apellido, TO_DATE(:fechanacimiento, 'YYYY-MM-DD'), :telefono, :correo, :direccion, :genero,
     :colegiatura, :rnp, :profesion, :especialidad, TO_DATE(:fechaingresolaboral, 'YYYY-MM-DD'),
     TO_DATE(:fechaterminolaboral, 'YYYY-MM-DD'), :activo
   )
 `;

 const bindParams = {
  dni,
  nombre,
  apellido,
  fechanacimiento: formattedFechaNacimiento || null,
  telefono,
  correo,
  direccion,
  genero,
  colegiatura,
  rnp,
  profesion,
  especialidad,
  fechaingresolaboral: formattedFechaIngresoLaboral || null,
  fechaterminolaboral: formattedFechaTerminoLaboral || null,
  activo,
};

  
  console.log("Parámetros de fecha:", bindParams.fechanacimiento, bindParams.fechaingresolaboral, bindParams.fechaterminolaboral);

console.log("Parámetros para la consulta:", bindParams);

const result = await connection.execute(query, bindParams, { autoCommit: true });

res.json({ message: "Registro nuevo creado correctamente" });


  } catch (err) {
    console.error("Error al guardar el registro:", err);
    res.status(500).json({ error: "Hubo un error al guardar el registro", details: err });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error al cerrar la conexión:", err);
        res.status(500).json({ error: "Hubo un error al guardar el registro", details: err });
      }
    }
  }
});






// Ruta PUT para modificar un registro de personal
app.put("/personal_cenate/:dni", async (req, res) => {
  const { dni } = req.params;
  const {
    nombre, apellido, fechanacimiento, telefono, correo, direccion,
    genero, colegiatura, rnp, profesion, especialidad, fechaingresolaboral,
    fechaterminolaboral, activo,
  } = req.body;

  let connection;
  try {
    connection = await connectToDB();
    const query = `
      UPDATE CENATE.CENATE_PERSONAL2025
      SET
        NOMBRE = :nombre,
        APELLIDO = :apellido,
        FECHANACIMIENTO = TO_DATE(:fechanacimiento, 'YYYY-MM-DD'),
        TELEFONO = :telefono,
        EMAIL = :correo,
        DIRECCION = :direccion,
        GENERO = :genero,
        COLEGIATURA = :colegiatura,
        RNP = :rnp,
        PROFESION = :profesion,
        ESPECIALIDAD = :especialidad,
        FECHAINGRESOLABORAL = TO_DATE(:fechaingresolaboral, 'YYYY-MM-DD'),
        FECHATERMINOLABORAL = TO_DATE(:fechaterminolaboral, 'YYYY-MM-DD'),
        ACTIVO = :activo
      WHERE DNI = :dni
    `;

    const bindParams = {
      dni,
      nombre,
      apellido,
      fechanacimiento,
      telefono,
      correo,
      direccion,
      genero,
      colegiatura,
      rnp,
      profesion,
      especialidad,
      fechaingresolaboral,
      fechaterminolaboral: fechaterminolaboral || null,
      activo,
    };

  // Ejecutar la consulta sin autoCommit
  await connection.execute(query, bindParams);

  // Realizar un commit explícito
  await connection.commit();

  

    res.json({ message: "Registro modificado correctamente" });
  } catch (err) {
    console.error("Error al modificar el registro:", err);
    res.status(500).json({ error: "Hubo un error al modificar el registro" });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error al cerrar la conexión:", err);
      }
    }
  }
});

// Ruta DELETE para eliminar un registro de personal
app.delete("/personal_cenate/:dni", async (req, res) => {
  const { dni } = req.params;

  let connection;
  try {
    connection = await connectToDB();
    const query = `
      DELETE FROM CENATE.CENATE_PERSONAL2025
      WHERE DNI = :dni
    `;

    await connection.execute(query, [dni], { autoCommit: true });

    res.json({ message: "Registro eliminado correctamente" });
  } catch (err) {
    console.error("Error al eliminar el registro:", err);
    res.status(500).json({ error: "Hubo un error al eliminar el registro" });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error al cerrar la conexión", err);
      }
    }
  }
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});