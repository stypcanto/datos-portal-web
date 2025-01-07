const express = require("express");
const oracledb = require("oracledb");
const path = require("path");
const cors = require("cors"); // Agregar esta línea

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
      FROM CENATE.CENATE_PERSONAL2025
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

// Ruta POST para insertar un nuevo registro
app.post("/personal_cenate", async (req, res) => {
  const {
    dni, nombre, apellido, fechanacimiento, telefono, correo, direccion,
    genero, colegiatura, rnp, profesion, especialidad, fechaingresolaboral,
    fechaterminolaboral, activo,
  } = req.body;

  let connection;
  try {
    connection = await connectToDB();
    const query = `
      INSERT INTO CENATE.CENATE_PERSONAL2025 (
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

    await connection.execute(query, bindParams, { autoCommit: true });

    res.json({ message: "Registro guardado correctamente" });
  } catch (err) {
    console.error("Error al guardar el registro:", err);
    res.status(500).json({ error: "Hubo un error al guardar el registro" });
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

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});