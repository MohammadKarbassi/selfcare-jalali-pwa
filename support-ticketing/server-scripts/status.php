<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

$n = preg_replace("/\D/", "", $_GET["n"] ?? "");
if (!$n || strlen($n) > 20) { echo json_encode(["error" => "invalid"]); exit; }

$cfg = @file_get_contents(__DIR__ . "/include/ost-config.php");
if (!$cfg) { echo json_encode(["error" => "config"]); exit; }

preg_match("/define\s*\(\s*['\"]DBHOST['\"]\s*,\s*['\"]([^'\"]+)['\"]\s*\)/", $cfg, $h);
preg_match("/define\s*\(\s*['\"]DBNAME['\"]\s*,\s*['\"]([^'\"]+)['\"]\s*\)/", $cfg, $d);
preg_match("/define\s*\(\s*['\"]DBUSER['\"]\s*,\s*['\"]([^'\"]+)['\"]\s*\)/", $cfg, $u);
preg_match("/define\s*\(\s*['\"]DBPASS['\"]\s*,\s*['\"]([^'\"]+)['\"]\s*\)/", $cfg, $p);
preg_match("/define\s*\(\s*['\"]TABLE_PREFIX['\"]\s*,\s*['\"]([^'\"]+)['\"]\s*\)/", $cfg, $t);

if (empty($h[1]) || empty($d[1]) || empty($u[1])) { echo json_encode(["error" => "config"]); exit; }

$pfx = $t[1] ?? "ost_";

try {
    $pdo = new PDO("mysql:host={$h[1]};dbname={$d[1]};charset=utf8", $u[1], $p[1] ?? "");
    $stmt = $pdo->prepare(
        "SELECT t.number, ts.name as status
         FROM {$pfx}ticket t
         JOIN {$pfx}ticket_status ts ON t.status_id = ts.id
         WHERE t.number = ? LIMIT 1"
    );
    $stmt->execute([$n]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    echo $row
        ? json_encode(["number" => $row["number"], "status" => strtolower($row["status"])])
        : json_encode(["error" => "not found"]);
} catch (Exception $e) {
    echo json_encode(["error" => "db"]);
}
