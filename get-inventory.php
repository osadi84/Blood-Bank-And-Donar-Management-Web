<?php
require_once '../config/database.php';

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

$conn = getDBConnection();

// Get current inventory summary
$sql = "SELECT 
    blood_type,
    SUM(CASE WHEN status = 'available' AND expiry_date > CURDATE() THEN quantity ELSE 0 END) as quantity
FROM blood_inventory 
GROUP BY blood_type";

$result = $conn->query($sql);

$inventory = [];
while ($row = $result->fetch_assoc()) {
    $inventory[] = $row;
}

// Add missing blood types with zero quantity
$all_types = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
foreach ($all_types as $type) {
    $found = false;
    foreach ($inventory as $item) {
        if ($item['blood_type'] === $type) {
            $found = true;
            break;
        }
    }
    if (!$found) {
        $inventory[] = ['blood_type' => $type, 'quantity' => 0];
    }
}

jsonResponse(true, 'Inventory retrieved successfully', $inventory);

$conn->close();
?>