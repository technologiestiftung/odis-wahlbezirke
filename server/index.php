<?php
  
  header('Access-Control-Allow-Origin: *');
  header('Access-Control-Allow-Methods: GET, POST');
  header("Access-Control-Allow-Headers: X-Requested-With");

  $connection = new SQLite3('./db/variants.db');

  if($_GET['action'] == 'list') {

    $result = $connection->query("SELECT * FROM variations ORDER BY id ASC");
    $data = array();
    while ($row = $result->fetchArray()) {
      array_push($data, array(
        "id" => $row["id"],
        "name" => $row["name"],
        "timestamp" => $row["timestamp"],
        "filename" => $row["filename"]
      ));
    }
    header('Content-Type: application/json');
    echo json_encode($data);

  } elseif ($_GET['action'] == 'save') {

    $count = 0;
    $result = $connection->query("SELECT COUNT(*) FROM variations");
    while ($row = $results->fetchArray()) {
      $count = intval($row[0]);
    }

    // To protect the server against again fraud we stop saving after receiving 500 models
    if ($count < 500) {
      $uuid = uniqid();
      
      $stmt = $db->prepare('INSERT INTO variations (name, filename) VALUES (:name, :filename)');
      $stmt->bindValue(':name', $_POST['name'], SQLITE3_STRING);
      $stmt->bindValue(':filename', $uuid.'.json', SQLITE3_STRING);
      $result = $stmt->execute();

      $json = array();

      $blocks = explode(';', $_POST['blocks']);
      foreach ($blocks as $block){
        $values = explode(':', $block);
        // Making sure notbody sends bad stuff before saving
        $block_str_int = strval(intval($values[0]));
        $district_str_int = strval(intval($values[1]));
        while (strlen($block_str_int) < 6) { $block_str_int = '0'.$block_str_int; }
        while (strlen($district_str_int) < 5) { $district_str_int = '0'.$district_str_int; }
        $json[$block_str_int] = $district_str_int;
      }

      file_put_contents('./data/'.$uuid.'.json', json_encode($json));
    } else {
      http_response_code(400);
      echo 'Sorry, server is full, no more variations allowed.';

    }

  } else {

    http_response_code(404);
    echo 'Sorry, action not found.';

  }

  $connection->close();
  unset($connection);

?>