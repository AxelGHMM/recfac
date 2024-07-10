const elVideo = document.getElementById('video');
const canvas = document.getElementById('overlay');
let deteccionEnviada = false; // Bandera para indicar si la detección ya fue enviada
let eventoEntrada = true; // Para alternar entre entrada y salida

// Compatibilidad con navegadores más antiguos
navigator.getMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia)

const cargarCamera = () => {
    navigator.getMedia(
        {
            video: true,
            audio: false
        },
        stream => elVideo.srcObject = stream,
        console.error
    )
}

// Cargar Modelos
Promise.all([
    faceapi.nets.ssdMobilenetv1.loadFromUri('https://192.168.1.149/faceapi-main/models'),
    faceapi.nets.ageGenderNet.loadFromUri('https://192.168.1.149/faceapi-main/models'),
    faceapi.nets.faceExpressionNet.loadFromUri('https://192.168.1.149/faceapi-main/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('https://192.168.1.149/faceapi-main/models'),
    faceapi.nets.faceLandmark68TinyNet.loadFromUri('https://192.168.1.149/faceapi-main/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('https://192.168.1.149/faceapi-main/models'),
    faceapi.nets.tinyFaceDetector.loadFromUri('https://192.168.1.149/faceapi-main/models'),
]).then(() => {
    console.log('Modelos cargados correctamente');
    cargarCamera();
}).catch(err => {
    console.error('Error al cargar los modelos:', err);
});

const enviarAcceso = (evento) => {
    fetch('http://192.168.1.149:8004/api/v1/accesos/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            nombre: 'Axel',
            evento: evento
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Acceso enviado:', data);
        // Mostrar mensaje de éxito en pantalla
        document.getElementById('mensaje').innerHTML = `Acceso enviado con éxito: ${evento}`;
    })
    .catch(error => {
        console.error('Error al enviar acceso:', error);
        // Mostrar mensaje de error en pantalla
        document.getElementById('mensaje').innerHTML = `Error al enviar acceso: ${error.message}`;
    });
};

elVideo.addEventListener('play', async () => {
    const context = canvas.getContext('2d');

    const displaySize = { width: elVideo.videoWidth, height: elVideo.videoHeight };
    faceapi.matchDimensions(canvas, displaySize);

    setInterval(async () => {
        const detections = await faceapi.detectAllFaces(elVideo, new faceapi.SsdMobilenetv1Options())
            .withFaceLandmarks()
            .withFaceExpressions()
            .withAgeAndGender()
            .withFaceDescriptors();

        const resizedDetections = faceapi.resizeResults(detections, displaySize);

        // Limpiar el canvas
        context.clearRect(0, 0, canvas.width, canvas.height);

        // Dibujar solo el cuadro alrededor del rostro detectado
        if (resizedDetections.length > 0 && !deteccionEnviada) {
            resizedDetections.forEach(detection => {
                const box = detection.detection.box;
                new faceapi.draw.DrawBox(box, { label: 'Rostro Detectado' }).draw(canvas);
                
                enviarAcceso(eventoEntrada ? 'entrada' : 'salida');
                deteccionEnviada = true; // Marcar como enviado
                eventoEntrada = !eventoEntrada; // Alternar entre entrada y salida
            });
        } else if (resizedDetections.length === 0) {
            deteccionEnviada = false; // Restablecer la bandera si no hay detecciones
        }
    }, 1000); // Intervalo de detección (cada 1 segundo)
});
