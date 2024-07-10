$(document).ready(function() {
    let tablaConsultas;

    function cargarDatosDesdeAPI() {
        console.log('Cargando datos desde la API...');
        $.ajax({
            url: 'http://192.168.1.149:8004/api/v1/accesos/',
            method: 'GET',
            dataType: 'json',
            success: function(data) {
                console.log('Datos recibidos:', data);

                if (!tablaConsultas) {
                    tablaConsultas = $('#tablaConsultas').DataTable({
                        data: data,
                        columns: [
                            { title: 'Nombre', data: 'nombre' },
                            { title: 'Fecha', data: 'fecha' },
                            { title: 'Hora', data: 'hora' },
                            { title: 'Evento', data: 'evento' }
                        ]
                    });
                } else {
                    tablaConsultas.rows.add(data).draw();
                }
            },
            error: function(error) {
                console.error('Error al cargar datos desde la API:', error);
            }
        });
    }

    cargarDatosDesdeAPI();

});