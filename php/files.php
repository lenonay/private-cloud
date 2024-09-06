<?php
require "base.php";

if($_SERVER['REQUEST_METHOD'] !== "POST"){
    echo json_encode("Método no soportado");
    exit();
}

if(!isset($_POST["arg"])){
    echo json_encode("Faltan campos importantes");
    exit();
}

$arg = htmlspecialchars($_POST["arg"]);

$File = new File;

switch($arg){
    case "upload":
        echo json_encode($File->Upload(
            $_FILES["archivo"],
            htmlspecialchars($_POST["id"]),
            htmlspecialchars($_POST["ruta"])
        ));
        exit();
    case "getAll":
        echo json_encode($File->GetAll(
            htmlspecialchars($_POST["ruta"])
        ));
        exit();
    case "getIMG":
        echo json_encode($File->getIMG(
            htmlspecialchars($_POST["name"]),
            htmlspecialchars($_POST["id"]),
            htmlspecialchars($_POST["ruta"])
        ));
        exit();
    default:
        return json_encode(["Argumento erróneo"]);
}