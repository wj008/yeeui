<?php
$username = isset($_POST['username']) ? $_POST['username'] : '';
if ($username == 'wj008') {
    echo '{"status": false,"error": "用户名已经存在"}';
} else {
    echo '{"status": true,"message": "用户名可以使用"}';
}