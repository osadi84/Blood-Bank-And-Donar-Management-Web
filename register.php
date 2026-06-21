<?php
require_once '../config/database.php';

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Validate required fields
    $required = ['full_name', 'nic', 'blood_type', 'date_of_birth', 'contact_number'];
    foreach ($required as $field) {
        if (empty($data[$field])) {
            jsonResponse(false, "Field $field is required", null, 400);
        }
    }
    
    $conn = getDBConnection();
    
    // Check if NIC already exists
    $checkStmt = $conn->prepare("SELECT donor_id FROM donors WHERE nic = ?");
    $checkStmt->bind_param("s", $data['nic']);
    $checkStmt->execute();
    
    if ($checkStmt->get_result()->num_rows > 0) {
        jsonResponse(false, 'Donor with this NIC already registered', null, 409);
    }
    
    // Insert donor
    $stmt = $conn->prepare("INSERT INTO donors (
        full_name, nic, blood_type, date_of_birth, gender, 
        contact_number, email, address, city, is_available
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    
    $stmt->bind_param(
        "sssssssssi",
        $data['full_name'],
        $data['nic'],
        $data['blood_type'],
        $data['date_of_birth'],
        $data['gender'] ?? NULL,
        $data['contact_number'],
        $data['email'] ?? NULL,
        $data['address'] ?? NULL,
        $data['city'] ?? NULL,
        $data['is_available'] ?? 1
    );
    
    if ($stmt->execute()) {
        jsonResponse(true, 'Donor registered successfully', [
            'donor_id' => $conn->insert_id
        ], 201);
    } else {
        jsonResponse(false, 'Registration failed: ' . $conn->error, null, 500);
    }
    
    $conn->close();
} else {
    jsonResponse(false, 'Invalid request method', null, 405);
}
?>