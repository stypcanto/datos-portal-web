const oracledb = require('oracledb');

// Configuración para usar Instant Client (modo Thick)
oracledb.initOracleClient({ libDir: '/Users/styp/Downloads/instantclient_23_3' });

// Configuración de conexión
const config = {
  user: 'cenate',
  password: 'cenate2018',
  connectString: '10.0.0.95:1521/devsalud', 
};

async function getSoporteTiData() {
  let connection;
  
  try {
    // Conectarse a la base de datos
    connection = await oracledb.getConnection(config);
    console.log("Conexión exitosa a Oracle");

    // Realizar una consulta
    const result = await connection.execute('SELECT * FROM CENATE_SOPORTE_TI');
    console.log(result.rows);

  } catch (err) {
    console.error('Error en la conexión o consulta:', err);
  } finally {
    if (connection) {
      // Cerrar la conexión
      await connection.close();
    }
  }
}

getSoporteTiData();
