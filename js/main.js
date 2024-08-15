const drag = document.querySelector(".drag_zone");
const subidos = document.querySelector(".subidos");
const boton = document.querySelector(".btn_add");
const input = document.getElementById("inp");

boton.addEventListener("click", e => {
    e.preventDefault();
    input.click();
});

input.addEventListener("change", e => {
    e.preventDefault();
    const archivos = e.target.files;
    cargarArchivo(archivos);
});

drag.addEventListener("dragover", e => {
    e.preventDefault();
    drag.classList.add("over");
    drag.firstElementChild.textContent = "Suelte los archivos";
});

drag.addEventListener("dragleave", e => {
    e.preventDefault();
    drag.classList.remove("over");
    drag.firstElementChild.textContent = "Arrastre los archivos";
});

drag.addEventListener("drop", e => {
    e.preventDefault();
    drag.classList.remove("over");
    drag.firstElementChild.textContent = "Arraste los archivos";

    const archivo = e.dataTransfer.files;
    cargarArchivo(archivos);
});

function cargarArchivo(files) {
    for (const file of files) {
        procesar(file);
    }
}

function procesar(file) {
    const name = file.name;
    const tipo = file.type;

    const url = URL.createObjectURL(file);

    const div = `
        <div class="upload">
        <img src="${url}" width="80px" height="50px ">
        <p><b>Nombre:</b> ${name}</p>
        <p><b>Tipo:</b> ${tipo}</p>
        </div>
        `;

    subidos.insertAdjacentHTML("afterbegin", div);

    subirArchivo(file);

    URL.revokeObjectURL(url);
}

function subirArchivo(file){

    const form = new FormData();
    form.append("archivo", file);

    fetch("php/app.php",{
        method: "POST",
        body: form
    }).then(response => {
        if(response.ok){
            return response.json();
        }
    }).then(data =>{
        console.log(data);
    });

}