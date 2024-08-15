<?php
$root = $_SERVER['DOCUMENT_ROOT'];
require $root."/vendor/autoload.php";
use Dotenv\Dotenv;

$dotenv = Dotenv::createImmutable($root);
$dotenv->load();

if($_SERVER['REQUEST_METHOD'] == "POST"){
    echo json_encode(subirArchivo($_FILES["archivo"]));
}

function subirArchivo($archivo){
    $mime = $archivo["type"];
    $nombre = $archivo["name"];

    $tmp_dir = $archivo["tmp_name"];
    $base = $_ENV["ruta"];

    $tipo = explode("/",$mime)[0];

    switch($tipo){
        case "image":
            $nueva_ruta = "$base/image/$nombre";
            break;
        case "video":
            $nueva_ruta = "$base/vids/$nombre";
            break;
        case "application":
            $nueva_ruta = "$base/documents/$nombre";
            break;
        default: 
            $nueva_ruta = "$base/otros/$nombre";
            break;
    }

    move_uploaded_file($tmp_dir, $nueva_ruta);
}