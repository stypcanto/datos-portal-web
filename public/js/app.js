// Función para mostrar el formulario de agregar registro
function showAddForm() {
    document.getElementById('add-form').classList.remove('hidden');
    clearForm();  // Limpiar el formulario cuando se muestra
}

//Converti formato de fecha
function formatDate(dateStr) {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {  // Verificar si es una fecha válida
        return '';  // Retorna vacío si no es válida
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}



// Función para guardar o actualizar los datos (POST o PUT dependiendo de si el DNI existe)
async function savePerson() {
    const dni = document.getElementById('dni').value.trim();

    // Crear el objeto con los datos a enviar
    const newData = {
        dni,
        nombre: document.getElementById('nombre').value.trim(),
        apellido: document.getElementById('apellido').value.trim(),
        fechanacimiento: formatDate(document.getElementById('fechanacimiento').value),
        telefono: document.getElementById('telefono').value.trim(),
        correo: document.getElementById('correo').value.trim(),
        direccion: document.getElementById('direccion').value.trim(),
        genero: document.getElementById('genero').value.trim(),
        colegiatura: document.getElementById('colegiatura').value.trim(),
        rnp: document.getElementById('rnp').value.trim(),
        profesion: document.getElementById('profesion').value.trim(),
        especialidad: document.getElementById('especialidad').value.trim(),
        fechaingresolaboral: formatDate(document.getElementById('fechaingresolaboral').value),
        fechaterminolaboral: document.getElementById('fechaterminolaboral').value.trim() || null,
        activo: document.getElementById('activo').value.trim(),
    };

    const method = dni ? 'PUT' : 'POST';
    const url = dni ? `http://localhost:3000/personal_cenate/${dni}` : 'http://localhost:3000/personal_cenate';

    try {
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newData),
        });

        if (!response.ok) {
            throw new Error('Hubo un error al procesar la solicitud');
        }

        const data = await response.json();
        alert(`${method === 'POST' ? 'Registro creado' : 'Registro modificado'} con éxito.`);
        clearForm();
    } catch (error) {
        console.error('Error:', error);
        alert('Hubo un error al guardar los datos.');
    }
}

// Función para limpiar el formulario
function clearForm() {
    document.getElementById('add-form').reset();
    document.getElementById('modify-delete-buttons').classList.add('hidden');
    document.getElementById('search-dni').value = '';
    document.getElementById('delete-button').classList.add('hidden');  // Ocultar el botón de eliminar
    document.getElementById('save-button').textContent = 'Guardar Registro'; // Restablecer el texto del botón de guardar
}

// Función para mostrar los botones de modificar y eliminar
// Función para mostrar los botones de modificar y eliminar
function showModifyDeleteButtons() {
    const modifyDeleteButtons = document.getElementById('modify-delete-buttons');
    const saveButton = document.getElementById('save-button');
    const deleteButton = document.getElementById('delete-button');

    if (modifyDeleteButtons && saveButton && deleteButton) {
        modifyDeleteButtons.classList.remove('hidden'); // Mostrar contenedor
        saveButton.textContent = 'Actualizar Registro'; // Cambiar el texto del botón guardar
        deleteButton.classList.remove('hidden'); // Mostrar el botón eliminar
    } else {
        console.error("Elementos necesarios no encontrados en el DOM.");
    }
}

// Función para buscar un registro por DNI
function fetchDataByDni() {
    const dni = document.getElementById('search-dni').value.trim();
    if (!dni) {
        alert("Por favor ingrese un DNI.");
        return;
    }

    showLoader(true);

    fetch(`http://localhost:3000/personal_cenate/${dni}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("Datos recibidos:", JSON.stringify(data, null, 2)); // Ver datos completos

            if (data && data.dni) {  // Asegúrate de que los datos sean correctos
                // Rellenar formulario
                document.getElementById('dni').value = data.dni || '';
                document.getElementById('nombre').value = data.nombre || '';
                document.getElementById('apellido').value = data.apellido || '';
                document.getElementById('fechanacimiento').value = formatDate(data.fechanacimiento) || '';
                document.getElementById('telefono').value = data.telefono || '';
                document.getElementById('correo').value = data.email || '';
                document.getElementById('direccion').value = data.direccion || '';
                document.getElementById('genero').value = data.genero || '';
                document.getElementById('colegiatura').value = data.colegiatura || '';
                document.getElementById('rnp').value = data.rnp || '';
                document.getElementById('profesion').value = data.profesion || '';
                document.getElementById('especialidad').value = data.especialidad || '';
                document.getElementById('fechaingresolaboral').value = formatDate(data.fechaingresolaboral) || '';
                document.getElementById('fechaterminolaboral').value = data.fechaterminolaboral || '';
                document.getElementById('activo').checked = data.activo === 'S'; // Asegúrate de que el campo "activo" esté marcado si es 'S'

               // Mostrar formulario
        document.getElementById('add-form').classList.remove('hidden'); // Mostrar el formulario

        // Mostrar botones de modificar y eliminar
        showModifyDeleteButtons();
            } else {
                alert("No se encontraron datos para el DNI proporcionado.");
            }
        })
        .catch(error => {
            console.error('Error al buscar los datos:', error);
            alert("Hubo un error al buscar los datos: " + error.message);
        })
        .finally(() => {
            showLoader(false);
        });
}




// Ajustes al loader
function showLoader(show) {
    const loader = document.getElementById('loader');
    if (loader) {
        loader.style.display = show ? 'block' : 'none';
    }
}


// Función para mostrar/ocultar un loader (puedes personalizarla)
function showLoader(show) {
    const loader = document.getElementById('loader');
    if (loader) {
        loader.style.display = show ? 'block' : 'none';
    }
}

// Función para eliminar un registro
function deletePerson() {
    const dni = document.getElementById('dni').value.trim();

    if (!dni) {
        alert("Por favor ingrese un DNI.");
        return;
    }

    fetch(`http://localhost:3000/personal_cenate/${dni}`, {
        method: 'DELETE',
    })
    .then(response => response.json())
    .then(data => {
        alert("Registro eliminado con éxito.");
        clearForm();  // Limpiar el formulario después de la eliminación
    })
    .catch(error => {
        console.error('Error:', error);
        alert("Hubo un error al eliminar el registro.");
    });
}

// Función para regresar al directorio
function goToDirectory() {
    window.location.href = "personal_cenate.html";
}
