<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\StudentDetails;
use App\Models\StudentAcc;
use App\Models\Section;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class CsvImportController extends Controller
{
    public function import(Request $request)
    {
        // Validate the file
        $validator = Validator::make($request->all(), [
            'file' => 'required|mimes:csv,txt|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 422);
        }

        // Read the file
        $path = $request->file('file')->getRealPath();
        $file = fopen($path, 'r');
        $header = fgetcsv($file); // Skip header row

        $students = [];
        $errors = [];

        DB::beginTransaction();

        try {
            while (($row = fgetcsv($file)) !== false) {
                try {
                    $data = array_combine([
                        'studentId', 'password', 'lname', 'fname', 'mname', 'suffix',
                        'email', 'phone', 'gender', 'course', 'yearlevel', 'section'
                    ], $row);

                    // Validate the data
                    $validator = Validator::make($data, [
                        'studentId' => 'required|unique:student_acc,student_id',
                        'password' => 'required|min:6',
                        'lname' => 'required|string',
                        'fname' => 'required|string',
                        'email' => 'required|email|unique:student_details,email',
                        'phone' => 'required|string',
                        'gender' => 'required|string',
                        'course' => 'required|string',
                        'yearlevel' => 'required|string',
                        'section' => 'required|string',
                    ]);

                    if ($validator->fails()) {
                        $errors[] = "Row " . count($students) + 1 . ": " . implode(", ", $validator->errors()->all());
                        continue;
                    }

                    // Create student account
                    $studentAcc = StudentAcc::create([
                        'student_id' => $data['studentId'],
                        'password' => Hash::make($data['password']),
                        'status' => '1',
                    ]);

                    // Create student details
                    $studentDetails = StudentDetails::create([
                        'student_id' => $data['studentId'],
                        'lname' => $data['lname'],
                        'fname' => $data['fname'],
                        'mname' => $data['mname'],
                        'suffix' => $data['suffix'],
                        'email' => $data['email'],
                        'Phone_number' => $data['phone'],
                        'gender' => $data['gender'],
                        'status' => '1',
                    ]);

                    // Create section
                    Section::create([
                        'student_id' => $data['studentId'],
                        'Course' => $data['course'],
                        'yearlevel' => $data['yearlevel'],
                        'section' => $data['section'],
                        'instructor' => null,
                        'track' => null,
                    ]);

                    $students[] = $data;
                } catch (\Exception $e) {
                    $errors[] = "Row " . count($students) + 1 . ": " . $e->getMessage();
                }
            }

            DB::commit();
            
            return response()->json([
                'success' => 'CSV Imported Successfully.',
                'imported_count' => count($students),
                'errors' => $errors
            ]);
        } catch (\Exception $e) {
            DB::rollback();
            return response()->json(['error' => 'Import failed: ' . $e->getMessage()], 500);
        }
    }
}
