import { get_svg } from "./modules/svg.js"; // Importamos los svg
import { get_size } from "./modules/svg.js"; // Importamos el selector de tamaño segun el vw
import { FileManager } from "./modules/FileManager.js";

const $ = sel => document.querySelector(sel);
const $$ = sel => document.querySelectorAll(sel);

let current_route = "/";

// ELEMENTS
const input = document.querySelector("#archivos_inp");
const upload_btn = document.querySelector(".upload");
const viewer = document.querySelector(".viewer");
const menu_vw = $(".menu_vw");
const gear = $(".gear");
const search = $(".search");

// OBJECTS
const svg = get_svg();
svg._size = get_size();

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

menu_vw.addEventListener("click", HandlerLatMenu);


// FUNCIONES
// Cargamos los iconos
LoadOpcIcons();
// Cargar por primera vez la vault
HandlerChangeOpc(document.querySelector(".options[main]"), "main");

function LoadOpcIcons() {
    // Recuperamos todas las opciones
    const opciones = $$(".options");
    // Iteramos para recuperar el atributo
    opciones.forEach(opc => {
        const attr = opc.getAttributeNames()[0];

        // Añadimos el icono segun el atributo
        opc.insertAdjacentHTML("afterbegin", svg[attr]);
    })
}

function HandlerLatMenu(event) {

    // Verificamos si hemos hecho click en una opcion
    const opcion = event.target.closest(".options");
    // Si no, salimos sin hacer nada.
    if (opcion == null) { return }
    const attr = opcion.getAttributeNames()[0];

    // Quitamos todas las clases selected
    const opciones = $$(".options");
    opciones.forEach(opc => {
        opc.classList.remove("selected");
    })

    HandlerChangeOpc(opcion, attr)
}

function HandlerChangeOpc(option, attr) {

    option.classList.add("selected");

    switch (attr) {
        case "main":
            GetAllInfo("/");
            current_route = "/";
            break;
        case "recycle":
            GetAllInfo(".recycle_bin");
            current_route = ".recycle_bin";
            break;
    }
}

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

    if (current_route.includes(".recycle_bin")) {
        ShowErrors("No se puede subir aquí");
        return;
    }

    const form = new FormData;

    const id = Math.random().toString(32).replace(/0\./, "up-");
    const name = file.name;

    // Si el archivo es demasiado pesado cancelar.
    if (file.size > 200000000) { ShowErrors("Archivo demasiado pesado"); return "" }

    ruta = ruta ?? "/";
    ruta = (ruta == "") ? "/" : ruta;

    const row = `
        <tr>
            <td id="${id}" icon>${svg.loader}</td>
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
        if (data[0] !== "OK") {
            ShowErrors(data[0]);
        }
        // Recuperamos el elemento que se ha subido;
        const load = document.querySelector(`#${data[1]}`);

        // Quitamos la animacion y cambiamos el icon
        load.classList.remove("loader");
        svg._color = "35bcbf";
        load.innerHTML = svg[data[2]];
        GetAllInfo(current_route)
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

    svg._color = "90f6d7";

    let extra = "";
    if (current_route !== "/" && current_route !== ".recycle_bin") {
        extra = `
            <tr back colspan="3">
                <td>${svg.back}</td>
                <td>Retroceder</td>
            </tr>
        `;
    }

    let table = `
        <table class="content">
        <thead>
            <th colspan="5">${current_route}</th>
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
            attr = "file";
        }
        // Icono segun tipo de archivo
        const icon = svg[ar[0]];

        // Color of icons
        svg._color = "000000";

        const download = (current_route.includes(".recycle_bin"))
            ? ""
            : `<td down class="act_btn">${svg.download}</td>`;

        table += `
            <tr ${attr}>
                <td icon>${icon}</td>
                <td name>${ar[1]}</td>
                <td del class="act_btn">${svg.trash}</td>
                ${download}
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

    // Obtenemos los archivos
    const archivos = $$("tr[file] td[name]");

    // Asginamos el evento
    archivos.forEach(archivo => {
        archivo.addEventListener("click", async event => {
            // Procesamos la petición
            const res = await FileManager.Load(event, current_route)

            // Si hay un error lo mostramos
            if (!res.status === "OK") {
                ShowErrors(res.message);
                return;
            }

            ProcessIMG(res.data);
        });
    })

    // Obtenemos los botones de borrar
    const delBtns = $$("td[del]");

    // Asignamos el evento
    delBtns.forEach(boton => {
        boton.addEventListener("click", Delete);
    });

    // Obtemos las carpetas
    const folders = viewer.querySelectorAll("tr[folder]");

    // Asignamos el nuevo path y recargamos
    folders.forEach(folder => {
        const td = folder.querySelector("td[name]");

        td.addEventListener("click", e => {
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
    // Evitamos que se cambie el nombre en la papelera
    if (current_route.includes(".recycle_bin")) {
        return;
    }

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

function Delete(event) {
    const padre = event.target.closest("tr");
    const name = padre.querySelector("td[name]").textContent;


    const form = new FormData;

    if (current_route.includes(".recycle_bin")) {
        Delete_def(padre, name);
        return;
    }
    form.append("arg", "delete");

    form.append("name", name);
    form.append("ruta", current_route);

    fetch("php/files.php", {
        method: "POST",
        body: form
    }).then(response => {
        if (response.ok) {
            return response.json();
        }
    }).then(data => {
        if (data == "OK") {
            padre.remove();
        } else {
            ShowErrors(data);
        }
    });
}

function Delete_def(padre, name) {
    const accept = () => {
        // Generamos el form
        const form = new FormData;
        form.append("arg", "delete_def");
        form.append("name", name);
        form.append("ruta", current_route);

        fetch("php/files.php", {
            method: "POST",
            body: form
        }).then(response => {
            if (response.ok) {
                return response.json();
            }
        }).then(data => {
            cancel();
            if (data === "OK") {
                padre.remove();
            } else {
                ShowErrors(data);
            }
        });
    }

    const cancel = () => {
        $(".aviso").remove();
    }

    // Creamos el aviso
    const div = `
        <div class="aviso">
            ${svg.alert}
            <p>Esta acción no se puede deshacer</p>
            <div class="buttons">
                <button class="accept">Aceptar</button>
                <button class="cancel">Cancelar</button>
            </div>
        </div>
    `;

    // Si ya hay uno lo borramos
    if ($(".aviso")) {
        cancel();
    }



    // Lo mostramos
    viewer.insertAdjacentHTML("afterbegin", div);

    // Añadimos los eventos para los botones
    $(".aviso .accept").addEventListener("click", accept);
    $(".aviso .cancel").addEventListener("click", cancel);

}

function ProcessIMG(data) {

    const { width, height, src } = data

    // Borramos el display si ya estaba
    if($(".display")){
        $(".display").remove();
    }

    // Creamos el display con la imagen
    const display = `
        <div class="display">
            <img 
                class="image"
                src="${src}"
                alt="Image viewer"
            />
        </div>
    `;

    // Creamos el fondo para el eventListener
    const back = `
        <div class="back"></div>
    `;

    // Añadimos ambos al documento
    $(".main").insertAdjacentHTML("afterbegin",back);
    $(".main").insertAdjacentHTML("afterbegin",display);

    // Creamos el evento para borrar ambas cosas
    $(".back").addEventListener("click", e =>{
        $(".display").remove();
        e.target.remove();
    });
    


}

function Set_Options() {
    if (current_route.includes(".recycle_bin")) {
        // Quitar la opción de nueva carpeta
        return
    }

    const html = `
        <tr class="options_table">
            <th>
                
            </th>
        </tr>
    `;

}