<?php
require_once 'database.php';

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

$conn = getDBConnection();

$tracking = [];

// Use donor geolocation if available
$sql = "SELECT donor_id, full_name, blood_type, city, address, latitude, longitude, is_available, last_donation_date FROM donors WHERE latitude IS NOT NULL AND longitude IS NOT NULL";
$result = $conn->query($sql);

if ($result && $result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $status = $row['is_available'] ? 'active' : 'delivered';
        $tracking[] = [
            'id' => $row['donor_id'],
            'type' => 'donor',
            'status' => $status,
            'bloodType' => $row['blood_type'] ?? 'O+',
            'hospital' => $row['full_name'] ?? 'Donor',
            'location' => [floatval($row['latitude']), floatval($row['longitude'])],
            'distance' => 'Unknown',
            'eta' => $status === 'active' ? 'Pending' : 'Completed',
            'address' => $row['address'] ?: $row['city'] ?: 'Sri Lanka',
            'timestamp' => date('c')
        ];
    }
}

// Fallback sample data if no live locations are available
if (empty($tracking)) {
    $tracking = [
        [
            'id' => 1,
            'type' => 'emergency',
            'status' => 'active',
            'bloodType' => 'O+',
            'hospital' => 'Colombo Teaching Hospital',
            'location' => [6.9271, 80.7789],
            'distance' => '2.5 km',
            'eta' => '5 mins',
            'address' => '9 Regent Street, Colombo',
            'timestamp' => date('c', time() - 300)
        ],
        [
            'id' => 2,
            'type' => 'delivery',
            'status' => 'transit',
            'bloodType' => 'B-',
            'hospital' => 'National Hospital',
            'location' => [6.9320, 80.7700],
            'distance' => '4.2 km',
            'eta' => '12 mins',
            'address' => 'Colombo Fort, Colombo',
            'timestamp' => date('c', time() - 600)
        ],
        [
            'id' => 3,
            'type' => 'emergency',
            'status' => 'delivered',
            'bloodType' => 'A+',
            'hospital' => 'Elpitiya Hospital',
            'location' => [6.9400, 80.7850],
            'distance' => '1.8 km',
            'eta' => 'Delivered',
            'address' => 'Galle Road, Colombo',
            'timestamp' => date('c', time() - 1800)
        ]
    ];
}

jsonResponse(true, 'Tracking data retrieved successfully', $tracking);

$conn->close();
?>