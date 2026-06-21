<?php
require_once '../config/database.php';

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

$conn = getDBConnection();

// Get filters from query parameters
$blood_type = $_GET['blood_type'] ?? null;
$city = $_GET['city'] ?? null;
$available = $_GET['available'] ?? null;

// Build query
$sql = "SELECT * FROM donors WHERE 1=1";
$params = [];
$types = "";

if ($blood_type) {
    $sql .= " AND blood_type = ?";
    $params[] = $blood_type;
    $types .= "s";
}

if ($city) {
    $sql .= " AND city LIKE ?";
    $params[] = "%$city%";
    $types .= "s";
}

if ($available !== null) {
    $sql .= " AND is_available = ?";
    $params[] = (int)$available;
    $types .= "i";
}

$sql .= " ORDER BY full_name";

$stmt = $conn->prepare($sql);

if (!empty($params)) {
    $stmt->bind_param($types, ...$params);
}

$stmt->execute();
$result = $stmt->get_result();

$donors = [];
while ($row = $result->fetch_assoc()) {
    // Mask some sensitive information
    unset($row['latitude']);
    unset($row['longitude']);
    $donors[] = $row;
}

jsonResponse(true, 'Donors retrieved successfully', $donors);

$conn->close();
?>