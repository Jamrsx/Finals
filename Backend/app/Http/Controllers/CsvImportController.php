<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\StudentDetails;
use App\Models\StudentAcc;
use App\Models\Section;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class CsvImportController extends Controller
{
    private $batchSize = 2000; // Increased batch size for faster processing
    private $chunkSize = 20000; // Process in larger chunks

    private function addCorsHeaders($response)
    {
        return $response->header('Access-Control-Allow-Origin', '*')
                       ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
                       ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    }

    public function upload(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'file' => 'required|mimes:csv,txt|max:2048',
            ]);

            if ($validator->fails()) {
                return $this->addCorsHeaders(response()->json(['error' => $validator->errors()->first()], 422));
            }

            $file = $request->file('file');
            $filename = 'import_' . time() . '_' . uniqid() . '.csv';
            $path = $file->storeAs('imports', $filename);

            return $this->addCorsHeaders(response()->json([
                'message' => 'File uploaded successfully',
                'file_id' => $filename
            ]));
        } catch (\Exception $e) {
            return $this->addCorsHeaders(response()->json(['error' => 'Upload failed: ' . $e->getMessage()], 500));
        }
    }

    public function import(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'file' => 'required|mimes:csv,txt|max:2048',
            ]);

            if ($validator->fails()) {
                return $this->addCorsHeaders(response()->json(['error' => $validator->errors()->first()], 422));
            }

            $path = $request->file('file')->getRealPath();
            $file = fopen($path, 'r');
            $header = fgetcsv($file);

            if (!$header) {
                return $this->addCorsHeaders(response()->json(['error' => 'CSV file is empty'], 422));
            }

            $students = [];
            $errors = [];
            $rowCount = 1;
            $chunk = [];
            $totalRows = 0;

            // Count total rows first
            while (fgetcsv($file)) {
                $totalRows++;
            }
            rewind($file);
            fgetcsv($file); // Skip header again

            // Disable foreign key checks and indexes for faster inserts
            DB::statement('SET FOREIGN_KEY_CHECKS=0;');
            DB::statement('ALTER TABLE student_acc DISABLE KEYS;');
            DB::statement('ALTER TABLE student_details DISABLE KEYS;');
            DB::statement('ALTER TABLE section DISABLE KEYS;');

            // Process in chunks
            while (($row = fgetcsv($file)) !== false) {
                $rowCount++;
                $data = $this->mapRowToData($row);
                
                if ($this->validateRow($data, $rowCount, $errors)) {
                    $chunk[] = $data;
                }

                if (count($chunk) >= $this->chunkSize) {
                    $this->processChunk($chunk, $students, $errors);
                    $chunk = [];
                }
            }

            // Process remaining records
            if (!empty($chunk)) {
                $this->processChunk($chunk, $students, $errors);
            }

            // Re-enable foreign key checks and indexes
            DB::statement('ALTER TABLE student_acc ENABLE KEYS;');
            DB::statement('ALTER TABLE student_details ENABLE KEYS;');
            DB::statement('ALTER TABLE section ENABLE KEYS;');
            DB::statement('SET FOREIGN_KEY_CHECKS=1;');

            fclose($file);

            if (empty($students) && !empty($errors)) {
                return $this->addCorsHeaders(response()->json([
                    'error' => 'No valid records found',
                    'errors' => $errors
                ], 422));
            }

            return $this->addCorsHeaders(response()->json([
                'message' => 'CSV Imported Successfully',
                'imported_count' => count($students),
                'errors' => $errors
            ]));
        } catch (\Exception $e) {
            // Ensure foreign key checks and indexes are re-enabled even if there's an error
            DB::statement('ALTER TABLE student_acc ENABLE KEYS;');
            DB::statement('ALTER TABLE student_details ENABLE KEYS;');
            DB::statement('ALTER TABLE section ENABLE KEYS;');
            DB::statement('SET FOREIGN_KEY_CHECKS=1;');
            
            Log::error('CSV Import Error: ' . $e->getMessage());
            return $this->addCorsHeaders(response()->json(['error' => 'Import failed: ' . $e->getMessage()], 500));
        }
    }

    private function mapRowToData($row)
    {
        return [
            'student_id' => $row[0] ?? '',
            'lname' => $row[1] ?? '',
            'fname' => $row[2] ?? '',
            'mname' => $row[3] ?? '',
            'suffix' => $row[4] ?? '',
            'email' => $row[5] ?? '',
            'Phone_number' => $row[6] ?? '',
            'gender' => $row[7] ?? '',
            'Course' => $row[8] ?? '',
            'yearlevel' => $row[9] ?? '',
            'section' => $row[10] ?? '',
            'Track' => $row[11] ?? '',
        ];
    }

    private function validateRow($data, $rowNumber, &$errors)
    {
        // Custom validation for email to accept 'NONE'
        $email = $data['email'] ?? '';
        if (strtoupper(trim($email)) === 'NONE') {
            $data['email'] = 'none@placeholder.com'; // Set a placeholder email for database
        }

        $validator = Validator::make($data, [
            'student_id' => 'required|unique:student_acc,student_id',
            'lname' => 'required|string',
            'fname' => 'required|string',
            'email' => 'required|email|unique:student_details,email',
            'Phone_number' => 'required|string',
            'gender' => 'required|string',
            'Course' => 'required|string',
            'yearlevel' => 'required|string',
            'section' => 'required|string',
        ]);

        if ($validator->fails()) {
            $errors[] = "Row {$rowNumber}: " . implode(", ", $validator->errors()->all());
            return false;
        }

        return true;
    }

    private function processChunk($chunk, &$students, &$errors)
    {
        // Split chunk into smaller batches
        $batches = array_chunk($chunk, $this->batchSize);
        
        foreach ($batches as $batch) {
            $this->processBatch($batch, $students, $errors);
        }
    }

    private function processBatch($batch, &$students, &$errors)
    {
        try {
            $studentAccs = [];
            $studentDetails = [];
            $sections = [];

            // Prepare data arrays
            foreach ($batch as $data) {
                $studentAccs[] = [
                    'student_id' => $data['student_id'],
                    'password' => Hash::make('123456'),
                    'status' => '1',
                    'created_at' => now(),
                    'updated_at' => now(),
                ];

                $studentDetails[] = [
                    'student_id' => $data['student_id'],
                    'lname' => $data['lname'],
                    'fname' => $data['fname'],
                    'mname' => $data['mname'],
                    'suffix' => $data['suffix'],
                    'email' => $data['email'],
                    'Phone_number' => $data['Phone_number'],
                    'gender' => $data['gender'],
                    'status' => '1',
                    'created_at' => now(),
                    'updated_at' => now(),
                ];

                $sections[] = [
                    'student_id' => $data['student_id'],
                    'Course' => $data['Course'],
                    'yearlevel' => $data['yearlevel'],
                    'section' => $data['section'],
                    'instructor' => null,
                    'Track' => $data['Track'] ?? null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];

                $students[] = $data;
            }

            // Bulk insert using raw queries for better performance
            DB::table('student_acc')->insert($studentAccs);
            DB::table('student_details')->insert($studentDetails);
            DB::table('section')->insert($sections);

        } catch (\Exception $e) {
            $errors[] = "Batch processing error: " . $e->getMessage();
        }
    }

    public function getImportProgress()
    {
        $progress = session('import_progress', 0);
        return response()->json(['progress' => $progress]);
    }
}
