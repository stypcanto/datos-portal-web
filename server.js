// server.js
const express = require('express');
const oracledb = require('oracledb');
const path = require('path');
const app = express();
const port = 3000;

// Configuración de Oracle Instant Client (modo Thick)
oracledb.initOracleClient({ libDir: '/Users/styp/Downloads/instantclient_23_3' });

// Configuración de conexión
const config = {
  user: 'cenate',
  password: 'cenate2018',
  connectString: '10.0.0.95:1521/devsalud',
};

// Servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Ruta para servir el archivo HTML (desde la carpeta 'public')
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'datos_ti_users.html'));
});

// Ruta para obtener los datos de la base de datos como JSON
app.get('/data', async (req, res) => {
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

    // Verifica los resultados en la consola para confirmar que los datos están correctos
    console.log(result.rows); // Agrega un log para ver la estructura de los datos

    // Enviar los datos como JSON con los encabezados personalizados
    const headers = [
      'ID',
      'Nombres',
      'Apellido Paterno',
      'Apellido Materno',
      'DNI',
      'Correo Electrónico'
    ];

    res.json({
      columns: headers,
      rows: result.rows
    });

  } catch (err) {
    console.error('Error en la conexión o consulta:', err);
    res.status(500).send('Error en la base de datos');
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
