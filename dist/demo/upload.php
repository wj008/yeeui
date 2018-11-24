<?php

if (is_array($_FILES["filedata"]["error"])) {
    foreach ($_FILES["filedata"]["error"] as $error) {
        if ($error) {
            echo '{"status": false,"mag": "上传失败"}';
            exit;
        }
    }
}

if (is_array($_FILES["filedata"]["tmp_name"]) && is_array($_FILES["filedata"]["name"])) {
    $data = [];
    foreach ($_FILES["filedata"]["tmp_name"] as $key => $temp) {
        if (isset($_FILES["filedata"]["name"][$key])) {
            move_uploaded_file($temp, "upload/" . $_FILES["filedata"]["name"][$key]);
            array_push($data, ['url' => '/beacon-standard/www/yeeui/dist/demo/upload/' . $_FILES["filedata"]["name"][$key]]);
        }
    }
    echo json_encode([
        "status" => true,
        "mag" => "上传成功",
        "data" => $data
    ]);
    exit;
} else {
    move_uploaded_file($_FILES["filedata"]["tmp_name"], "upload/" . $_FILES["filedata"]["name"]);
    $data = ['url' => '/beacon-standard/www/yeeui/dist/demo//upload/' . $_FILES["filedata"]["name"]];
    echo json_encode([
        "status" => true,
        "mag" => "上传成功",
        "data" => $data
    ]);
}

