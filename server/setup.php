<?php
  // Make sure the folder db is writable by the web/php-process
  $connection = new SQLite3('./db/variants.db');

  $connection->exec("CREATE TABLE IF NOT EXISTS variations (id INTEGER PRIMARY KEY AUTOINCREMENT, name text NOT NULL, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP, filename text NOT NULL)");
  $connection->close();
  unset($connection);

  echo 'Database successfully created.';
?>