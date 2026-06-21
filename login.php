<?php
require_once '../config/database.php';

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $email = sanitizeInput($data['email']);
    $password = $data['password'];
    
    $conn = getDBConnection();
    
    // Check user exists
    $stmt = $conn->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 1) {
        $user = $result->fetch_assoc();
        
        // Verify password
        if (password_verify($password, $user['password'])) {
            // Generate token (simplified)
            $token = bin2hex(random_bytes(32));
            
            // Update token in database
            $updateStmt = $conn->prepare("UPDATE users SET token = ? WHERE id = ?");
            $updateStmt->bind_param("si", $token, $user['id']);
            $updateStmt->execute();
            
            jsonResponse(true, 'Login successful', [
                'token' => $token,
                'user_type' => $user['user_type'],
                'user_id' => $user['id']
            ]);
        } else {
            jsonResponse(false, 'Invalid credentials', null, 401);
        }
    } else {
        jsonResponse(false, 'User not found', null, 404);
    }
    
    $conn->close();
} else {
    jsonResponse(false, 'Invalid request method', null, 405);
}
?>