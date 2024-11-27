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
  // Esto sirve el archivo 'datos_ti_users.html' desde la carpeta 'public'
  res.sendFile(path.join(__dirname, 'public', 'datos_ti_users.html'));
});

// Ruta para obtener los datos de la base de datos como JSON
app.get('/data', async (req, res) => {
  let connection;
  try {
    // Conectarse a la base de datos
    connection = await oracledb.getConnection(config);

    // Realizar la consulta
    const result = await connection.execute('SELECT * FROM CENATE_SOPORTE_TI');

    // Enviar los datos como JSON
    res.json({
      columns: result.metaData.map(col => col.name),
      rows: result.rows
    });

  } catch (err) {
    console.error('Error en la conexión o consulta:', err);
    res.status(500).send('Error en la base de datos');
  } finally {
    if (connection) {
      // Cerrar la conexión
      await connection.close();
    }
  }
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
