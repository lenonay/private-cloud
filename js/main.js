const drag = document.querySelector(".drag_zone");
const subidos = document.querySelector(".subidos");
const boton = document.querySelector(".btn_add");
const input = document.getElementById("inp");
const btn = document.querySelector(".bloque");
const menu = document.querySelector(".menu");

btn.addEventListener("click", e =>{
    menu.classList.toggle("desplegado");
});

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
    const id = Math.random().toString(32).replace(/0\./,"");

    const url = URL.createObjectURL(file);

    const div = `
        <div class="upload">
            <img src="${url}" width="60px" height="50px ">
            <p>${name}</p>
            <div id="${id}">
                <div class="loader"></div>
            </div>
        </div>
    `;

    subidos.insertAdjacentHTML("afterbegin", div);

    subirArchivo(file,id);

    URL.revokeObjectURL(url);
}

function subirArchivo(file, id){

    const form = new FormData();
    form.append("archivo", file);
    form.append("id", id);

    fetch("php/app.php",{
        method: "POST",
        body: form
    }).then(response => {
        if(response.ok){
            return response.json();
        }
    }).then(data =>{
        if(data !== null){
            const load = document.getElementById(data);
            load.firstElementChild.remove();
            load.innerHTML = "<p>OK</p>";
        }
    });

}