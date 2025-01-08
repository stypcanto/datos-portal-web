let allData = [];

// Función para cargar los datos del personal desde la API
async function fetchData() {
    const spinner = document.getElementById("loading-spinner");
    const tbody = document.querySelector("#personalTable tbody");
  
    spinner.style.display = "block"; // Mostrar spinner de carga
  
    try {
      // Añadir parámetros aleatorios para evitar la caché
      const url = `http://localhost:3000/personal_cenate?timestamp=${new Date().getTime()}`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Cache-Control": "no-cache",  // Asegura que la respuesta no esté en caché
          "Pragma": "no-cache",
          "Expires": "0"
        }
      });
  
      if (!response.ok) {
        throw new Error(`Error en la solicitud: ${response.statusText}`);
      }
  
      const data = await response.json();
      console.log("Datos obtenidos:", data);  // Imprime la respuesta de la API en consola
  
      if (Array.isArray(data.rows)) {
        allData = data.rows;
  
        const thead = document.querySelector("#personalTable thead");
        
        // Insertar los encabezados de la tabla dinámicamente
        thead.innerHTML = `<tr>${data.columns.map(col => `<th>${col}</th>`).join("")}</tr>`;
  
        // Limpiar la tabla antes de insertar nuevos datos
        tbody.innerHTML = ""; // Limpiar la tabla
  
        // Insertar las filas de datos en la tabla
        tbody.innerHTML = data.rows
          .map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join("")}</tr>`)
          .join("");
      } else {
        throw new Error("Formato de datos inesperado.");
      }
    } catch (error) {
      console.error("Error al obtener los datos:", error);
      tbody.innerHTML = "<tr><td colspan='15'>Error al cargar los datos</td></tr>"; // Mostrar mensaje de error en la tabla
    } finally {
      spinner.style.display = "none"; // Ocultar spinner de carga
    }
  }
  
  // Llamar a la función fetchData cuando el DOM esté completamente cargado
  document.addEventListener("DOMContentLoaded", () => {
    // Llamar a la función fetchData cuando el DOM esté completamente cargado
    fetchData();
  });
  

// Función para exportar los datos a un archivo Excel
document.getElementById("export-btn").addEventListener("click", () => {
  const wb = XLSX.utils.book_new();
  const table = document.getElementById("personalTable");
  const ws = XLSX.utils.table_to_sheet(table);

  XLSX.utils.book_append_sheet(wb, ws, "Datos");
  XLSX.writeFile(wb, "personal_cenate.xlsx");
});
