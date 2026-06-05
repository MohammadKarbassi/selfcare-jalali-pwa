<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
$n = preg_replace("/\D/", "", $_GET["n"] ?? "");
if (!$n || strlen($n) > 20) { echo json_encode(["error" => "invalid"]); exit; }
try {
    require_once __DIR__ . "/include/ost-config.php";
    $pdo = new PDO("mysql:host=" . DBHOST . ";dbname=" . DBNAME . ";charset=utf8", DBUSER, DBPASS);
    $stmt = $pdo->prepare("SELECT t.number, ts.name as status FROM ost_ticket t JOIN ost_ticket_status ts ON t.status_id=ts.id WHERE t.number=? LIMIT 1");
    $stmt->execute([$n]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    echo $row
        ? json_encode(["number" => $row["number"], "status" => strtolower($row["status"])])
        : json_encode(["error" => "not found"]);
} catch (Exception $e) {
    echo json_encode(["error" => "db"]);
}
