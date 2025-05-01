<?php

namespace App\Http\Controllers;

use App\Models\Tracks;
use App\Models\instructor;
use App\Models\StudentAcc;
use App\Models\Coordinator;
use Illuminate\Http\Request;
use App\Models\StudentDetails;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class CoordinatorController extends Controller
{
    //==============================ADD STUDENT DETAILS AND ACCOUNT===============================
    public function storeStudent(Request $request)
    {
        // Validate input
        $validatedData = $request->validate([
            'student_id' => 'required|unique:student_acc,student_id',
            'password' => 'required|min:6',
            'lname' => 'required|string',
            'fname' => 'required|string',
            'mname' => 'nullable|string',
            'suffix' => 'nullable|string',
            'email' => 'required|email|unique:student_details,email',
            'Phone_number' => 'required|string',
            'gender' => 'required|string',
        ]);

        DB::beginTransaction();

        try {
            //Create student account
            $studentAcc = StudentAcc::create([
                'student_id' => $validatedData['student_id'],
                'password' => Hash::make($validatedData['password']),
                'status' => '1',
            ]);

            //Create student details
            $studentDetails = StudentDetails::create([
                'student_id' => $validatedData['student_id'],
                'lname' => $validatedData['lname'],
                'fname' => $validatedData['fname'],
                'mname' => $validatedData['mname'],
                'suffix' => $validatedData['suffix'],
                'email' => $validatedData['email'],
                'Phone_number' => $validatedData['Phone_number'],
                'gender' => $validatedData['gender'],
                'status' => '1',
            ]);

            DB::commit();

            return response()->json(['message' => 'Student successfully added.'], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Failed to save student. ' . $e->getMessage()], 500);
        }
    }
    //==============================END ADD STUDENT DETAILS AND ACCOUNT===============================

    //==============================ADD TRACK===============================

    public function addTrack(Request $request)
    {
        $validatedData = $request->validate([

            'track_id' => 'required',
            'track_name' => 'required|string',
            'description' => 'required|string',
        ]);

        DB::beginTransaction();

        try {
            $track = Tracks::create([
                'track_id' => $validatedData['track_id'],
                'track_name' => $validatedData['track_name'],
                'description' => $validatedData['description'],
            ]);


            DB::commit();

            return response()->json(['message' => 'Track successfully added.'], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Failed to save Track. ' . $e->getMessage()], 500);
        }
    }

    //Show Track
    public function showTracks()
    {
        try {
            $tracks = Tracks::all(); // fetch all tracks
            return response()->json($tracks, 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to fetch tracks. ' . $e->getMessage()], 500);
        }
    }

    //Update Track
    public function updateTrack(Request $request, $id)
    {
        $validatedData = $request->validate([
            'track_name' => 'sometimes|string',
            'description' => 'sometimes|string',
        ]);

        try {
            $track = Tracks::where('track_id', $id)->first();

            if (!$track) {
                return response()->json(['message' => 'Track not found'], 404);
            }

            $track->update($validatedData);

            return response()->json([
                'message' => 'Track updated successfully.',
                'data' => $track
            ], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to update track. ' . $e->getMessage()], 500);
        }
    }
    //Delete Track
    public function deleteTrack($id)
    {
        try {
            $track = Tracks::where('track_id', $id)->first();

            if (!$track) {
                return response()->json(['message' => 'Track not found'], 404);
            }

            $track->delete();

            return response()->json(['message' => 'Track deleted successfully.'], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to delete track. ' . $e->getMessage()], 500);
        }
    }


    //==============================END ADD TRACK================================

    //==============================ADD INSTRUCTOR===============================
    public function addInstructor(Request $request)
    {
        $validatedData = $request->validate([

            'instructor_id' => 'required',
            'lname' => 'required|string',
            'fname' => 'required|string',
            'email' => 'required|string',
            'phone' => 'required|string',
        ]);

        DB::beginTransaction();

        try {
            $track = instructor::create([
                'instructor_id' => $validatedData['instructor_id'],
                'lname' => $validatedData['lname'],
                'fname' => $validatedData['fname'],
                'email' => $validatedData['email'],
                'phone' => $validatedData['phone'],
            ]);


            DB::commit();

            return response()->json(['message' => 'Instructor successfully added.'], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Failed to save Instructor. ' . $e->getMessage()], 500);
        }
    }
    public function showInstructorById($id)
    {
        try {
            $instructor = Instructor::where('instructor_id', $id)->first();

            if (!$instructor) {
                return response()->json(['message' => 'Instructor not found'], 404);
            }

            return response()->json($instructor, 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to fetch instructor. ' . $e->getMessage()], 500);
        }
    }

    public function updateInstructor(Request $request, $id)
    {
        $validatedData = $request->validate([
            'lname' => 'sometimes|string',
            'fname' => 'sometimes|string',
            'email' => 'sometimes|email',
            'phone' => 'sometimes|string',
        ]);

        try {
            $instructor = Instructor::where('instructor_id', $id)->first();

            if (!$instructor) {
                return response()->json(['message' => 'Instructor not found'], 404);
            }

            $instructor->update($validatedData);

            return response()->json([
                'message' => 'Instructor updated successfully.',
                'data' => $instructor
            ], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to update instructor. ' . $e->getMessage()], 500);
        }
    }

    public function deleteInstructor($id)
    {
        try {
            $instructor = Instructor::where('instructor_id', $id)->first();

            if (!$instructor) {
                return response()->json(['message' => 'Instructor not found'], 404);
            }

            $instructor->delete();

            return response()->json(['message' => 'Instructor deleted successfully.'], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to delete instructor. ' . $e->getMessage()], 500);
        }
    }


    //==============================END ADD INSTRUCTOR===============================

    public function loginCoordinator(Request $request)
    {
        $validatedData = $request->validate([
            'coordinator_id' => 'required',
            'password' => 'required|string',
        ]);
    
        try {
    
            $coordinator = Coordinator::where('coordinator_id', $validatedData['coordinator_id'])->first();
    
            if (!$coordinator) {
                return response()->json(['error' => 'Coordinator not found.'], 404);
            }
    
            if (!Hash::check($validatedData['password'], $coordinator->password)) {
                return response()->json(['error' => 'Invalid password.'], 401);
            }
    
            return response()->json([
                'message' => 'Login successful',
                'coordinator' => $coordinator,
            ], 200);
    
        } catch (\Exception $e) {
            return response()->json(['error' => 'Login failed. ' . $e->getMessage()], 500);
        }
    }
    
}
