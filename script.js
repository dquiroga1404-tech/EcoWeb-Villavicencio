function cargarArbolEnFormulario(codigoQR) {
    const selectorQR = document.getElementById('select-qr');
    selectorQR.value = codigoQR;
    document.getElementById('reportar').scrollIntoView({ behavior: 'smooth' });
    document.getElementById('select-estado').focus();
}
function filtrarSector(sectorSeleccionado, botonPresionado) {
    const tarjetas = document.querySelectorAll('.tree-card');
    const botones = document.querySelectorAll('.btn-filter');
    botones.forEach(btn => btn.classList.remove('active'));
    botonPresionado.classList.add('active');
    tarjetas.forEach(tarjeta => {
        const sectorArbol = tarjeta.getAttribute('data-sector');
        if (sectorSeleccionado === 'todos' || sectorArbol === sectorSeleccionado) {
            tarjeta.style.display = 'flex';
        } else {
            tarjeta.style.display = 'none';
        }
    });
}
const btnGPS = document.getElementById('btn-obtener-gps');
const inputLatitud = document.getElementById('input-latitud');
const inputLongitud = document.getElementById('input-longitud');
btnGPS.addEventListener('click', function() {
    if ("geolocation" in navigator) {
        btnGPS.textContent = "⏳ Obteniendo coordenadas...";
        navigator.geolocation.getCurrentPosition(
            function(posicion) {
                inputLatitud.value = posicion.coords.latitude.toFixed(6);
                inputLongitud.value = posicion.coords.longitude.toFixed(6);
                btnGPS.textContent = "✅ Ubicación capturada";
                btnGPS.style.backgroundColor = "#DCFCE7";
            },
            function(error) {
                alert("⚠️ Error al obtener ubicación. Asegúrate de dar permisos de GPS a la página.");
                btnGPS.textContent = "📍 Reintentar ubicación";
            }
        );
    } else {
        alert("Tu navegador no soporta geolocalización.");
    }
});
const formulario = document.getElementById('form-reporte-arbol');
const cajaMensaje = document.getElementById('mensaje-validacion');
const listaBitacora = document.getElementById('lista-bitacora');
document.addEventListener('DOMContentLoaded', cargarReportesGuardados);
formulario.addEventListener('submit', function(evento) {
    evento.preventDefault();
    const codigoQR = document.getElementById('select-qr').value;
    const nuevoEstado = document.getElementById('select-estado').value;
    const voluntario = document.getElementById('input-voluntario').value.trim();
    const observacion = document.getElementById('input-observacion').value.trim();
    const lat = inputLatitud.value;
    const lon = inputLongitud.value;
    if (codigoQR === "" || nuevoEstado === "" || voluntario === "" || observacion === "") {
        cajaMensaje.textContent = "⚠️ Por favor completa los campos principales del árbol y tu nombre.";
        cajaMensaje.className = "alert-box alert-error";
        return;
    }
    if (lat === "" || lon === "") {
        cajaMensaje.textContent = "⚠️ Faltan las coordenadas GPS. Presiona el botón de 'Obtener mi ubicación'.";
        cajaMensaje.className = "alert-box alert-error";
        return;
    }
    actualizarTarjetaArbol(codigoQR, nuevoEstado, observacion);
    guardarReporteEnMemoria(codigoQR, nuevoEstado, voluntario, observacion, lat, lon);
    cajaMensaje.textContent = "✅ ¡Reporte guardado! Ficha " + codigoQR + " actualizada con éxito.";
    cajaMensaje.className = "alert-box alert-success";
    formulario.reset();
    inputLatitud.value = "";
    inputLongitud.value = "";
    btnGPS.textContent = "📍 Obtener mi ubicación actual";
    btnGPS.style.backgroundColor = "transparent";
});
function actualizarTarjetaArbol(codigoQR, nuevoEstado, observacion) {
    const etiquetaEstado = document.getElementById('status-' + codigoQR);
    if(etiquetaEstado) {
        etiquetaEstado.textContent = nuevoEstado;
        if (nuevoEstado === "Sano") {
            etiquetaEstado.className = "status-pill status-sano";
        } else if (nuevoEstado === "Requiere Riego") {
            etiquetaEstado.className = "status-pill status-riego";
        } else {
            etiquetaEstado.className = "status-pill status-alerta";
        }
        const textoNota = document.getElementById('nota-' + codigoQR);
        if(textoNota) textoNota.textContent = observacion;
    }
}
function guardarReporteEnMemoria(qr, estado, voluntario, obs, lat, lon) {
    let reportes = JSON.parse(localStorage.getItem('ecoweb_reportes')) || [];
    const nuevoReporte = {
        qr: qr,
        estado: estado,
        voluntario: voluntario,
        observacion: obs,
        lat: lat,
        lon: lon,
        fecha: new Date().toLocaleDateString()
    };
    reportes.push(nuevoReporte);
    localStorage.setItem('ecoweb_reportes', JSON.stringify(reportes));
    agregarItemABitacora(nuevoReporte);
}
function cargarReportesGuardados() {
    let reportes = JSON.parse(localStorage.getItem('ecoweb_reportes')) || [];
    if(reportes.length > 0) {
        listaBitacora.innerHTML = ''; 
        reportes.forEach(reporte => {
            actualizarTarjetaArbol(reporte.qr, reporte.estado, reporte.observacion);
            agregarItemABitacora(reporte);
        });
    }
}
function agregarItemABitacora(reporte) {
    const nuevoItem = document.createElement('li');
    nuevoItem.className = 'log-item';
    nuevoItem.innerHTML = `<span class="log-tag">${reporte.qr}</span> <strong>${reporte.voluntario}</strong> [${reporte.estado}]: ${reporte.observacion} <br><small style="color:gray;">📍 Coordenadas: ${reporte.lat}, ${reporte.lon} | 🗓️ ${reporte.fecha}</small>`;
    listaBitacora.prepend(nuevoItem);
}