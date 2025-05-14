<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\StudentAcc;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class StudentController extends Controller
{
    public function login(Request $request)
    {
        try {
            $request->validate([
                'student_id' => 'required|string',
                'password' => 'required|string',
            ]);

            Log::info('Login attempt for student ID: ' . $request->student_id);

            $student = StudentAcc::where('student_id', $request->student_id)
                ->where('status', '1')
                ->first();

            if (!$student) {
                Log::warning('Student not found or inactive: ' . $request->student_id);
                return response()->json([
                    'status' => 'error',
                    'message' => 'Student ID not found or account is inactive'
                ], 404);
            }

            Log::info('Student found, checking password');

            // Check if password matches (either hashed or plain text)
            if ($student->password === $request->password || Hash::check($request->password, $student->password)) {
                Log::info('Password match successful for student: ' . $request->student_id);
                return response()->json([
                    'status' => 'success',
                    'data' => [
                        'student_id' => $student->student_id,
                        'full_name' => $student->full_name,
                    ]
                ]);
            }

            Log::warning('Invalid password for student: ' . $request->student_id);
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid password'
            ], 401);

        } catch (\Exception $e) {
            Log::error('Login error: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'An error occurred during login: ' . $e->getMessage()
            ], 500);
        }
    }
}
