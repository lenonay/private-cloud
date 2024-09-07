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
            ShowErrors(data[0]);
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
        if (data[0] == "error") ShowErrors(data[1]);
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

    document.querySelector(".content").addEventListener("dblclick", RenameItem);

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

function RenameItem(event) {
    let new_name = "";

    const Inputhandler = () => {
        // Si esta vacío se queda el anterior y obtenemos el nombre
        if (inp.value == "") {
            new_name = `${basename}${extension}`;
        } else {
            new_name = `${inp.value}${extension}`;
            RenameItemServer(new_name, old_name);
        }
        // Borramos el input y actualizamos el valor en el cliente
        inp.remove();
        name.textContent = new_name;
    }

    const name = event.target.closest("td[name]");
    // Si se hace click sobre otra cosa salimos 
    if (!name) return;

    const re = /\..*/;

    // Obtenemos la extension y el nombre para evitar problemas
    const extension = name.textContent.match(re)[0];
    const basename = name.textContent.replace(re, "");
    const old_name = `${basename}${extension}`;

    // Creamos el input y lo mostramos
    const inp_html = `<input class="rename_inp" type="text" name="rename" value="${basename}"/>`;
    name.insertAdjacentHTML("afterbegin", inp_html);

    const inp = document.querySelector(".rename_inp");
    // Cuando se le de click ENTER obtenemos el valor o focusoff
    inp.focus();
    inp.select(0, inp.value.length)

    inp.addEventListener("keydown", e => {
        if (e.key === "Escape" || e.key === "Enter") {
            inp.blur();
        }
    });

    // Borramos el input
    inp.addEventListener("blur", Inputhandler);
}

function RenameItemServer(new_name, old_name) {
    const form = new FormData;

    form.append("arg", "rename");

    form.append("new_name", new_name);
    form.append("old_name", old_name);
    form.append("ruta", current_route);

    fetch("php/files.php", {
        method: "POST",
        body: form
    }).then(response => {
        if (response.ok) {
            return response.json();
        }
    }).then(data => {
        if (data != "OK") {
            ShowErrors(data);
        }
    });
}

function ShowErrors(error) {
    const th = document.querySelector(".content thead th");

    th.textContent = error;
    th.classList.add("error");

    setTimeout(() => {
        th.textContent = current_route;
        th.classList.remove("error");
    }, 3000)
}