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

// Evento menu lateral
menu_vw.addEventListener("click", HandlerLatMenu);


// FUNCIONES
// Cargamos los iconos del menu lateral
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

    // Manejamos la seleccion de opciones
    HandlerChangeOpc(opcion, attr)
}

function HandlerChangeOpc(option, attr) {

    // Seleccionamos la opcion
    option.classList.add("selected");

    // Cambiamos la ruta y establecemos el contenido
    switch (attr) {
        case "main":
            GetAllInfo("/");
            current_route = "/";
            break;
        case "recycle":
            GetAllInfo(".recycle_bin");
            current_route = ".recycle_bin";
            break;
        case "shared":
            viewer.innerHTML = `<h1 style="color:var(--green)">Trabajando en ello...</h1>`;
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

    // Validamos si estamos en recycle
    if (current_route.includes(".recycle_bin")) {
        ShowErrors("No se puede subir aquí");
        return;
    }

    // Instanciamos un form
    const form = new FormData;

    // Creamos el ID y obtenemos el nombre
    const id = Math.random().toString(32).replace(/0\./, "up-");
    const name = file.name;

    // Si el archivo es demasiado pesado cancelar.
    if (file.size > 200000000) { ShowErrors("Archivo demasiado pesado"); return "" }

    // Validamos la ruta
    ruta = ruta ?? "/";
    ruta = (ruta == "") ? "/" : ruta;

    // Creamos la linea temporal
    const row = `
        <tr>
            <td id="${id}" icon>${svg.loader}</td>
            <td name>${name}</td>
        </tr>
    `;

    // Obtenemos el tbody y el retroceder path
    const tbody = document.querySelector(".content tbody");
    const back = tbody.querySelector("tr[back]");

    // Si hay retroceder path lo añadimos despues de este
    // sino el primero del tbody
    if (back) {
        back.insertAdjacentHTML("afterend", row);
    } else {
        tbody.insertAdjacentHTML("afterbegin", row);
    }

    // Añadimos los parametros al form
    form.append("arg", "upload");

    form.append("archivo", file);
    form.append("id", id);
    form.append("ruta", ruta);

    // Enviamos al server y procesamos
    fetch("php/files.php", {
        method: "POST",
        body: form
    }).then(response => {
        if (response.ok) {
            return response.json();
        }
    }).then(data => {
        // Si hay errores los mostramos y eliminamos el elemento temporal
        if (data[0] !== "OK") {
            ShowErrors(data[0]);
            $(`#${data[1]}`).remove();
        }
        // Recuperamos el elemento que se ha subido;
        const load = document.querySelector(`#${data[1]}`);

        // Quitamos la animacion y cambiamos el icon
        load.classList.remove("loader");
        svg._color = "35bcbf";
        load.innerHTML = svg[data[2]];

        // Recargamos el path
        GetAllInfo(current_route)
    });
}

function GetAllInfo(ruta) {
    // Creamos instancia del form
    const form = new FormData;

    ruta = ruta ?? "/"; // Sino hay parametro => raiz
    ruta = (ruta == "") ? "/" : ruta; //Si es un campo vacio => raiz

    // Añadimos los campos
    form.append("arg", "getAll");
    form.append("ruta", ruta);

    // Enviamos la peticion al server y la procesamos
    fetch("php/files.php", {
        method: "POST",
        body: form
    }).then(response => {
        if (response.ok) {
            return response.json();
        }
    }).then(data => {
        // Si hay un error lo mostramos
        if (data[0] == "error") {
            ShowErrors(data[1])
            return;
        };
        ProcessData(data)
    });
}

function ProcessData(array) {
    // Limpiamos el viewer
    viewer.innerHTML = "";

    // Inicializamos variables y ponemos el color del svg
    svg._color = "90f6d7";
    let extra = "";

    // Si estamos en un subdirectorio que aparezca la
    // opción de retroceder un path
    if (current_route !== "/" && current_route !== ".recycle_bin") {
        extra = `
            <tr back>
                <td icon>${svg.back}</td>
                <td>Retroceder</td>
                <td></td>
            </tr>
        `;
    }

    // Creamos el thead de la tabla con la ruta
    // y las opciones
    let table = `
        <table class="content">
        <thead>
            ${Set_Options()}
            <th class="route_display" colspan="5">${current_route}</th>
        </thead>    
        <tbody>
        ${extra}
    `;

    // Iteramos por cada elemento recuperado
    array.forEach(ar => {
        let attr = "";

        // Asignamos el tipo en funcion de si es una carpeta o no
        if (ar[0] == "folder") {
            attr = "folder";
            svg._color = "263849";
        } else {
            svg._color = "35bcbf";
            attr = "file";
        }
        svg._size = "30px";

        // Get icon by type
        const icon = svg[ar[0]];

        // Set default color for icons
        svg._color = "000000";

        // Icono segun tipo de archivo
        const download = (current_route.includes(".recycle_bin"))
            ? ""
            : `<td down class="act_btn">${svg.download}</td>
        `;

        // Añadimos el elemento a la tabla
        table += `
            <tr ${attr}>
                <td icon>${icon}</td>
                <td name>${ar[1]}</td>
                <td del class="act_btn">${svg.trash}</td>
                ${download}
            </tr>
        `;
    });

    // Cerramos la tabla
    table += `</tbody></table>`;

    // Insertamos la tabla
    viewer.insertAdjacentHTML("afterbegin", table);

    // Creamos el evento para retroceder un path
    const back = viewer.querySelector("tr[back]");
    if (back) {
        back.addEventListener("click", retrocederPath)
    }

    // Evento para renombrar
    document.querySelector(".content").addEventListener("dblclick", RenameItem);

    // Obtenemos los archivos
    const archivos = $$("tr[file] td[name]");

    // Evento para mostrar el display
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

    // Evento para borrar archivos
    delBtns.forEach(boton => {
        boton.addEventListener("click", Delete);
    });

    // Obtemos las carpetas
    const folders = viewer.querySelectorAll("tr[folder]");

    // Evento para camabiar direcorio
    folders.forEach(folder => {
        const td = folder.querySelector("td[name]");

        td.addEventListener("click", e => {
            current_route += (current_route === "/") ? td.textContent : `/${td.textContent}`;
            GetAllInfo(current_route);
        });

    });

    // Evento para crear carpetas
    if ($(".new_folder")) {
        $(".new_folder").addEventListener("click", CreateNewFolder);
    }
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

    // Evento para eliminar el input
    inp.addEventListener("keydown", e => {
        if (e.key === "Escape" || e.key === "Enter") {
            inp.blur();
        }
    });

    // Borramos el input
    inp.addEventListener("blur", Inputhandler);
}

function RenameItemServer(new_name, old_name) {
    // Instanciamos un form
    const form = new FormData;

    // Añadimos parámetros
    form.append("arg", "rename");

    form.append("new_name", new_name);
    form.append("old_name", old_name);
    form.append("ruta", current_route);

    // Enviamos la peticion
    fetch("php/files.php", {
        method: "POST",
        body: form
    }).then(response => {
        if (response.ok) {
            return response.json();
        }
    }).then(data => {
        // Si hay error lo mostramos
        if (data != "OK") {
            ShowErrors(data);
        }
    });
}

function ShowErrors(error) {
    // Recuperamos el route display
    const th = document.querySelector(".route_display");

    // Mostramos el error y añadimos la clase error
    th.textContent = error;
    th.classList.add("error");

    // Devolvemos la ruta a la actual y eliminamos la clase error
    setTimeout(() => {
        th.textContent = current_route;
        th.classList.remove("error");
    }, 3000)
}

function Delete(event) {
    // Obtenemos el padre y el nombre del archivo
    const padre = event.target.closest("tr");
    const name = padre.querySelector("td[name]").textContent;

    // Instanciamos un form
    const form = new FormData;

    // Si estamos en recycle borramos definitivamente
    if (current_route.includes(".recycle_bin")) {
        Delete_def(padre, name);
        return;
    }

    // Añadimos los parámetros 
    form.append("arg", "delete");

    form.append("name", name);
    form.append("ruta", current_route);

    // Realizamos la petición
    fetch("php/files.php", {
        method: "POST",
        body: form
    }).then(response => {
        if (response.ok) {
            return response.json();
        }
    }).then(data => {
        if (data == "OK") {
            // Si salió bien podemos borrar el padre
            padre.remove();
        } else {
            // Sino mostramos el error
            ShowErrors(data);
        }
    });
}

function Delete_def(padre, name) {
    // Comportamiento para el boton de aceptar del aviso
    const accept = () => {
        // Instanciamos y parametrizamos el form
        const form = new FormData;
        form.append("arg", "delete_def");
        form.append("name", name);
        form.append("ruta", current_route);

        // Realizamos la request
        fetch("php/files.php", {
            method: "POST",
            body: form
        }).then(response => {
            if (response.ok) {
                return response.json();
            }
        }).then(data => {
            cancel(); // Borramos el aviso
            if (data === "OK") {
                padre.remove(); // Borramos el padre
            } else {
                ShowErrors(data); // Mostramos errores si habían
            }
        });
    }

    const cancel = () => {
        $(".aviso").remove(); // Borramos el aviso
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

function ProcessIMG(image) {

    // Recuperamos el src de la imagen
    const { src } = image

    // Borramos el display si ya estaba
    if ($(".display")) {
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
    $(".main").insertAdjacentHTML("afterbegin", back);
    $(".main").insertAdjacentHTML("afterbegin", display);

    // Creamos el evento para borrar ambas cosas
    $(".back").addEventListener("click", e => {
        $(".display").remove();
        e.target.remove();
    });
}

function Set_Options() {
    // Si estamos en recycle no devolvemos nada
    if (current_route.includes(".recycle_bin")) {
        return "";
    }

    // Sino devolvemos la opcion de crear una carpeta
    return `
        <th class="new_folder">${svg.new_folder}</th>
    `;
}

function CreateNewFolder(event) {
    // Creamos un id
    const id = Math.random().toString(32).replace(/0\./, "tmp-");

    // icon settings
    svg._color = "263849";
    svg._size = "30px";

    // Creamos la nueva fila
    const row = `
        <tr folder id="${id}">
            <td icon>${svg.folder_open}</td>
            <td><input class="rename_inp folder" type="text"></td>
        </tr>
    `;
    // Obtenemos el tbody y el retroceder path
    const tbody = document.querySelector(".content tbody");
    const back = tbody.querySelector("tr[back]");

    // Si hay retroceder path lo añadimos despues de este
    // sino el primero del tbody
    if (back) {
        back.insertAdjacentHTML("afterend", row);
    } else {
        tbody.insertAdjacentHTML("afterbegin", row);
    }

    // Recuperamos los elementos
    const tr = $(`#${id}`);
    const input = tr.querySelector("input");

    // Hacemos focus en el elemento
    input.focus();

    // Hacemos blur cuando se haga enter o escape
    input.addEventListener("keydown", e => {
        if (e.key === "Enter" || e.key === "Escape") {
            input.blur();
        }
    });

    // Validamos el nombre
    input.addEventListener("blur", ValidateNewFolder);
}

function ValidateNewFolder(event) {
    // Recuperamos elementos
    const input = event.target;
    const tr = input.parentElement.parentElement;

    const NewFolder = input.value;

    // Validamos nully
    if (NewFolder === "" || NewFolder === null) {
        ShowErrors("El nombre no puede estar en blanco");
        tr.remove();
        return;
    }

    // Validamos caracteres especiales
    const banned_chars = ["<", ">", "/", "|", "*", "?", " ", "\\", "."];

    if (banned_chars.some(char => NewFolder.includes(char))) {
        ShowErrors("Caracteres inválidos");
        tr.remove();
        return;
    }

    // Enviamos al servidor
    SendNewFolder(NewFolder, tr);
}

function SendNewFolder(name, padre) {
    // Instanciamos y parametrizamos un form
    const form = new FormData;

    form.append("arg", "create_folder");

    form.append("name", name);
    form.append("ruta", current_route);

    fetch("./php/files.php", {
        method: "POST",
        body: form
    }).then(response => {
        if (response.ok) {
            return response.json();
        }
    }).then(data => {
        if (data === "OK") {
            GetAllInfo(current_route);
        } else {
            padre.remove();
            ShowErrors(data);
        }
    });
}