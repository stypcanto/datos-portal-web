// Función para mostrar el formulario de agregar registro
function showAddForm() {
    document.getElementById('add-form').classList.remove('hidden');
    clearForm();  // Limpiar el formulario cuando se muestra
}

// Función para formatear la fecha correctamente
function formatDate(dateStr) {
    if (!dateStr) return null;  // Si la fecha está vacía, devolver null

    // Separar la fecha en día, mes y año
    const [day, month, year] = dateStr.split('/');

    // Verificar si la fecha es válida
    if (!year || !month || !day) {
        return null;
    }

    // Devolver la fecha formateada como 'YYYY-MM-DD'
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}






// Función para guardar o actualizar los datos (POST o PUT dependiendo de si el DNI existe)
async function savePerson() {
    const dni = document.getElementById('dni').value.trim();

    // Verifica si el DNI está vacío
    if (!dni) {
        alert("El DNI no puede estar vacío.");
        return;
    }

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
        fechaterminolaboral: formatDate(document.getElementById('fechaterminolaboral').value) || null,
        activo: document.getElementById('activo').checked ? 'S' : 'N',
    };
    

    let method = 'POST'; // Por defecto, intentamos crear un nuevo registro
    const url = `http://localhost:3000/personal_cenate/${dni}`;

    try {
        // Verificar si el DNI ya existe
        const checkResponse = await fetch(url);
        
        // Si el DNI ya existe, usamos PUT para actualizar
        if (checkResponse.ok) {
            method = 'PUT'; // Forzar la actualización
        }

        // Enviar la solicitud con el método correcto
        const response = await fetch(method === 'POST' ? 'http://localhost:3000/personal_cenate' : url, {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newData),
        });

        const data = await response.json();

        // Verificar si hay un error en el servidor relacionado con el DNI
        if (data.error) {
            alert(data.error);
            return;
        }

        // Si la respuesta es exitosa, mostrar mensaje y limpiar el formulario
        alert(`${method === 'POST' ? 'Registro creado' : 'Registro actualizado'} con éxito.`);
        clearForm();
    } catch (error) {
        console.error('Error:', error);
        alert('Hubo un error al guardar los datos.');
    }
}





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
                document.getElementById('fechaingresolaboral').value = formatDate(data.fechaingresolaboral || '') || '';
document.getElementById('fechaterminolaboral').value = formatDate(data.fechaterminolaboral || '') || '';

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

// Función para limpiar el formulario
function clearForm() {
    // Si 'add-form' no es un formulario, hay que resetear los valores de los campos manualmente

    document.getElementById('dni').value = '';
    document.getElementById('nombre').value = '';
    document.getElementById('apellido').value = '';
    document.getElementById('fechanacimiento').value = '';
    document.getElementById('telefono').value = '';
    document.getElementById('correo').value = '';
    document.getElementById('direccion').value = '';
    document.getElementById('genero').value = '';
    document.getElementById('colegiatura').value = '';
    document.getElementById('rnp').value = '';
    document.getElementById('profesion').value = '';
    document.getElementById('especialidad').value = '';
    document.getElementById('fechaingresolaboral').value = '';
    document.getElementById('fechaterminolaboral').value = '';
    document.getElementById('activo').checked = false; // Si tienes un checkbox, restablecer su valor

    // Ocultar los botones de modificar y eliminar
    document.getElementById('modify-delete-buttons').classList.add('hidden');
    document.getElementById('delete-button').classList.add('hidden');  // Ocultar el botón de eliminar

    // Limpiar el campo de búsqueda de DNI
    document.getElementById('search-dni').value = '';

    // Restablecer el texto del botón de guardar
    document.getElementById('save-button').textContent = 'Guardar Registro';
}


// Función para regresar al directorio
function goToDirectory() {
    window.location.href = "personal_cenate.html";
}
