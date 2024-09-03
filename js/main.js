// ELEMENTS
const input = document.querySelector("#archivos_inp");
const upload_btn = document.querySelector(".upload");

// EVENTS
upload_btn.addEventListener("click", e => {
    input.click();
});

input.addEventListener("change", e => {
    e.preventDefault();
    const archivos = e.target.files;
    cargarArhivos(archivos);
});

// FUNCIONES
function cargarArhivos(files) {
    for (const file of files) {
        procesarArchivo(file);
    }
}

function procesarArchivo(file){
    const name = file.name;
    console.log(name);
    
}