const express = require("express");
const oracledb = require("oracledb");
const path = require("path");
const cors = require("cors"); // Agregar esta línea

const app = express();
const PORT = 3000;

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

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());


app.use(express.static(path.join(__dirname, 'public')));


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

// Ruta GET para obtener todos los registros de personal (GET)
// Ruta para obtener todos los registros de personal (GET)
app.get("/personal_cenate", async (req, res) => {
  let connection;
  try {
    connection = await connectToDB();
    const sql = `
    SELECT DNI, NOMBRE, APELLIDO, TO_CHAR(FECHANACIMIENTO, 'DD/MM/YYYY') FECHANACIMIENTO, TELEFONO, EMAIL, DIRECCION, GENERO,
           COLEGIATURA, RNP, PROFESION, ESPECIALIDAD, TO_CHAR(FECHAINGRESOLABORAL, 'DD/MM/YYYY') FECHAINGRESOLABORAL,
           TO_CHAR(FECHATERMINOLABORAL, 'DD/MM/YYYY') FECHATERMINOLABORAL, ACTIVO
    FROM CENATE.CENATE_PERSONAL2025
  `;
    const result = await connection.execute(sql);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No se encontraron registros" });
    }

    const columns = [
      'DNI', 'Nombre', 'Apellido', 'Fecha Nacimiento', 'Teléfono', 'Email', 'Dirección', 'Género',
      'Colegiatura', 'RNP', 'Profesión', 'Especialidad', 'Fecha Ingreso Laboral', 'Fecha Termino Laboral', 'Activo'
    ];

    const rows = result.rows.map(row => row.map(cell => cell || ''));

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



// Ruta para insertar un nuevo registro (POST)
app.post("/personal_cenate", async (req, res) => {
  const {
    dni,
    nombre,
    apellido,
    fechanacimiento,
    telefono,
    email,
    direccion,
    genero,
    colegiatura,
    rnp,
    profesion,
    especialidad,
    fechaingresolaboral,
    fechaterminolaboral,
    activo,
  } = req.body;

  let connection;

  try {
    // Validación básica de datos
    if (!dni || !nombre || !apellido || !telefono || !email || !direccion || !genero || !colegiatura || !rnp || !profesion || !especialidad || activo === undefined) {
      return res.status(400).json({ error: "Faltan datos obligatorios" });
    }

    connection = await connectToDB();

    const sql = `
      INSERT INTO CENATE.CENATE_PERSONAL2025 (
        DNI, NOMBRE, APELLIDO, FECHANACIMIENTO, TELEFONO, EMAIL, DIRECCION, GENERO,
        COLEGIATURA, RNP, PROFESION, ESPECIALIDAD, FECHAINGRESOLABORAL, FECHATERMINOLABORAL, ACTIVO
      ) VALUES (
        :dni, :nombre, :apellido, TO_DATE(:fechanacimiento, 'YYYY-MM-DD'), :telefono, :email, :direccion, :genero,
        :colegiatura, :rnp, :profesion, :especialidad, TO_DATE(:fechaingresolaboral, 'YYYY-MM-DD'), TO_DATE(:fechaterminolaboral, 'YYYY-MM-DD'), :activo
      )
    `;

    const binds = {
      dni,
      nombre,
      apellido,
      fechanacimiento: fechanacimiento || null,
      telefono,
      email,
      direccion,
      genero,
      colegiatura,
      rnp,
      profesion,
      especialidad,
      fechaingresolaboral: fechaingresolaboral || null,
      fechaterminolaboral: fechaterminolaboral || null,
      activo,
    };

    await connection.execute(sql, binds, { autoCommit: true });

    res.status(201).json({ message: "Registro creado con éxito" });
  } catch (err) {
    console.error("Error al guardar el registro:", err);
    res.status(500).json({ error: "Error al agregar el registro" });
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