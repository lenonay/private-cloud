import { get_svg } from "./svg.js"; // Importamos el svg para que no ocupe medio codigo

const $ = sel => document.querySelector(sel);
const $$ = sel => document.querySelectorAll(sel);

let current_route = "/";

// ELEMENTS
const input = document.querySelector("#archivos_inp");
const upload_btn = document.querySelector(".upload");
const viewer = document.querySelector(".viewer");
const gear = $(".gear");
const search = $(".search");

// OBJECTS
const svg = get_svg();

// EVENTS
upload_btn.addEventListener("click", e => {
    input.click();
});

input.addEventListener("change", e => {
    e.preventDefault();
    const archivos = e.target.files;
    cargarArhivos(archivos);
});

viewer.addEventListener("dragover", e => {
    e.preventDefault();
    viewer.classList.add("drag");
});

viewer.addEventListener("dragleave", e => {
    e.preventDefault();
    viewer.classList.remove("drag");
});

viewer.addEventListener("drop", e => {
    e.preventDefault();
    viewer.classList.remove("drag");
    const archivos = e.dataTransfer.files;
    cargarArhivos(archivos);
});

gear.addEventListener("click", e => {
    GetAllInfo("");
});

search.addEventListener("click", e => {
    alert(current_route);
})


// FUNCIONES
// Cargar por primera vez todas las fotos
GetAllInfo("/");

function cargarArhivos(files) {
    for (const file of files) {
        procesarArchivo(file);
    }
}

function procesarArchivo(file) {
    // Mandarla al servidor
    UploadFile(file, current_route);

}

function UploadFile(file, ruta) {
    const form = new FormData;

    const id = Math.random().toString(32).replace(/0\./, "up-");
    const name = file.name;

    ruta = ruta ?? "/";
    ruta = (ruta == "") ? "/" : ruta;

    const row = `
        <tr>
            <td id=${id} icon class="loader">${svg.loader}</td>
            <td name>${name}</td>
        </tr>
    `;

    const tbody = document.querySelector(".content tbody");
    const back = tbody.querySelector("tr[back]");
    if (back) {
        back.insertAdjacentHTML("afterend", row);
    } else {
        tbody.insertAdjacentHTML("afterbegin", row);
    }

    form.append("arg", "upload");

    form.append("archivo", file);
    form.append("id", id);
    form.append("ruta", ruta);

    fetch("php/files.php", {
        method: "POST",
        body: form
    }).then(response => {
        if (response.ok) {
            return response.json();
        }
    }).then(data => {
        console.log(data);

        if (data[0] !== "OK") {
            console.log(data[0]);
        }
        // Recuperamos el elemento que se ha subido;
        const load = document.querySelector(`#${data[1]}`);

        // Quitamos la animacion y cambiamos el icon
        load.classList.remove("loader");
        svg._color = "35bcbf";
        load.innerHTML = svg[data[2]];

    });
}

function GetAllInfo(ruta) {
    const form = new FormData;

    ruta = ruta ?? "/";
    ruta = (ruta == "") ? "/" : ruta;

    form.append("arg", "getAll");
    form.append("ruta", ruta);

    fetch("php/files.php", {
        method: "POST",
        body: form
    }).then(response => {
        if (response.ok) {
            return response.json();
        }
    }).then(data => {
        ProcessData(data)
    });
}


function ProcessData(array) {
    viewer.innerHTML = "";

    svg._size = "40px";
    svg._color = "90f6d7";

    let extra = "";
    if (current_route !== "/") {
        extra = `
            <tr back>
                <td>${svg.back}</td>
                <td>Retroceder</td>
            </tr>
        `;
    }

    let table = `
        <table class="content">
        <thead>
            <th colspan="2">${current_route}</th>
        </thead>    
        <tbody>
        ${extra}
    `;

    array.forEach(ar => {
        let attr = "";

        if (ar[0] == "folder") {
            attr = "folder";
            svg._color = "263849";
        } else {
            svg._color = "35bcbf";
        }
        const icon = svg[ar[0]];

        table += `
            <tr ${attr}>
                <td icon>${icon}</td>
                <td name>${ar[1]}</td>
            </tr>
        `;
    });

    table += `</tbody></table>`;

    viewer.insertAdjacentHTML("afterbegin", table);

    const back = viewer.querySelector("tr[back]");
    if (back) {
        back.addEventListener("click", retrocederPath)
    }

    const folders = viewer.querySelectorAll("tr[folder]");

    folders.forEach(folder => {
        const td = folder.querySelector("td[name]");

        folder.addEventListener("click", e => {
            current_route += (current_route === "/") ? td.textContent : `/${td.textContent}`;
            GetAllInfo(current_route);
        });

    })
}

function retrocederPath() {
    let split = current_route.split("/");

    // Quitamos el ultimo path
    split.pop();

    // Si es "" indica la home y sino el valor correspondiente
    current_route = (split.join("/") !== "") ? split.join("/") : "/";

    // Cargamos el contenido
    GetAllInfo(current_route);
}